const MEDIA_REGEX = /^https?:\/\/.*\.(m3u8|mpd|m3u)([?#;].*)?$/i;
const MP4_REGEX = /^https?:\/\/.*\.mp4([?#;].*)?$/i;

let ctx = {};
let activeTabMedia = {};
let overlayInjectedTabs = new Set();

async function ctxInit() {
  ctx.options = await getSettings();
  await updateNetRules(ctx.options.directPlayEnabled);
}

async function getSettings() {
  const result = await chrome.storage.local.get([
    'sniffingEnabled', 'overlayEnabled', 'autoPlayEnabled',
    'autoPlayDomains', 'directPlayEnabled'
  ]);
  return {
    sniffingEnabled: result.sniffingEnabled ?? true,
    overlayEnabled: result.overlayEnabled ?? true,
    autoPlayEnabled: result.autoPlayEnabled ?? 'None',
    autoPlayDomains: result.autoPlayDomains ?? '',
    directPlayEnabled: result.directPlayEnabled ?? false
  };
}

function getPlayerUrl(tabUrl, mediaUrl, clearkey) {
  const baseUrl = chrome.runtime.getURL('player/player.html');
  const params = new URLSearchParams();
  if (tabUrl && tabUrl.startsWith('http')) {
    params.set('site', tabUrl.split('#')[0].split('?')[0]);
  }
  if (clearkey) {
    try {
      params.set('ck', btoa(JSON.stringify(clearkey)));
    } catch (e) {
      console.warn('Failed to encode clearkey', e);
    }
  }
  const paramStr = params.toString();
  let url = paramStr ? `${baseUrl}?${paramStr}` : baseUrl;
  if (mediaUrl) url += `#${mediaUrl}`;
  return url;
}

function getIPTVPlayerUrl(m3uUrl) {
  const baseUrl = chrome.runtime.getURL('player/iptv-player.html');
  return m3uUrl ? `${baseUrl}#${m3uUrl}` : baseUrl;
}

function getMediaType(url) {
  const path = url.split('?')[0].split('#')[0].toLowerCase();
  if (/\.m3u8$/i.test(path)) return 'm3u8';
  if (/\.mpd$/i.test(path)) return 'mpd';
  if (/\.m3u$/i.test(path)) return 'm3u';
  if (/\.mp4$/i.test(path)) return 'mp4';
  return null;
}

async function updateNetRules(mpdEnabled) {
  const extHost = new URL(chrome.runtime.getURL('')).hostname;
  const rules = [];
  rules.push({
    id: 1, priority: 1,
    action: { type: 'redirect', redirect: { regexSubstitution: chrome.runtime.getURL('player/iptv-player.html') + '#\\0' } },
    condition: { regexFilter: '^.*\\.m3u(\\?|$)', excludedInitiatorDomains: [extHost], resourceTypes: ['main_frame'] }
  });
  if (mpdEnabled) {
    rules.push({
      id: 2, priority: 2,
      action: { type: 'redirect', redirect: { regexSubstitution: chrome.runtime.getURL('player/player.html') + '?redirect=1#\\0' } },
      condition: { regexFilter: '^.*\\.(mpd|m3u8)(\\?|$)', excludedInitiatorDomains: [extHost], resourceTypes: ['main_frame'] }
    });
  }
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [1, 2, 3], addRules: rules });
  } catch (e) {}
}

async function handleDetectedMedia(tabId, tabObj, mediaUrl) {
  if (tabId <= 0 || !tabObj) return;
  if (tabObj.discarded || tabObj.status === 'unloaded') return;
  const mediaType = getMediaType(mediaUrl);
  if (!mediaType) return;

  if (overlayInjectedTabs.has(tabId)) {
    try {
      await chrome.tabs.sendMessage(tabId, { command: 'updateOverlayStatus', mediaUrl, mediaType });
    } catch (e) {
      overlayInjectedTabs.delete(tabId);
    }
    return;
  }

  if (ctx.options.overlayEnabled && tabObj.url && tabObj.url.startsWith('http')) {
    try {
      await chrome.scripting.insertCSS({ target: { tabId }, files: ['pages/overlay.css'] });
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (playerUrl, iptvUrl) => {
          globalThis.__snifferCtx = globalThis.__snifferCtx || {};
          globalThis.__snifferCtx.playerUrl = playerUrl;
          globalThis.__snifferCtx.iptvUrl = iptvUrl;
        },
        args: [getPlayerUrl(tabObj.url, null), getIPTVPlayerUrl(null)]
      });
      await chrome.scripting.executeScript({ target: { tabId }, files: ['pages/overlay.js'] });
      overlayInjectedTabs.add(tabId);
      await chrome.tabs.sendMessage(tabId, { command: 'updateOverlayStatus', mediaType, mediaUrl });
    } catch (e) {}
  }

  if (ctx.options.autoPlayEnabled !== 'None') {
    await checkAutoPlay(tabId, tabObj, mediaUrl);
  }
}

