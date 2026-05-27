const video = document.getElementById('video');
const channelList = document.getElementById('channelList');
const searchInput = document.getElementById('searchInput');
const loadPlaylistBtn = document.getElementById('loadPlaylistBtn');
const loadFileBtn = document.getElementById('loadFileBtn');
const playlistUrlInput = document.getElementById('playlistUrlInput');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const startScreen = document.getElementById('startScreen');
const channelCount = document.getElementById('channelCount');
const settingsBtn = document.getElementById('settingsBtn');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const errorCloseBtn = document.getElementById('errorCloseBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

let channels = [];
let epgData = null;
let mergedProgrammes = [];
let currentChannelIndex = -1;
let currentChannel = null;
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
        logo: tvgLogoMatch ? tvgLogoMatch[1] : '',
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

  function decodeHTMLEntities(text) {
    if (!text) return '';
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/Â¿/g, '¿')
      .replace(/Â¡/g, '¡')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã'/g, 'Ñ')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã/g, 'Á')
      .replace(/Ã‰/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã"/g, 'Ó')
      .replace(/Ãš/g, 'Ú');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('<programme')) {
      current = { title: '', desc: '', channel: '', start: '', stop: '' };
      const ch = line.match(/channel\s*=\s*["']([^"']+)["']/);
      const st = line.match(/start\s*=\s*["']([^"']+)["']/);
      const sp = line.match(/stop\s*=\s*["']([^"']+)["']/);
      if (ch) current.channel = decodeHTMLEntities(ch[1]);
      if (st) current.start = st[1];
      if (sp) current.stop = sp[1];
    }

    if (current) {
      const titleMatch = line.match(/<title[^>]*>(.*?)<\/title>/);
      if (titleMatch) current.title = decodeHTMLEntities(titleMatch[1].trim());
      const descMatch = line.match(/<desc[^>]*>(.*?)<\/desc>/);
      if (descMatch) current.desc = decodeHTMLEntities(descMatch[1].trim());
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
      const preview = new TextDecoder('utf-8').decode(buffer.slice(0, 500));
      const encodingMatch = preview.match(/encoding\s*=\s*["']([^"']+)["']/i);
      let encoding = 'utf-8';
      if (encodingMatch) {
        encoding = encodingMatch[1].toLowerCase();
        if (encoding === 'iso-8859-1' || encoding === 'latin1' || encoding === 'latin-1') {
          encoding = 'iso-8859-1';
        }
      }
      try {
        text = new TextDecoder(encoding).decode(buffer);
      } catch (e) {
        text = new TextDecoder('utf-8').decode(buffer);
      }
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
  if (dateStr instanceof Date) return dateStr;
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

function renderChannelList() {
  const list = document.getElementById('channelList');
  const search = document.getElementById('searchInput');
  const filter = (search?.value || '').toLowerCase();

  const filtered = channels.filter(ch =>
    ch.name.toLowerCase().includes(filter) ||
    (ch.group || '').toLowerCase().includes(filter)
  );

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>No channels found</div>
        <div class="hint">${channels.length === 0 ? 'Load a playlist to get started' : 'Try a different search'}</div>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(ch => {
    const currentProg = getCurrentProgram(ch);
    const nowPlaying = currentProg ? currentProg.title : '';
    
    return `
      <div class="channel-item ${currentChannel && currentChannel.url === ch.url ? 'active' : ''}" 
           data-url="${ch.url}" 
           data-channel-index="${channels.indexOf(ch)}">
        ${ch.logo ? `<img class="channel-logo" src="${ch.logo}" alt="" loading="lazy" onerror="this.style.display='none'">` : '<div class="channel-logo-placeholder"></div>'}
        <div class="channel-info">
          <div class="channel-name">${ch.name}</div>
          ${ch.group ? `<div class="channel-group">${ch.group}</div>` : ''}
          ${nowPlaying ? `<div class="channel-now">${nowPlaying}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.channel-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.channelIndex);
      if (!isNaN(idx) && channels[idx]) {
        playChannel(idx);
      }
    });
    
    el.addEventListener('mouseenter', () => {
      const idx = parseInt(el.dataset.channelIndex);
      if (!isNaN(idx) && channels[idx]) {
        showEpgTooltip(channels[idx], el);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      hideEpgTooltip();
    });
  });

  // Update channel count
  const countEl = document.getElementById('channelCount');
  if (countEl) countEl.textContent = `${channels.length} channels`;
}

