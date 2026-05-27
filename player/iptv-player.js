const video = document.getElementById('video');
const channelList = document.getElementById('channelList');
const searchInput = document.getElementById('searchInput');
const loadPlaylistBtn = document.getElementById('loadPlaylistBtn');
const loadFileBtn = document.getElementById('loadFileBtn');
const playlistUrlInput = document.getElementById('playlistUrlInput');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const startScreen = document.getElementById('startScreen');
const channelCount = document.getElementById('channelCount');
const epgPanel = document.getElementById('epgPanel');
const epgContent = document.getElementById('epgContent');
const epgTitle = document.getElementById('epgTitle');
const epgCloseBtn = document.getElementById('epgCloseBtn');
const settingsBtn = document.getElementById('settingsBtn');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const errorCloseBtn = document.getElementById('errorCloseBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

let channels = [];
let epgData = null;
let mergedProgrammes = [];
let currentChannelIndex = -1;
let hlsInstance = null;
let shakaPlayer = null;
let playerControls = null;
let epgCache = {};

function parseM3U(content, url) {
  const lines = content.split('\n');
  const result = [];
  let currentExtinf = null;
  let currentClearkey = null;
  let globalTvg = '';
  let globalEpgUrls = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTM3U')) {
      const tvgMatch = line.match(/(?:url-tvg|x-tvg-url)\s*=\s*["']([^"']+)["']/);
      if (tvgMatch) {
        globalEpgUrls = tvgMatch[1].split(',').map(u => u.trim()).filter(Boolean);
      }
      continue;
    }

    if (line.startsWith('#KODIPROP:') || line.startsWith('#EXTVLCOPT:')) {
      if (line.includes('license_type=clearkey')) {
        currentClearkey = {};
      }
      if (line.includes('license_key=')) {
        const keyData = line.split('=').slice(1).join('=').replace(/"/g, '').trim();
        if (keyData.includes(':')) {
          const parts = keyData.split(':');
          currentClearkey = currentClearkey || {};
          currentClearkey[parts[0]] = parts[1];
        } else if (keyData.startsWith('http')) {
          currentClearkey = currentClearkey || {};
          currentClearkey._url = keyData;
        }
      }
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      const durationMatch = line.match(/#EXTINF:\s*(-?\d+\.?\d*)/);
      const duration = durationMatch ? durationMatch[1] : '-1';

      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);

      const namePart = line.split(',');
      const name = namePart.length > 1 ? namePart.pop().trim() : 'Unknown';

      const epgShiftMatch = line.match(/tvg-epgshift="([^"]*)"/);
      const bufferMatch = line.match(/player-buffer="([^"]*)"/);

      currentExtinf = {
        duration,
        name,
        tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
        tvgName: tvgNameMatch ? tvgNameMatch[1] : '',
        tvgLogo: tvgLogoMatch ? tvgLogoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : '',
        epgShift: epgShiftMatch ? parseFloat(epgShiftMatch[1]) : 0,
        buffer: bufferMatch ? parseInt(bufferMatch[1]) : 0,
        epgUrls: globalEpgUrls.length > 0 ? [...globalEpgUrls] : []
      };
      continue;
    }

    if (line && !line.startsWith('#') && line.startsWith('http')) {
      if (currentExtinf) {
        currentExtinf.url = line;
        currentExtinf.clearkey = currentClearkey ? { ...currentClearkey } : null;
        result.push(currentExtinf);
        currentExtinf = null;
        currentClearkey = null;
      }
    }
  }

  return result;
}

