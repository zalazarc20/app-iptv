(function () {
  if (document.getElementById('streamSnifferOverlay')) return;

  const ctx = window.__snifferCtx || {};
  const state = {
    firstMedia: null,
    lastMedia: null,
    mediaCount: 0,
    firstType: null,
    lastType: null,
    showFirst: true
  };

  function createOverlay() {
    const div = document.createElement('div');
    div.id = 'streamSnifferOverlay';
    div.innerHTML = `
      <span class="ss-title">Stream Sniffer</span>
      <span class="ss-count" id="ssCount">[0]</span>
      <span id="ssLinkSection" style="display:none;margin-left:8px;">
        <select id="ssFirstLast" class="ss-type-select">
          <option value="first">First</option>
          <option value="last">Last</option>
        </select>
        <span id="ssBadge" class="ss-badge ss-badge-m3u8">m3u8</span>
        <a id="ssMediaLink" class="ss-link" href="#" target="_blank">Loading...</a>
      </span>
      <span class="ss-buttons">
        <span id="ssPlayBtn" class="ss-btn ss-btn-play">Play</span>
        <span id="ssCopyBtn" class="ss-btn ss-btn-copy">Copy</span>
        <span id="ssCloseBtn" class="ss-btn ss-btn-close">X</span>
      </span>
    `;
    document.body.appendChild(div);
    return div;
  }

  const overlay = createOverlay();
  const ssCount = document.getElementById('ssCount');
  const ssLinkSection = document.getElementById('ssLinkSection');
  const ssFirstLast = document.getElementById('ssFirstLast');
  const ssBadge = document.getElementById('ssBadge');
  const ssMediaLink = document.getElementById('ssMediaLink');
  const ssPlayBtn = document.getElementById('ssPlayBtn');
  const ssCopyBtn = document.getElementById('ssCopyBtn');
  const ssCloseBtn = document.getElementById('ssCloseBtn');

  function getBadgeClass(type) {
    const map = { m3u8: 'ss-badge-m3u8', mpd: 'ss-badge-mpd', m3u: 'ss-badge-m3u', mp4: 'ss-badge-mp4' };
    return map[type] || 'ss-badge-m3u8';
  }

  function updateDisplay() {
    const media = state.showFirst ? state.firstMedia : state.lastMedia;
    const type = state.showFirst ? state.firstType : state.lastType;
    ssCount.textContent = `[${state.mediaCount}]`;

    if (media) {
      ssLinkSection.style.display = 'inline';
      const displayText = media.length > 80 ? media.substring(0, 77) + '...' : media;
      ssMediaLink.textContent = displayText;
      ssMediaLink.href = media;
      ssMediaLink.title = media;
      ssBadge.className = `ss-badge ${getBadgeClass(type)}`;
      ssBadge.textContent = (type || 'm3u8').toUpperCase();
      const playerBase = type === 'm3u'
        ? (ctx.iptvUrl || '')
        : (ctx.playerUrl || '');
      ssPlayBtn.dataset.url = media;
      ssPlayBtn.dataset.type = type || 'm3u8';
      ssPlayBtn.dataset.base = playerBase;
    } else {
      ssLinkSection.style.display = 'none';
    }
  }

  function detectClearkeyInPage() {
    const scripts = document.querySelectorAll('script:not([src])');
    for (const script of scripts) {
      const text = script.textContent || '';
      if (!text) continue;
      const match = text.match(/(?:key(?:Id|ID)|kid)\s*[:=]\s*["']([a-fA-F0-9-]+)["'][^}]*?\bkey\b\s*[:=]\s*["']([a-fA-F0-9-]+)["']/i);
      if (match) {
        return { [match[1].replace(/-/g, '').toLowerCase()]: match[2].replace(/-/g, '').toLowerCase() };
      }
    }
    const els = document.querySelectorAll('[data-kid], [data-key-id], [data-keyid]');
    for (const el of els) {
      const kid = el.dataset.kid || el.dataset.keyId || el.dataset.keyid;
      const key = el.dataset.key;
      if (kid && key) {
        return { [kid.replace(/-/g, '').toLowerCase()]: key.replace(/-/g, '').toLowerCase() };
      }
    }
    const bodyHTML = document.body?.innerHTML || '';
    const licMatch = bodyHTML.match(/license_key["']\s*[:=]\s*["']([^"']+)["']/i);
    if (licMatch && licMatch[1].includes(':')) {
      const parts = licMatch[1].split(':');
      return { [parts[0].replace(/-/g, '').toLowerCase()]: parts[1].replace(/-/g, '').toLowerCase() };
    }
    return null;
  }

  function updateState(mediaUrl, mediaType) {
    state.lastMedia = mediaUrl;
    state.lastType = mediaType || 'm3u8';
    state.mediaCount++;
    if (!state.firstMedia) {
      state.firstMedia = mediaUrl;
      state.firstType = mediaType || 'm3u8';
    }
    if (!state.clearkey) {
      state.clearkey = detectClearkeyInPage();
    }
    overlay.style.display = 'inline';
    updateDisplay();
  }

  ssFirstLast.addEventListener('change', function () {
    state.showFirst = this.value === 'first';
    updateDisplay();
  });

  ssPlayBtn.addEventListener('click', function () {
    const url = state.showFirst ? state.firstMedia : state.lastMedia;
    const type = state.showFirst ? state.firstType : state.lastType;
    if (url && chrome.runtime?.id) {
      const msg = {
        command: 'openPlayer',
        mediaUrl: url,
        mediaType: type || 'm3u8',
        newTab: true
      };
      if (state.clearkey) msg.clearkey = state.clearkey;
      chrome.runtime.sendMessage(msg).catch(() => {});
    }
  });

  ssCopyBtn.addEventListener('click', function () {
    const url = state.showFirst ? state.firstMedia : state.lastMedia;
    if (url) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  });

  ssCloseBtn.addEventListener('click', function () {
    overlay.style.display = 'none';
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === 'updateOverlayStatus' && message.mediaUrl) {
      updateState(message.mediaUrl, message.mediaType);
    }
  });

  window.updateOverlayStatus = function (message) {
    if (message && message.mediaUrl) {
      updateState(message.mediaUrl, message.mediaType);
    }
  };

  window.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && e.code === 'KeyS') {
      overlay.style.display = overlay.style.display === 'none' ? 'inline' : 'none';
    }
  });
})();
