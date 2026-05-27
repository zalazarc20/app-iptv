const ICONS = {
  play: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
  replay: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
  volume_up: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  volume_down: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>',
  volume_off: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
  cast: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  fullscreen_exit: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
};

class PlayerControls {
  constructor(video, player, container) {
    this.video = video;
    this.player = player;
    this.container = container;
    this.settingsOpen = false;
    this.isSeeking = false;
    this._systemLang = (navigator.language || '').split('-')[0].toLowerCase();
    this.build();
    this.bindVideoEvents();
    this.bindControls();
    this.startHideTimer();
  }

  build() {
    this.container.innerHTML = `
      <div class="custom-controls" id="customControls">
        <div class="controls-progress" id="progressContainer">
          <div class="controls-progress-buffered" id="bufferedBar"></div>
          <div class="controls-progress-played" id="playedBar"></div>
          <input type="range" id="seekBar" min="0" max="100" value="0" step="0.1">
        </div>
        <div class="controls-row">
          <div class="controls-left">
            <button class="ctrl-btn" id="playBtn">${ICONS.play}</button>
            <span class="ctrl-time" id="timeDisplay">0:00 / 0:00</span>
          </div>
          <div class="controls-right">
            <button class="ctrl-btn" id="muteBtn">${ICONS.volume_up}</button>
            <div class="volume-section">
              <input type="range" id="volumeBar" min="0" max="1" value="1" step="0.05">
            </div>
            <button class="ctrl-btn" id="settingsBtn">${ICONS.settings}</button>
            <button class="ctrl-btn cast-btn" id="castBtn">${ICONS.cast}</button>
            <button class="ctrl-btn" id="fullscreenBtn">${ICONS.fullscreen}</button>
          </div>
        </div>
      </div>
      <div class="settings-panel" id="settingsPanel" style="display:none">
        <div class="settings-section">
          <div class="settings-header">Quality</div>
          <div class="settings-options" id="qualityOptions"></div>
        </div>
        <div class="settings-section">
          <div class="settings-header">Audio</div>
          <div class="settings-options" id="audioOptions"></div>
        </div>
        <div class="settings-section">
          <div class="settings-header">Subtitles</div>
          <div class="settings-options" id="subsOptions"></div>
        </div>
        <div class="settings-section">
          <div class="settings-header">Speed</div>
          <div class="settings-options" id="speedOptions"></div>
        </div>
      </div>
    `;

    this.controls = this.container.querySelector('#customControls');
    this.seekBar = this.container.querySelector('#seekBar');
    this.bufferedBar = this.container.querySelector('#bufferedBar');
    this.playedBar = this.container.querySelector('#playedBar');
    this.progressContainer = this.container.querySelector('#progressContainer');
    this.playBtn = this.container.querySelector('#playBtn');
    this.timeDisplay = this.container.querySelector('#timeDisplay');
    this.muteBtn = this.container.querySelector('#muteBtn');
    this.volumeBar = this.container.querySelector('#volumeBar');
    this.settingsBtn = this.container.querySelector('#settingsBtn');
    this.settingsPanel = this.container.querySelector('#settingsPanel');
    this.castBtn = this.container.querySelector('#castBtn');
    this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');
    this.qualityOptions = this.container.querySelector('#qualityOptions');
    this.audioOptions = this.container.querySelector('#audioOptions');
    this.subsOptions = this.container.querySelector('#subsOptions');
    this.speedOptions = this.container.querySelector('#speedOptions');

    this.setupCast();
  }

  setIcon(btn, name) {
    if (ICONS[name]) btn.innerHTML = ICONS[name];
  }

  bindVideoEvents() {
    this.video.addEventListener('play', () => { this.setIcon(this.playBtn, 'pause'); this.show(); });
    this.video.addEventListener('pause', () => { this.setIcon(this.playBtn, 'play'); this.show(); });
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateTime());
    this.video.addEventListener('progress', () => this.updateBuffered());
    this.video.addEventListener('volumechange', () => this.updateVolumeUI());
    this.video.addEventListener('waiting', () => this.show());
    this.video.addEventListener('ended', () => { this.setIcon(this.playBtn, 'replay'); });

    this.video.addEventListener('mouseenter', () => this.show());
    this.video.addEventListener('mousemove', () => this.show());
    this.video.addEventListener('mouseleave', () => this.startHideTimer());
    this.video.addEventListener('click', () => this.togglePlay());

