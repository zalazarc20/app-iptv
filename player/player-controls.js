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
  chevron_right: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
  chevron_left: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  audio: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
  subtitles: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/></svg>',
  speed: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>',
  quality: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z"/></svg>',
};

class PlayerControls {
  constructor(video, player, container) {
    this.video = video;
    this.player = player;
    this.container = container;
    this.settingsOpen = false;
    this.currentPanel = 'main'; // 'main', 'audio', 'subtitles', 'speed', 'quality'
    this.isSeeking = false;
    this._systemLang = (navigator.language || '').split('-')[0].toLowerCase();
    
    // Store current selections
    this._currentAudio = null;
    this._currentSubs = 'off';
    this._currentSpeed = 1;
    this._currentQuality = 'auto';
    
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
        <div class="settings-panel-inner" id="settingsPanelInner"></div>
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
    this.settingsPanelInner = this.container.querySelector('#settingsPanelInner');
    this.castBtn = this.container.querySelector('#castBtn');
    this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');

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
    this.currentPanel = 'main';
    this.settingsPanel.style.display = 'block';
    this.renderSettingsPanel();
    this.show();
  }

  closeSettings() {
    this.settingsOpen = false;
    this.currentPanel = 'main';
    this.settingsPanel.style.display = 'none';
    this.startHideTimer();
  }

  renderSettingsPanel() {
    if (this.currentPanel === 'main') {
      this.renderMainMenu();
    } else if (this.currentPanel === 'audio') {
      this.renderAudioMenu();
    } else if (this.currentPanel === 'subtitles') {
      this.renderSubtitlesMenu();
    } else if (this.currentPanel === 'speed') {
      this.renderSpeedMenu();
    } else if (this.currentPanel === 'quality') {
      this.renderQualityMenu();
    }
  }