async function checkAutoPlay(tabId, tabObj, mediaUrl) {
  const autoPlay = ctx.options.autoPlayEnabled === 'All' ||
    (ctx.options.autoPlayEnabled === 'Match' && ctx.options.autoPlayDomains &&
      ctx.options.autoPlayDomains.split(/\s+/).some(d =>
        d && tabObj.url.toLowerCase().includes(d.toLowerCase())
      ));
  if (autoPlay) {
    const pUrl = getMediaType(mediaUrl) === 'm3u'
      ? getIPTVPlayerUrl(mediaUrl)
      : getPlayerUrl(tabObj.url, mediaUrl);
    try {
      await chrome.tabs.update(tabId, { url: pUrl });
    } catch (e) {}
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case 'keepAlive':
      sendResponse({ result: 'OK' });
      break;
    case 'updateOptions':
      Object.assign(ctx.options, message.options);
      updateNetRules(ctx.options.directPlayEnabled);
      break;
    case 'getMediaUrls':
      (async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs?.[0];
        const tabData = activeTab ? activeTabMedia[activeTab.id] : null;
        sendResponse({
          firstMedia: tabData?.firstMedia || null,
          lastMedia: tabData?.lastMedia || null,
          mediaCount: tabData?.mediaCount || 0,
          tabUrl: activeTab?.url || ''
        });
      })();
      return true;
    case 'openPlayer':
      const pUrl = message.mediaType === 'm3u'
        ? getIPTVPlayerUrl(message.mediaUrl)
        : getPlayerUrl(message.siteUrl, message.mediaUrl, message.clearkey);
      if (message.newTab) {
        chrome.tabs.create({ url: pUrl, active: true });
      } else if (message.newWindow) {
        chrome.windows.create({ url: pUrl, focused: true });
      } else {
        chrome.tabs.update(sender.tab?.id, { url: pUrl });
      }
      sendResponse({});
      break;
  }
  return true;
});

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (!ctx.options) await ctxInit();
    if (!ctx.options.sniffingEnabled) return;

    const url = details.url;
    if (!MEDIA_REGEX.test(url) && !MP4_REGEX.test(url)) return;

    const mediaType = getMediaType(url) || 'mp4';
    let tabObj = null;

    if (details.tabId >= 0) {
      try { tabObj = await chrome.tabs.get(details.tabId); } catch (e) {}
    }

    if (!tabObj) {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        tabObj = tabs?.[0];
      } catch (e) {}
    }

    if (!tabObj) return;

    const tabId = tabObj.id;
    activeTabMedia[tabId] = activeTabMedia[tabId] || {};
    const tabCtx = activeTabMedia[tabId];
    tabCtx.lastMedia = url;
    tabCtx.lastMediaType = mediaType;
    tabCtx.mediaCount = (tabCtx.mediaCount || 0) + 1;
    if (!tabCtx.firstMedia) {
      tabCtx.firstMedia = url;
      tabCtx.firstMediaType = mediaType;
    }

    if (details.type !== 'main_frame') {
      await handleDetectedMedia(tabId, tabObj, url);
    }
  },
  { urls: ['<all_urls>'] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  delete activeTabMedia[tabId];
  overlayInjectedTabs.delete(tabId);
});

ctxInit();
