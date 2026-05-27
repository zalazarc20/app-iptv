const video = document.getElementById('video');
const errorOverlay = document.getElementById('errorOverlay');
const errorMessage = document.getElementById('errorMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const retryBtn = document.getElementById('retryBtn');
const settingsBtn = document.getElementById('settingsBtn');

let currentUrl = '';
let currentType = null;
let hlsInstance = null;
let shakaPlayer = null;
let shakaInit = false;
let retryCount = 0;
let playerControls = null;
const MAX_RETRIES = 2;

function parseClearkeyFromParams() {
  const params = new URLSearchParams(window.location.search);
  const ck = params.get('ck');
  if (!ck) return null;
  try {
    const decoded = JSON.parse(atob(ck));
    const clearkey = {};
    if (typeof decoded === 'string') {
      const parts = decoded.split(':');
      if (parts.length === 2) {
        clearkey[parts[0]] = parts[1];
        return clearkey;
      }
    } else if (typeof decoded === 'object') {
      for (const [k, v] of Object.entries(decoded)) {
        clearkey[k.replace(/-/g, '').toLowerCase()] = v.replace(/-/g, '').toLowerCase();
      }
      return clearkey;
    }
  } catch (e) {}
  return null;
}

function parseClearkeyFromHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;
  try {
    const url = new URL(hash);
    const ck = url.searchParams.get('ck');
    if (ck) {
      const decoded = JSON.parse(atob(ck));
      const clearkey = {};
      for (const [k, v] of Object.entries(decoded)) {
        clearkey[k.replace(/-/g, '').toLowerCase()] = v.replace(/-/g, '').toLowerCase();
      }
      return Object.keys(clearkey).length > 0 ? clearkey : null;
    }
  } catch (e) {}
  return null;
}

function extractClearkeyFromManifest(manifestText) {
  const clearkey = {};
  const lines = manifestText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#KODIPROP:inputstream.adaptive.license_type=clearkey') ||
        line.startsWith('#EXTVLCOPT:inputstream.adaptive.license_type=clearkey')) {
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const keyLine = lines[j].trim();
        if (keyLine.startsWith('#KODIPROP:inputstream.adaptive.license_key=') ||
            keyLine.startsWith('#EXTVLCOPT:inputstream.adaptive.license_key=')) {
          let keyData = keyLine.split('=').slice(1).join('=');
          keyData = keyData.replace(/"/g, '').trim();
          if (keyData.includes(':')) {
            const parts = keyData.split(':');
            clearkey[parts[0]] = parts[1];
          } else if (keyData.startsWith('http')) {
            return { url: keyData };
          }
        }
      }
    }

    if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=') ||
        line.startsWith('#EXTVLCOPT:inputstream.adaptive.license_key=')) {
      let keyData = line.split('=').slice(1).join('=');
      keyData = keyData.replace(/"/g, '').trim();
      if (keyData.includes(':') && !keyData.startsWith('http')) {
        const parts = keyData.split(':');
        clearkey[parts[0]] = parts[1];
      } else if (keyData.startsWith('http')) {
        return { url: keyData };
      }
    }
  }

  return Object.keys(clearkey).length > 0 ? clearkey : null;
}

async function fetchClearkeyFromUrl(url) {
  try {
    const resp = await fetch(url);
    const text = await resp.text();
    try {
      const json = JSON.parse(text);
      if (typeof json === 'object') {
        const clearkey = {};
        for (const [k, v] of Object.entries(json)) {
          clearkey[k.replace(/-/g, '').toLowerCase()] = String(v).replace(/-/g, '').toLowerCase();
        }
        return Object.keys(clearkey).length > 0 ? clearkey : null;
      }
    } catch (e) {
      if (text.includes(':')) {
        const clearkey = {};
        const lines = text.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(':');
          if (parts.length === 2 && parts[0].length === 32 && parts[1].length === 32) {
            clearkey[parts[0]] = parts[1];
          }
        }
        return Object.keys(clearkey).length > 0 ? clearkey : null;
      }
    }
  } catch (e) {}
  return null;
}

function normalizeKey(key) {
  return key.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
}

function getMediaType(url) {
  const path = url.split('?')[0].split('#')[0].toLowerCase();
  if (path.endsWith('.m3u8')) return 'm3u8';
  if (path.endsWith('.mpd')) return 'mpd';
  if (path.endsWith('.mp4')) return 'mp4';
  if (path.includes('.m3u8')) return 'm3u8';
  if (path.includes('.mpd')) return 'mpd';
  return null;
}

async function detectAndFetchClearkey(mediaUrl) {
  let clearkey = parseClearkeyFromParams() || parseClearkeyFromHash();
  if (clearkey) return clearkey;

  if (mediaUrl && (mediaUrl.endsWith('.m3u8') || mediaUrl.endsWith('.mpd') || mediaUrl.endsWith('.m3u'))) {
    try {
      const resp = await fetch(mediaUrl);
      const text = await resp.text();
      clearkey = extractClearkeyFromManifest(text);
      if (clearkey && clearkey.url) {
        clearkey = await fetchClearkeyFromUrl(clearkey.url);
      }
      if (clearkey) return clearkey;
    } catch (e) {}
  }

  return null;
}

function getDrmConfig(clearkey) {
  if (!clearkey) return null;

  const clearKeys = {};
  for (const [kid, key] of Object.entries(clearkey)) {
    const cleanKid = normalizeKey(kid);
    const cleanKey = normalizeKey(key);
    let finalKid = cleanKid;
    let finalKey = cleanKey;
    if (cleanKid.length === 16 && cleanKey.length === 16) {
      finalKid = cleanKid + cleanKid;
      finalKey = cleanKey + cleanKey;
    }
    if (finalKid.length === 32 && finalKey.length === 32) {
      clearKeys[finalKid] = finalKey;
    }
  }

  if (Object.keys(clearKeys).length === 0) return null;

  return { drm: { clearKeys } };
}