function showError(msg) {
  if (errorOverlay) errorOverlay.style.display = 'block';
  if (errorMessage) errorMessage.textContent = msg;
}

function hideError() {
  if (errorOverlay) errorOverlay.style.display = 'none';
}

function showLoading() {
  if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.style.display = 'none';
}

async function playChannel(index) {
  if (index < 0 || index >= channels.length) return;
  currentChannelIndex = index;
  const ch = channels[index];
  currentChannel = ch;

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

  if (startScreen) startScreen.style.display = 'none';
  renderChannelList();

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

  showLoading();
  hideError();

  try {
    if (isM3U8) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls();
        if (ch.buffer > 0) {
          hlsInstance.config.maxBufferLength = ch.buffer;
        }
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          hideLoading();
          video.play().catch(() => {});
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            hideLoading();
            showError('HLS Error: ' + data.type);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => hideLoading(), { once: true });
        video.play().catch(() => {});
      }
    } else if (isMPD) {
      if (typeof shaka !== 'undefined') {
        shaka.polyfill.installAll();
        shakaPlayer = new shaka.Player(video);
        hideError();
        shakaPlayer.addEventListener('error', (event) => {
          hideLoading();
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
        await shakaPlayer.load(url);
        hideLoading();
        hideError();
        video.play().catch(() => {});
      }
    } else {
      video.src = url;
      video.addEventListener('loadedmetadata', () => hideLoading(), { once: true });
      video.play().catch(() => {});
    }
  } catch (e) {
    hideLoading();
    showError('Error: ' + e.message);
  }

  const controlsContainer = document.getElementById('controlsContainer');
  if (controlsContainer && typeof PlayerControls !== 'undefined') {
    playerControls = new PlayerControls(video, shakaPlayer || hlsInstance, controlsContainer);
  }

  // Show channel overlay
  showChannelOverlay(ch);
}

// ============================================
// CHANNEL OVERLAY (Logo + Name + Current Program)
// ============================================

let channelOverlayTimer = null;

function showChannelOverlay(channel) {
  const overlay = document.getElementById('channelOverlay');
  const logo = document.getElementById('channelOverlayLogo');
  const name = document.getElementById('channelOverlayName');
  const program = document.getElementById('channelOverlayProgram');
  
  if (!overlay) return;
  
  if (channel.logo) {
    logo.src = channel.logo;
    logo.style.display = 'block';
  } else {
    logo.style.display = 'none';
  }
  
  name.textContent = channel.name || 'Unknown Channel';
  
  const currentProg = getCurrentProgram(channel);
  if (currentProg) {
    program.textContent = currentProg.title;
  } else {
    program.textContent = '';
  }
  
  overlay.classList.add('visible');
  
  clearTimeout(channelOverlayTimer);
  channelOverlayTimer = setTimeout(() => {
    overlay.classList.remove('visible');
  }, 5000);
}

function hideChannelOverlay() {
  const overlay = document.getElementById('channelOverlay');
  if (overlay) overlay.classList.remove('visible');
  clearTimeout(channelOverlayTimer);
}

function getCurrentProgram(channel) {
  if (!channel) return null;
  
  const channelId = channel.tvgId || channel.tvgName || channel.name;
  const epgList = getEPGForChannel(channelId, mergedProgrammes);
  
  if (!epgList || epgList.length === 0) return null;
  
  const now = new Date();
  for (const prog of epgList) {
    const start = prog.start instanceof Date ? prog.start : parseEPGDate(prog.start);
    const stop = prog.stop instanceof Date ? prog.stop : parseEPGDate(prog.stop);
    if (start && stop && now >= start && now < stop) {
      return prog;
    }
  }
  return null;
}