  renderMainMenu() {
    const audioLabel = this._currentAudio ? this._currentAudio.toUpperCase() : 'N/A';
    const subsLabel = this._currentSubs === 'off' ? 'Off' : this._currentSubs.toUpperCase();
    const speedLabel = this._currentSpeed === 1 ? 'Normal' : `${this._currentSpeed}x`;
    const qualityLabel = this._currentQuality === 'auto' ? 'Auto' : `${this._currentQuality}p`;

    // Check what options are available
    const hasAudio = this.getAudioTracks().length > 0;
    const hasSubs = this.getSubtitleTracks().length > 0;

    this.settingsPanelInner.innerHTML = `
      ${hasAudio ? `
      <div class="settings-menu-item" data-panel="audio">
        <span class="settings-menu-icon">${ICONS.audio}</span>
        <span class="settings-menu-label">Audio</span>
        <span class="settings-menu-value">${audioLabel}</span>
        <span class="settings-menu-arrow">${ICONS.chevron_right}</span>
      </div>
      ` : ''}
      <div class="settings-menu-item" data-panel="subtitles">
        <span class="settings-menu-icon">${ICONS.subtitles}</span>
        <span class="settings-menu-label">Subtitles</span>
        <span class="settings-menu-value">${hasSubs ? subsLabel : 'N/A'}</span>
        <span class="settings-menu-arrow">${ICONS.chevron_right}</span>
      </div>
      <div class="settings-menu-item" data-panel="speed">
        <span class="settings-menu-icon">${ICONS.speed}</span>
        <span class="settings-menu-label">Speed</span>
        <span class="settings-menu-value">${speedLabel}</span>
        <span class="settings-menu-arrow">${ICONS.chevron_right}</span>
      </div>
      <div class="settings-menu-item" data-panel="quality">
        <span class="settings-menu-icon">${ICONS.quality}</span>
        <span class="settings-menu-label">Quality</span>
        <span class="settings-menu-value">${qualityLabel}</span>
        <span class="settings-menu-arrow">${ICONS.chevron_right}</span>
      </div>
    `;

    this.settingsPanelInner.querySelectorAll('.settings-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentPanel = item.dataset.panel;
        this.renderSettingsPanel();
      });
    });
  }

  renderBackHeader(title) {
    return `
      <div class="settings-back-header" id="settingsBackBtn">
        <span class="settings-back-icon">${ICONS.chevron_left}</span>
        <span class="settings-back-title">${title}</span>
      </div>
    `;
  }

  bindBackButton() {
    const backBtn = this.settingsPanelInner.querySelector('#settingsBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentPanel = 'main';
        this.renderSettingsPanel();
      });
    }
  }

  getAudioTracks() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') return [];
    try {
      const tracks = this.player.getVariantTracks() || [];
      const seen = new Set();
      return tracks.filter(t => {
        const lang = (t.language || '').toLowerCase();
        if (!lang || seen.has(lang)) return false;
        seen.add(lang);
        return true;
      });
    } catch (e) {
      return [];
    }
  }

  getSubtitleTracks() {
    if (!this.player || typeof this.player.getTextTracks !== 'function') return [];
    try {
      const tracks = this.player.getTextTracks() || [];
      const seen = new Set();
      return tracks.filter(t => {
        const lang = (t.language || '').toLowerCase();
        if (!lang || seen.has(lang)) return false;
        seen.add(lang);
        return true;
      });
    } catch (e) {
      return [];
    }
  }

  getQualityTracks() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') return [];
    try {
      const tracks = this.player.getVariantTracks() || [];
      const seen = new Set();
      return tracks.filter(t => {
        const h = t.height || 0;
        if (!h || seen.has(h)) return false;
        seen.add(h);
        return true;
      });
    } catch (e) {
      return [];
    }
  }

  renderAudioMenu() {
    const tracks = this.getAudioTracks();
    
    let html = this.renderBackHeader('Audio');
    html += '<div class="settings-options-list">';
    
    if (tracks.length === 0) {
      html += '<div class="settings-option-item disabled">No audio tracks available</div>';
    } else {
      tracks.forEach(t => {
        const lang = (t.language || '').toLowerCase();
        const label = lang.toUpperCase();
        const isActive = this._currentAudio === lang;
        html += `
          <div class="settings-option-item ${isActive ? 'active' : ''}" data-lang="${lang}">
            <span class="settings-option-check">${isActive ? ICONS.check : ''}</span>
            <span class="settings-option-label">${label}</span>
          </div>
        `;
      });
    }
    html += '</div>';
    
    this.settingsPanelInner.innerHTML = html;
    this.bindBackButton();
    
    this.settingsPanelInner.querySelectorAll('.settings-option-item[data-lang]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = item.dataset.lang;
        this._currentAudio = lang;
        try { this.player.selectAudioLanguage(lang); } catch (e) {}
        this.currentPanel = 'main';
        this.renderSettingsPanel();
      });
    });
  }

  renderSubtitlesMenu() {
    const tracks = this.getSubtitleTracks();
    
    let html = this.renderBackHeader('Subtitles');
    html += '<div class="settings-options-list">';
    
    // Off option
    const offActive = this._currentSubs === 'off';
    html += `
      <div class="settings-option-item ${offActive ? 'active' : ''}" data-subs="off">
        <span class="settings-option-check">${offActive ? ICONS.check : ''}</span>
        <span class="settings-option-label">Off</span>
      </div>
    `;
    
    if (tracks.length === 0) {
      html += '<div class="settings-option-item disabled">No subtitles available</div>';
    } else {
      tracks.forEach(t => {
        const lang = (t.language || '').toLowerCase();
        const label = lang.toUpperCase();
        const isActive = this._currentSubs === lang;
        html += `
          <div class="settings-option-item ${isActive ? 'active' : ''}" data-subs="${lang}" data-track-id="${t.id || ''}">
            <span class="settings-option-check">${isActive ? ICONS.check : ''}</span>
            <span class="settings-option-label">${label}</span>
          </div>
        `;
      });
    }
    html += '</div>';
    
    this.settingsPanelInner.innerHTML = html;
    this.bindBackButton();
    
    this.settingsPanelInner.querySelectorAll('.settings-option-item[data-subs]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const subs = item.dataset.subs;
        this._currentSubs = subs;
        if (subs === 'off') {
          try { this.player.setTextTrackVisibility(false); } catch (e) {}
        } else {
          const tracks = this.getSubtitleTracks();
          const track = tracks.find(t => (t.language || '').toLowerCase() === subs);
          if (track) {
            try {
              this.player.selectTextTrack(track);
              this.player.setTextTrackVisibility(true);
            } catch (e) {}
          }
        }
        this.currentPanel = 'main';
        this.renderSettingsPanel();
      });
    });
  }

  renderSpeedMenu() {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    
    let html = this.renderBackHeader('Speed');
    html += '<div class="settings-options-list">';
    
    speeds.forEach(s => {
      const isActive = this._currentSpeed === s;
      const label = s === 1 ? 'Normal' : `${s}x`;
      html += `
        <div class="settings-option-item ${isActive ? 'active' : ''}" data-speed="${s}">
          <span class="settings-option-check">${isActive ? ICONS.check : ''}</span>
          <span class="settings-option-label">${label}</span>
        </div>
      `;
    });
    html += '</div>';
    
    this.settingsPanelInner.innerHTML = html;
    this.bindBackButton();
    
    this.settingsPanelInner.querySelectorAll('.settings-option-item[data-speed]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = parseFloat(item.dataset.speed);
        this._currentSpeed = speed;
        try { this.video.playbackRate = speed; } catch (e) {}
        this.currentPanel = 'main';
        this.renderSettingsPanel();
      });
    });
  }

  renderQualityMenu() {
    const tracks = this.getQualityTracks();
    
    let html = this.renderBackHeader('Quality');
    html += '<div class="settings-options-list">';
    
    // Auto option
    const autoActive = this._currentQuality === 'auto';
    html += `
      <div class="settings-option-item ${autoActive ? 'active' : ''}" data-quality="auto">
        <span class="settings-option-check">${autoActive ? ICONS.check : ''}</span>
        <span class="settings-option-label">Auto</span>
      </div>
    `;
    
    if (tracks.length === 0) {
      html += '<div class="settings-option-item disabled">No quality options</div>';
    } else {
      // Sort by height descending
      const sorted = [...tracks].sort((a, b) => (b.height || 0) - (a.height || 0));
      sorted.forEach(t => {
        const h = t.height || 0;
        const isActive = this._currentQuality === h;
        html += `
          <div class="settings-option-item ${isActive ? 'active' : ''}" data-quality="${h}">
            <span class="settings-option-check">${isActive ? ICONS.check : ''}</span>
            <span class="settings-option-label">${h}p</span>
          </div>
        `;
      });
    }
    html += '</div>';
    
    this.settingsPanelInner.innerHTML = html;
    this.bindBackButton();
    
    this.settingsPanelInner.querySelectorAll('.settings-option-item[data-quality]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const quality = item.dataset.quality;
        if (quality === 'auto') {
          this._currentQuality = 'auto';
          try { this.player.configure({ abr: { enabled: true } }); } catch (e) {}
        } else {
          const h = parseInt(quality);
          this._currentQuality = h;
          try {
            this.player.configure({ abr: { enabled: false } });
            const tracks = this.player.getVariantTracks();
            const match = tracks.filter(t => t.height === h);
            if (match.length > 0) this.player.selectVariantTrack(match[0], true);
          } catch (e) {}
        }
        this.currentPanel = 'main';
        this.renderSettingsPanel();
      });
    });
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
    // Update current selections based on player state
    const audioTracks = this.getAudioTracks();
    if (audioTracks.length > 0 && !this._currentAudio) {
      // Find active or set to system language
      const systemTrack = audioTracks.find(t => (t.language || '').toLowerCase() === this._systemLang);
      this._currentAudio = systemTrack ? this._systemLang : (audioTracks[0].language || '').toLowerCase();
    }
  }

  destroy() {
    clearTimeout(this.hideTimer);
    this.container.innerHTML = '';
  }
}