function playWithShaka(url, clearkey) {
  shaka.polyfill.installAll();

  if (!shakaInit) {
    shakaPlayer = new shaka.Player(video);
    shakaInit = true;

    shakaPlayer.addEventListener('error', (event) => {
      showError('Shaka Player error: ' + (event.detail?.message || 'Unknown error'));
    });

    const controlsContainer = document.getElementById('customControlsContainer');
    if (controlsContainer && typeof PlayerControls !== 'undefined') {
      playerControls = new PlayerControls(video, shakaPlayer, controlsContainer);
      shakaPlayer.addEventListener('variantchanged', () => {
        if (playerControls) playerControls.updateTracks();
      });
    }
  }

  loadingOverlay.style.display = 'flex';

  const config = {};
  if (clearkey) {
    const drmConfig = getDrmConfig(clearkey);
    if (drmConfig) {
      config.drm = drmConfig.drm;
    }
  }

  if (Object.keys(config).length > 0) {
    shakaPlayer.configure(config);
  }

  shakaPlayer.load(url).then(() => {
    loadingOverlay.style.display = 'none';
    errorOverlay.style.display = 'none';
    video.play().catch(() => {});
  }).catch((err) => {
    loadingOverlay.style.display = 'none';
    if (clearkey) {
      showError('Shaka failed with clearkey: ' + err.message);
    } else {
      showError('Shaka load error: ' + err.message);
    }
  });
}

function playWithHlsjs(url) {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (!Hls.isSupported()) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(() => {});
      return;
    }
    showError('HLS is not supported in this browser');
    return;
  }

  const controlsContainer = document.getElementById('customControlsContainer');
  if (controlsContainer && typeof PlayerControls !== 'undefined' && !playerControls) {
    playerControls = new PlayerControls(video, null, controlsContainer);
  }

  loadingOverlay.style.display = 'flex';
  hlsInstance = new Hls({
    enableWorker: true,
    lowLatencyMode: true
  });

  hlsInstance.loadSource(url);
  hlsInstance.attachMedia(video);

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
    loadingOverlay.style.display = 'none';
    errorOverlay.style.display = 'none';
    video.play().catch(() => {});
  });

  hlsInstance.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && retryCount < MAX_RETRIES) {
        retryCount++;
        hlsInstance.recoverMediaError();
      } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => hlsInstance.startLoad(), 1000);
      } else {
        loadingOverlay.style.display = 'none';
        showError('HLS error: ' + (data.details || 'Unknown'));
      }
    }
  });
}

function playDirectMp4(url) {
  const controlsContainer = document.getElementById('customControlsContainer');
  if (controlsContainer && typeof PlayerControls !== 'undefined' && !playerControls) {
    playerControls = new PlayerControls(video, null, controlsContainer);
  }

  loadingOverlay.style.display = 'flex';
  video.src = url;
  video.addEventListener('loadedmetadata', () => {
    loadingOverlay.style.display = 'none';
    errorOverlay.style.display = 'none';
    video.play().catch(() => {});
  });
  video.addEventListener('error', () => {
    loadingOverlay.style.display = 'none';
    showError('Failed to load video');
  });
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorOverlay.style.display = 'flex';
}

function showSettings() {
  const url = window.location.href.replace('player.html', 'settings.html');
  window.location.href = url;
}

async function init() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(window.location.search);
  const siteUrl = params.get('site');
  const directMode = params.get('redirect') === '1';

  let mediaUrl = hash || '';
  if (!mediaUrl && siteUrl && directMode) {
    mediaUrl = siteUrl;
  }

  if (!mediaUrl) {
    showError('No media URL provided. Append #URL to the player URL.');
    return;
  }

  if (mediaUrl.startsWith('http')) {
    currentUrl = mediaUrl;
    currentType = getMediaType(mediaUrl);

    retryBtn.addEventListener('click', () => {
      retryCount = 0;
      errorOverlay.style.display = 'none';
      init();
    });

    settingsBtn.addEventListener('click', showSettings);

    const clearkey = await detectAndFetchClearkey(mediaUrl);

    if (currentType === 'm3u8') {
      playWithHlsjs(mediaUrl);
    } else if (currentType === 'mpd') {
      if (typeof shaka !== 'undefined') {
        playWithShaka(mediaUrl, clearkey);
      } else {
        showError('Shaka Player not loaded');
      }
    } else if (currentType === 'mp4') {
      playDirectMp4(mediaUrl);
    } else {
      try {
        if (typeof shaka !== 'undefined') {
          playWithShaka(mediaUrl, clearkey);
        } else if (Hls.isSupported()) {
          playWithHlsjs(mediaUrl);
        } else {
          playDirectMp4(mediaUrl);
        }
      } catch (e) {
        showError('Unsupported media format: ' + mediaUrl);
      }
    }
  } else {
    showError('Invalid media URL: ' + mediaUrl);
  }
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (video.paused) video.play().catch(() => {}); else video.pause();
  }
  if (e.code === 'KeyF' || e.code === 'Enter') {
    e.preventDefault();
    if (!document.fullscreenElement) {
      document.body.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
  if (e.code === 'KeyM') {
    video.muted = !video.muted;
  }
  if (e.code === 'KeyS') {
    e.preventDefault();
    showSettings();
  }
  if (e.code === 'Escape') {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
});
