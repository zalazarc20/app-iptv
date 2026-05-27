const NONE_MSG = 'No media detected';

let state = {
  firstMedia: NONE_MSG,
  lastMedia: NONE_MSG,
  mediaCount: 0,
  tabUrl: ''
};

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0];
}

async function loadData() {
  const tab = await getActiveTab();
  if (!tab) return;

  state.tabUrl = tab.url || '';

  try {
    const response = await chrome.runtime.sendMessage({ command: 'getMediaUrls' });
    if (response) {
      state.firstMedia = response.firstMedia || NONE_MSG;
      state.lastMedia = response.lastMedia || NONE_MSG;
      state.mediaCount = response.mediaCount || 0;
      if (response.tabUrl) state.tabUrl = response.tabUrl;
    }
  } catch (e) {}

  updateUI();
}

async function loadSettings() {
  const result = await chrome.storage.local.get([
    'sniffingEnabled', 'overlayEnabled', 'autoPlayEnabled'
  ]);
  document.getElementById('sniffingEnabled').checked = result.sniffingEnabled ?? true;
  document.getElementById('overlayEnabled').checked = result.overlayEnabled ?? true;
  document.getElementById('autoPlayEnabled').value = result.autoPlayEnabled ?? 'None';
}

function updateUI() {
  const displayUrl = state.tabUrl.length > 100
    ? state.tabUrl.substring(0, 97) + '...' : state.tabUrl;
  document.getElementById('siteUrl').textContent = displayUrl || 'No active tab';
  document.getElementById('siteUrlLink').href = state.tabUrl || '#';

  const firstText = state.firstMedia.length > 80
    ? state.firstMedia.substring(0, 77) + '...' : state.firstMedia;
  document.getElementById('firstMedia').textContent = firstText;
  document.getElementById('firstLink').href = state.firstMedia !== NONE_MSG ? state.firstMedia : '#';

  const lastText = state.lastMedia.length > 80
    ? state.lastMedia.substring(0, 77) + '...' : state.lastMedia;
  document.getElementById('lastMedia').textContent = lastText;
  document.getElementById('lastLink').href = state.lastMedia !== NONE_MSG ? state.lastMedia : '#';

  const badge = document.getElementById('countBadge');
  badge.textContent = state.mediaCount > 0 ? `[${state.mediaCount}]` : '';
}

function saveSetting(key, value) {
  chrome.storage.local.set({ [key]: value });
  chrome.runtime.sendMessage({
    command: 'updateOptions',
    options: { [key]: value }
  });
}

function openPlayer(mediaUrl) {
  if (!mediaUrl || mediaUrl === NONE_MSG) return;
  const m3uMatch = mediaUrl.match(/\.m3u(?:\?|$)/i);
  const isM3U = !!m3uMatch;
  const baseUrl = chrome.runtime.getURL(isM3U ? 'player/iptv-player.html' : 'player/player.html');
  const params = new URLSearchParams();
  if (state.tabUrl && state.tabUrl.startsWith('http')) {
    params.set('site', state.tabUrl.split('#')[0].split('?')[0]);
  }
  const paramStr = params.toString();
  const url = paramStr ? `${baseUrl}?${paramStr}` : baseUrl;
  chrome.tabs.create({ url: url + '#' + mediaUrl, active: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadData();

  document.getElementById('sniffingEnabled').addEventListener('change', function () {
    saveSetting('sniffingEnabled', this.checked);
  });

  document.getElementById('overlayEnabled').addEventListener('change', function () {
    saveSetting('overlayEnabled', this.checked);
  });

  document.getElementById('autoPlayEnabled').addEventListener('change', function () {
    saveSetting('autoPlayEnabled', this.value);
  });

  document.getElementById('refreshBtn').addEventListener('click', loadData);

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('playFirstBtn').addEventListener('click', () => {
    openPlayer(state.firstMedia);
  });

  document.getElementById('playLastBtn').addEventListener('click', () => {
    openPlayer(state.lastMedia);
  });

  document.getElementById('copyFirstBtn').addEventListener('click', async () => {
    if (state.firstMedia && state.firstMedia !== NONE_MSG) {
      try {
        await navigator.clipboard.writeText(state.firstMedia);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = state.firstMedia;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    }
  });

  document.getElementById('copyLastBtn').addEventListener('click', async () => {
    if (state.lastMedia && state.lastMedia !== NONE_MSG) {
      try {
        await navigator.clipboard.writeText(state.lastMedia);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = state.lastMedia;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    }
  });

  document.getElementById('openIPTVBtn').addEventListener('click', () => {
    const url = chrome.runtime.getURL('player/iptv-player.html');
    chrome.tabs.create({ url, active: true });
  });

  document.getElementById('loadPlaylistBtn').addEventListener('click', () => {
    const input = document.getElementById('playlistUrlInput');
    const m3uUrl = input.value.trim();
    if (m3uUrl) {
      const iptvUrl = chrome.runtime.getURL('player/iptv-player.html') + '#' + encodeURI(m3uUrl);
      chrome.tabs.create({ url: iptvUrl, active: true });
    }
  });

  document.getElementById('playlistUrlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loadPlaylistBtn').click();
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === 'popupUpdate') {
      loadData();
    }
  });
});