    this.controls.addEventListener('mouseenter', () => this.show());
    this.controls.addEventListener('mouseleave', () => this.startHideTimer());
  }

  bindControls() {
    this.playBtn.addEventListener('click', (e) => { e.stopPropagation(); this.togglePlay(); });

    this.seekBar.addEventListener('input', () => {
      this.isSeeking = true;
      const pct = parseFloat(this.seekBar.value) / 100;
      this.playedBar.style.width = pct * 100 + '%';
      if (this.video.duration) {
        this.video.currentTime = pct * this.video.duration;
      }
    });
    this.seekBar.addEventListener('change', () => { this.isSeeking = false; });
    this.progressContainer.addEventListener('click', (e) => {
      if (e.target === this.seekBar) return;
      const rect = this.progressContainer.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (this.video.duration) {
        this.video.currentTime = pct * this.video.duration;
      }
    });

    this.muteBtn.addEventListener('click', () => { this.video.muted = !this.video.muted; });
    this.volumeBar.addEventListener('input', () => {
      this.video.volume = parseFloat(this.volumeBar.value);
      this.video.muted = false;
    });

    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSettings();
    });
    document.addEventListener('click', (e) => {
      if (this.settingsOpen && !this.settingsPanel.contains(e.target) && e.target !== this.settingsBtn) {
        this.closeSettings();
      }
    });

    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    document.addEventListener('fullscreenchange', () => this.updateFullscreenIcon());
  }

  togglePlay() {
    if (this.video.paused || this.video.ended) {
      this.video.play().catch(() => {});
    } else {
      this.video.pause();
    }
  }

  updateProgress() {
    if (this.isSeeking) return;
    if (this.video.duration) {
      const pct = (this.video.currentTime / this.video.duration) * 100;
      this.seekBar.value = pct;
      this.playedBar.style.width = pct + '%';
    }
    this.updateTime();
  }

  updateBuffered() {
    if (this.video.buffered.length > 0) {
      const end = this.video.buffered.end(this.video.buffered.length - 1);
      const pct = (end / this.video.duration) * 100;
      this.bufferedBar.style.width = pct + '%';
    }
  }

  updateTime() {
    const cur = this.formatTime(this.video.currentTime);
    const dur = this.formatTime(this.video.duration || 0);
    this.timeDisplay.textContent = `${cur} / ${dur}`;
  }

  formatTime(t) {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  updateVolumeUI() {
    const vol = this.video.muted ? 0 : this.video.volume;
    this.volumeBar.value = vol;
    if (this.video.muted || vol === 0) {
      this.setIcon(this.muteBtn, 'volume_off');
    } else if (vol < 0.5) {
      this.setIcon(this.muteBtn, 'volume_down');
    } else {
      this.setIcon(this.muteBtn, 'volume_up');
    }
  }

  show() {
    this.controls.classList.add('visible');
    clearTimeout(this.hideTimer);
  }

  startHideTimer() {
    clearTimeout(this.hideTimer);
    if (this.video.paused) return;
    this.hideTimer = setTimeout(() => {
      if (!this.settingsOpen) this.controls.classList.remove('visible');
    }, 3000);
  }

  toggleSettings() {
    if (this.settingsOpen) this.closeSettings();
    else this.openSettings();
  }

  openSettings() {
    this.settingsOpen = true;
    this.settingsPanel.style.display = 'block';
    this.populateSettings();
    this.show();
  }

  closeSettings() {
    this.settingsOpen = false;
    this.settingsPanel.style.display = 'none';
    this.startHideTimer();
  }

  populateSettings() {
    try { this.populateQuality(); } catch (e) { console.error('Quality error', e); this.qualityOptions.innerHTML = '<div class="settings-option disabled">N/A</div>'; }
    try { this.populateAudio(); } catch (e) { console.error('Audio error', e); this.audioOptions.innerHTML = '<div class="settings-option disabled">N/A</div>'; }
    try { this.populateSubs(); } catch (e) { console.error('Subs error', e); this.subsOptions.innerHTML = '<div class="settings-option disabled">N/A</div>'; }
    try { this.populateSpeed(); } catch (e) { console.error('Speed error', e); }
  }

  populateQuality() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') {
      this.qualityOptions.innerHTML = '<div class="settings-option disabled">N/A</div>';
      return;
    }
    let tracks;
    try { tracks = this.player.getVariantTracks(); } catch (e) { tracks = []; }
    this.qualityOptions.innerHTML = '<div class="settings-option" data-value="auto">Auto</div>';
    let hasVideo = false;
    (tracks || []).forEach(t => {
      const h = t.height || 0;
      if (!h) return;
      hasVideo = true;
      const label = h + 'p';
      const opt = document.createElement('div');
      opt.className = 'settings-option';
      opt.textContent = label;
      opt.addEventListener('click', (e) => { e.stopPropagation(); this.selectQuality(opt, h); });
      this.qualityOptions.appendChild(opt);
    });
    if (!hasVideo) {
      this.qualityOptions.innerHTML = '<div class="settings-option disabled">N/A</div>';
    }
  }

  selectQuality(el, height) {
    if (!this.player) return;
    const opts = this.qualityOptions.querySelectorAll('.settings-option');
    opts.forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    try {
      if (height === 'auto') {
        this.player.configure({ abr: { enabled: true } });
        return;
      }
      this.player.configure({ abr: { enabled: false } });
      const tracks = this.player.getVariantTracks();
      const match = tracks.filter(t => t.height === height);
      if (match.length > 0) this.player.selectVariantTrack(match[0], true);
    } catch (e) { console.error('selectQuality error', e); }
  }

  populateAudio() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') {
      this.audioOptions.innerHTML = '<div class="settings-option disabled">N/A</div>';
      return;
    }
    let tracks;
    try { tracks = this.player.getVariantTracks(); } catch (e) { tracks = []; }
    const seen = new Set();
    this.audioOptions.innerHTML = '';
    let hasAudio = false;
    (tracks || []).forEach(t => {
      const lang = (t.language || '').toLowerCase();
      if (!lang || seen.has(lang)) return;
      hasAudio = true;
      seen.add(lang);
      const label = lang.toUpperCase();
      const opt = document.createElement('div');
      opt.className = 'settings-option';
      if (lang === this._systemLang) {
        opt.classList.add('active');
        try { this.player.selectAudioLanguage(lang); } catch (e) {}
      }
      opt.textContent = label;
      opt.addEventListener('click', (e) => { e.stopPropagation(); this.selectAudio(opt, lang); });
      this.audioOptions.appendChild(opt);
    });
    if (!hasAudio) {
      this.audioOptions.innerHTML = '<div class="settings-option disabled">N/A</div>';
    }
  }

  selectAudio(el, lang) {
    if (!this.player) return;
    this.audioOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    try { this.player.selectAudioLanguage(lang); } catch (e) { console.error('selectAudio error', e); }
  }

  populateSubs() {
    if (!this.player || typeof this.player.getTextTracks !== 'function') {
      this.subsOptions.innerHTML = '<div class="settings-option" data-value="off">Off</div><div class="settings-option disabled">N/A</div>';
      return;
    }
    let tracks;
    try { tracks = this.player.getTextTracks(); } catch (e) { tracks = []; }
    this.subsOptions.innerHTML = '<div class="settings-option off-opt" data-value="off">Off</div>';
    const offOpt = this.subsOptions.querySelector('.off-opt');
    offOpt.addEventListener('click', (e) => { e.stopPropagation(); this.selectSubsOff(); });
    if (!tracks || tracks.length === 0) {
      this.subsOptions.innerHTML += '<div class="settings-option disabled">N/A</div>';
      return;
    }
    const seen = new Set();
    let hasText = false;
    tracks.forEach(t => {
      const lang = (t.language || '').toLowerCase();
      if (!lang || seen.has(lang)) return;
      hasText = true;
      seen.add(lang);
      const label = lang.toUpperCase();
      const opt = document.createElement('div');
      opt.className = 'settings-option';
      if (lang === this._systemLang) {
        opt.classList.add('active');
        try { this.player.selectTextTrack(t); this.player.setTextTrackVisibility(true); } catch (e) {}
      }
      opt.textContent = label;
      opt.addEventListener('click', (e) => { e.stopPropagation(); this.selectSubs(opt, t); });
      this.subsOptions.appendChild(opt);
    });
    if (!hasText) {
      this.subsOptions.innerHTML += '<div class="settings-option disabled">N/A</div>';
    }
  }

  selectSubsOff() {
    if (!this.player) return;
    this.subsOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    document.querySelector('#subsOptions .off-opt').classList.add('active');
    try { this.player.setTextTrackVisibility(false); } catch (e) {}
  }

  selectSubs(el, track) {
    if (!this.player) return;
    this.subsOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    try {
      this.player.selectTextTrack(track);
      this.player.setTextTrackVisibility(true);
    } catch (e) { console.error('selectSubs error', e); }
  }

  populateSpeed() {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const current = this.video.playbackRate;
    this.speedOptions.innerHTML = '';
    speeds.forEach(s => {
      const opt = document.createElement('div');
      opt.className = 'settings-option' + (s === current ? ' active' : '');
      opt.textContent = s === 1 ? 'Normal' : `${s}x`;
      opt.addEventListener('click', (e) => { e.stopPropagation(); this.selectSpeed(opt, s); });
      this.speedOptions.appendChild(opt);
    });
  }

  selectSpeed(el, speed) {
    this.speedOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    try { this.video.playbackRate = speed; } catch (e) { console.error('selectSpeed error', e); }
  }

  updateFullscreenIcon() {
    this.setIcon(this.fullscreenBtn, document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      const el = this.video.closest('.shaka-video-container') || this.video.parentElement;
      el.requestFullscreen().catch(() => this.video.requestFullscreen().catch(() => {}));
    } else {
      document.exitFullscreen().catch(() => {});
    }
    this.updateFullscreenIcon();
  }

  setupCast() {
    if (!window.chrome || !window.chrome.cast) {
      this.castBtn.style.display = 'none';
      return;
    }
    this.castBtn.addEventListener('click', () => {
      this.castBtn.classList.toggle('casting');
    });
  }

  updateTracks() {
    this.populateSettings();
  }

  destroy() {
    clearTimeout(this.hideTimer);
    this.container.innerHTML = '';
  }
}