function parseEPGText(xmlText) {
  const programmes = [];
  const lines = xmlText.split('\n');
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('<programme')) {
      current = { title: '', desc: '', channel: '', start: '', stop: '' };
      const ch = line.match(/channel\s*=\s*["']([^"']+)["']/);
      const st = line.match(/start\s*=\s*["']([^"']+)["']/);
      const sp = line.match(/stop\s*=\s*["']([^"']+)["']/);
      if (ch) current.channel = ch[1].replace(/&amp;/g, '&');
      if (st) current.start = st[1];
      if (sp) current.stop = sp[1];
    }

    if (current) {
      const titleMatch = line.match(/<title[^>]*>(.*?)<\/title>/);
      if (titleMatch) current.title = titleMatch[1].trim();
      const descMatch = line.match(/<desc[^>]*>(.*?)<\/desc>/);
      if (descMatch) current.desc = descMatch[1].trim();
    }

    if (line.includes('</programme>') && current) {
      if (current.channel) programmes.push(current);
      current = null;
    }
  }
  return programmes;
}

async function parseEPG(url) {
  if (epgCache[url]) return epgCache[url];
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('EPG fetch failed:', url, resp.status);
      return [];
    }
    const buffer = await resp.arrayBuffer();
    let text;

    const header = new Uint8Array(buffer.slice(0, 2));
    if (header[0] === 0x1f && header[1] === 0x8b) {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      writer.write(new Uint8Array(buffer));
      writer.close();
      const reader = ds.readable.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      text = new TextDecoder('utf-8').decode(combined);
    } else {
      text = new TextDecoder('utf-8').decode(buffer);
    }

    const programmes = parseEPGText(text);
    epgCache[url] = programmes;
    console.log(`EPG parsed: ${programmes.length} programmes from`, url);
    return programmes;
  } catch (e) {
    console.warn('EPG parse error:', url, e);
    return [];
  }
}

function getEPGForChannel(channelId, programmes) {
  if (!programmes || programmes.length === 0) return [];
  const now = new Date();
  const channelProgs = programmes.filter(p => p.channel === channelId);

  return channelProgs.map(p => {
    const startDate = parseEPGDate(p.start);
    const stopDate = parseEPGDate(p.stop);
    return {
      title: p.title,
      desc: p.desc,
      start: startDate,
      stop: stopDate,
      isCurrent: startDate <= now && (!stopDate || stopDate > now)
    };
  }).filter(p => p.start).sort((a, b) => a.start - b.start);
}

function normalizeKey(key) {
  return key.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
}

function parseEPGDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
  if (match) {
    const d = new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
      parseInt(match[4]),
      parseInt(match[5]),
      parseInt(match[6])
    );
    if (match[7]) {
      const tz = parseInt(match[7]);
      const tzHours = Math.floor(tz / 100);
      const tzMins = tz % 100;
      d.setMinutes(d.getMinutes() - (tzHours * 60 + (tzHours < 0 ? -tzMins : tzMins)));
    }
    return d;
  }
  try { return new Date(dateStr); } catch (e) { return null; }
}

function renderChannelList(filter = '') {
  const filtered = filter
    ? channels.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.group.toLowerCase().includes(filter.toLowerCase())
      )
    : channels;

  channelList.innerHTML = '';
  filtered.forEach((ch, idx) => {
    const realIdx = channels.indexOf(ch);
    const item = document.createElement('div');
    item.className = 'channel-item' + (realIdx === currentChannelIndex ? ' active' : '');
    item.innerHTML = `
      <img class="channel-logo" src="${ch.tvgLogo || 'tv-icon.png'}" alt="" loading="lazy"
        onerror="this.src='tv-icon.png'">
      <div class="channel-info">
        <div class="channel-name">${ch.name}</div>
        <div class="channel-group">${ch.group || 'General'}</div>
      </div>
    `;
    item.addEventListener('click', () => playChannel(realIdx));
    channelList.appendChild(item);
  });

  channelCount.textContent = `${channels.length} channels`;
}

function showError(msg) {
  errorOverlay.style.display = 'block';
  errorMessage.textContent = msg;
}

function hideError() {
  errorOverlay.style.display = 'none';
}