// ============================================
// EPG TOOLTIP (on hover in sidebar)
// ============================================

let epgTooltip = null;
let epgTooltipTimeout = null;

function createEpgTooltip() {
  if (epgTooltip) return epgTooltip;
  
  epgTooltip = document.createElement('div');
  epgTooltip.className = 'epg-tooltip';
  epgTooltip.id = 'epgTooltip';
  document.body.appendChild(epgTooltip);
  
  return epgTooltip;
}

function showEpgTooltip(channel, anchorElement) {
  const tooltip = createEpgTooltip();
  
  const channelId = channel.tvgId || channel.tvgName || channel.name;
  let epgList = getEPGForChannel(channelId, mergedProgrammes);
  
  let html = `<div class="epg-tooltip-header">EPG: ${escapeHtml(channel.name)}</div>`;
  html += '<div class="epg-tooltip-content">';
  
  if (!epgList || epgList.length === 0) {
    html += '<div class="epg-tooltip-empty">No program info available</div>';
  } else {
    const programs = epgList.slice(0, 10);
    
    for (const prog of programs) {
      const start = prog.start instanceof Date ? prog.start : parseEPGDate(prog.start);
      const stop = prog.stop instanceof Date ? prog.stop : parseEPGDate(prog.stop);
      const isCurrent = prog.isCurrent || (start && stop && new Date() >= start && new Date() < stop);
      
      const timeStr = formatEPGTime(start) + ' - ' + formatEPGTime(stop);
      
      html += `
        <div class="epg-tooltip-item ${isCurrent ? 'current' : ''}">
          <span class="epg-tooltip-time">${timeStr}</span>
          <span class="epg-tooltip-title">${escapeHtml(prog.title)}</span>
        </div>
      `;
    }
  }
  html += '</div>';
  
  tooltip.innerHTML = html;
  
  const rect = anchorElement.getBoundingClientRect();
  
  let top = rect.top;
  let left = rect.right + 10;
  
  if (top + 300 > window.innerHeight) {
    top = window.innerHeight - 310;
  }
  if (top < 10) top = 10;
  
  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
  
  clearTimeout(epgTooltipTimeout);
  tooltip.classList.add('visible');
}

function hideEpgTooltip() {
  clearTimeout(epgTooltipTimeout);
  epgTooltipTimeout = setTimeout(() => {
    if (epgTooltip) {
      epgTooltip.classList.remove('visible');
    }
  }, 100);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatEPGTime(date) {
  if (!date) return '--:--';
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return h + ':' + m;
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
  showLoading();
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
        renderChannelList(); // Re-render to show now playing
      } else {
        updateEPGStatus('EPG: no programmes found');
      }
    } else {
      updateEPGStatus('No EPG sources');
    }

    if (channels.length > 0) {
      await playChannel(0);
    }

    hideLoading();
    return true;
  } catch (e) {
    console.error('Failed to load playlist:', e);
    updateEPGStatus('Failed to load playlist');
    hideLoading();
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
    if (playlistUrlInput) playlistUrlInput.value = hash;
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

// Event listeners with null checks
if (searchInput) {
  searchInput.addEventListener('input', () => {
    renderChannelList();
  });
}

if (loadPlaylistBtn) {
  loadPlaylistBtn.addEventListener('click', handleFileUpload);
}

if (loadFileBtn) {
  loadFileBtn.addEventListener('click', handleFileUpload);
}

if (loadUrlBtn) {
  loadUrlBtn.addEventListener('click', async () => {
    const url = playlistUrlInput?.value.trim();
    if (url) {
      await loadPlaylist(url);
    }
  });
}

if (playlistUrlInput) {
  playlistUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && loadUrlBtn) loadUrlBtn.click();
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    const url = window.location.href.replace('iptv/player.html', 'pages/settings.html');
    window.location.href = url;
  });
}

if (errorCloseBtn) {
  errorCloseBtn.addEventListener('click', hideError);
}

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
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