async function playChannel(index) {
  if (index < 0 || index >= channels.length) return;
  currentChannelIndex = index;
  const ch = channels[index];

  if (playerControls) {
    playerControls.destroy();
    playerControls = null;
  }

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (shakaPlayer) {
    try {
      await shakaPlayer.destroy();
    } catch (e) {}
    shakaPlayer = null;
  }

  startScreen.style.display = 'none';
  renderChannelList(searchInput.value);

  const url = ch.url;
  const isM3U8 = url.includes('.m3u8');
  const isMPD = url.includes('.mpd');

  let clearkey = ch.clearkey || null;
  if (clearkey && clearkey._url) {
    try {
      const resp = await fetch(clearkey._url);
      const text = await resp.text();
      try {
        const json = JSON.parse(text);
        clearkey = {};
        for (const [k, v] of Object.entries(json)) {
          clearkey[k.replace(/-/g, '').toLowerCase()] = String(v).replace(/-/g, '').toLowerCase();
        }
      } catch (e) {
        if (text.includes(':')) {
          clearkey = {};
          text.split('\n').forEach(line => {
            const parts = line.trim().split(':');
            if (parts.length === 2) clearkey[parts[0]] = parts[1];
          });
        }
      }
    } catch (e) {
      clearkey = null;
    }
  }

  if (isM3U8) {
    if (Hls.isSupported()) {
      hlsInstance = new Hls();
      if (ch.buffer > 0) {
        hlsInstance.config.maxBufferLength = ch.buffer;
      }
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
    }
  } else if (isMPD) {
    shaka.polyfill.installAll();
    shakaPlayer = new shaka.Player(video);
    hideError();
    shakaPlayer.addEventListener('error', (event) => {
      showError('Shaka Player: ' + (event.detail?.message || 'Unknown error'));
    });
    const config = {};
    if (clearkey) {
      const clearKeys = {};
      for (const [kid, key] of Object.entries(clearkey)) {
        if (kid !== '_url') {
          clearKeys[normalizeKey(kid)] = normalizeKey(key);
        }
      }
      if (Object.keys(clearKeys).length > 0) {
        config.drm = { clearKeys };
      }
    }
    if (Object.keys(config).length > 0) shakaPlayer.configure(config);
    try {
      await shakaPlayer.load(url);
      hideError();
      video.play().catch(() => {});
    } catch (e) {
      showError('Shaka error: ' + e.message);
    }
  } else {
    video.src = url;
    video.play().catch(() => {});
  }

  const controlsContainer = document.getElementById('customControlsContainer');
  if (controlsContainer && typeof PlayerControls !== 'undefined') {
    playerControls = new PlayerControls(video, shakaPlayer || hlsInstance, controlsContainer);
  }

  if (ch.tvgId && mergedProgrammes.length > 0) {
    const epg = getEPGForChannel(ch.tvgId, mergedProgrammes);
    if (epg.length > 0) {
      showEPG(ch.name, epg);
    } else {
      if (ch.tvgName) {
        const byName = getEPGForChannel(ch.tvgName, mergedProgrammes);
        if (byName.length > 0) {
          showEPG(ch.name, byName);
        } else {
          hideEPG();
        }
      } else {
        hideEPG();
      }
    }
  } else {
    hideEPG();
  }
}

function showEPG(title, programmes) {
  if (!programmes || programmes.length === 0) {
    hideEPG();
    return;
  }
  const now = new Date();
  const currentIdx = programmes.findIndex(p => p.isCurrent);
  const startIdx = Math.max(0, currentIdx - 1);
  const display = programmes.slice(startIdx, startIdx + 8);

  epgTitle.textContent = `EPG: ${title}`;
  epgContent.innerHTML = display.map(p => {
    const startTime = p.start ? p.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const stopTime = p.stop ? p.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="epg-item${p.isCurrent ? ' current' : ''}">
      <span class="epg-time">${startTime} - ${stopTime}</span>
      <span class="epg-title">${p.title || 'No title'}</span>
      ${p.desc ? `<br><span class="epg-desc">${p.desc}</span>` : ''}
    </div>`;
  }).join('');
  epgPanel.style.display = 'block';
}

function hideEPG() {
  epgPanel.style.display = 'none';
}

async function loadAllEPGs(epgUrls) {
  const allProgrammes = [];
  const uniqueUrls = [...new Set(epgUrls)];
  for (const url of uniqueUrls) {
    try {
      const progs = await parseEPG(url);
      allProgrammes.push(...progs);
    } catch (e) {
      console.warn('Failed to load EPG:', url, e);
    }
  }
  mergedProgrammes = allProgrammes;
  return allProgrammes;
}

async function loadPlaylist(url) {
  loadingOverlay.style.display = 'flex';
  try {
    channels = [];
    mergedProgrammes = [];
    epgCache = {};

    const resp = await fetch(url);
    const content = await resp.text();
    channels = parseM3U(content, url);

    const epgUrls = new Set();
    try {
      const urlParams = new URL(url).searchParams;
      const urlEpg = urlParams.get('epg') || urlParams.get('url-tvg');
      if (urlEpg) {
        urlEpg.split(',').forEach(u => epgUrls.add(u.trim()));
      }
    } catch (e) {}
    channels.forEach(ch => ch.epgUrls.forEach(u => epgUrls.add(u)));

    renderChannelList();

    if (epgUrls.size > 0) {
      updateEPGStatus(`Loading EPG (${epgUrls.size} source${epgUrls.size > 1 ? 's' : ''})...`);
      await loadAllEPGs([...epgUrls]);
      if (mergedProgrammes.length > 0) {
        updateEPGStatus(`EPG: ${mergedProgrammes.length} programmes`);
      } else {
        updateEPGStatus('EPG: no programmes found');
      }
    } else {
      updateEPGStatus('No EPG sources');
    }

    if (channels.length > 0) {
      await playChannel(0);
    }

    loadingOverlay.style.display = 'none';
    return true;
  } catch (e) {
    console.error('Failed to load playlist:', e);
    updateEPGStatus('Failed to load playlist');
    loadingOverlay.style.display = 'none';
    return false;
  }
}

function updateEPGStatus(msg) {
  const el = document.getElementById('epgStatus');
  if (el) el.textContent = msg;
}

async function loadFromHash() {
  const hash = window.location.hash.substring(1);
  if (hash && hash.startsWith('http')) {
    playlistUrlInput.value = hash;
    await loadPlaylist(hash);
  }
}

function handleFileUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.m3u,.m3u8,audio/x-mpegurl';
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const content = await file.text();
    channels = parseM3U(content, URL.createObjectURL(file));
    renderChannelList();
    if (channels.length > 0) playChannel(0);
  });
  input.click();
}

searchInput.addEventListener('input', (e) => {
  renderChannelList(e.target.value);
});

loadPlaylistBtn.addEventListener('click', handleFileUpload);
loadFileBtn.addEventListener('click', handleFileUpload);

loadUrlBtn.addEventListener('click', async () => {
  const url = playlistUrlInput.value.trim();
  if (url) {
    await loadPlaylist(url);
  }
});

playlistUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadUrlBtn.click();
});

epgCloseBtn.addEventListener('click', hideEPG);

settingsBtn.addEventListener('click', () => {
  const url = window.location.href.replace('iptv/player.html', 'pages/settings.html');
  window.location.href = url;
});

errorCloseBtn.addEventListener('click', hideError);

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    if (video.paused) video.play().catch(() => {}); else video.pause();
  }
  if (e.code === 'ArrowUp' && currentChannelIndex > 0) {
    e.preventDefault();
    playChannel(currentChannelIndex - 1);
  }
  if (e.code === 'ArrowDown' && currentChannelIndex < channels.length - 1) {
    e.preventDefault();
    playChannel(currentChannelIndex + 1);
  }
});

document.addEventListener('DOMContentLoaded', loadFromHash);
