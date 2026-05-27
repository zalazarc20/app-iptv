class PlayerControls {
  constructor(video, player, container) {
    this.video = video;
    this.player = player;
    this.container = container;
    this.settingsOpen = false;
    this.isSeeking = false;
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
            <button class="ctrl-btn" id="playBtn">▶</button>
            <span class="ctrl-time" id="timeDisplay">0:00 / 0:00</span>
          </div>
          <div class="controls-right">
            <div class="volume-section">
              <button class="ctrl-btn" id="muteBtn">🔊</button>
              <input type="range" id="volumeBar" min="0" max="1" value="1" step="0.05">
            </div>
            <button class="ctrl-btn" id="settingsBtn">⚙</button>
            <button class="ctrl-btn cast-btn" id="castBtn" title="Cast">📺</button>
            <button class="ctrl-btn" id="fullscreenBtn">⛶</button>
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

  bindVideoEvents() {
    this.video.addEventListener('play', () => { this.playBtn.textContent = '⏸'; this.show(); });
    this.video.addEventListener('pause', () => { this.playBtn.textContent = '▶'; this.show(); });
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateTime());
    this.video.addEventListener('progress', () => this.updateBuffered());
    this.video.addEventListener('volumechange', () => this.updateVolumeUI());
    this.video.addEventListener('waiting', () => this.show());
    this.video.addEventListener('ended', () => { this.playBtn.textContent = '↻'; });

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
    this.volumeBar.value = this.video.muted ? 0 : this.video.volume;
    this.muteBtn.textContent = this.video.muted || this.video.volume === 0 ? '🔇' : this.video.volume < 0.5 ? '🔉' : '🔊';
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
    this.populateQuality();
    this.populateAudio();
    this.populateSubs();
    this.populateSpeed();
  }

  populateQuality() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') {
      this.qualityOptions.innerHTML = '<div class="settings-option" style="color:#888;cursor:default">N/A</div>';
      return;
    }
    const tracks = this.player.getVariantTracks();
    const active = this.player.getActiveVariantTracks();
    const activeH = active.length > 0 ? active[0].height : -1;
    const seen = new Set();
    this.qualityOptions.innerHTML = '<div class="settings-option" data-value="auto">Auto</div>';
    tracks.filter(t => t.type === 'video').forEach(t => {
      const label = t.height ? `${t.height}p` : (t.width ? `${t.width}x${t.height}` : 'Unknown');
      if (seen.has(label)) return;
      seen.add(label);
      const opt = document.createElement('div');
      opt.className = 'settings-option' + (t.height === activeH ? ' active' : '');
      opt.textContent = label;
      opt.dataset.value = t.height;
      opt.addEventListener('click', () => this.selectQuality(opt, t.height, tracks));
      this.qualityOptions.appendChild(opt);
    });
    if (this.qualityOptions.children.length <= 1) {
      this.qualityOptions.innerHTML = '<div class="settings-option" style="color:#888;cursor:default">N/A</div>';
    }
  }

  selectQuality(el, height, tracks) {
    this.qualityOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    if (height === 'auto') {
      this.player.configure({ abr: { enabled: true } });
      return;
    }
    this.player.configure({ abr: { enabled: false } });
    const match = tracks.filter(t => t.type === 'video' && t.height === height);
    if (match.length > 0) this.player.selectVariantTrack(match[0], true);
  }

  populateAudio() {
    if (!this.player || typeof this.player.getVariantTracks !== 'function') {
      this.audioOptions.innerHTML = '<div class="settings-option" style="color:#888;cursor:default">N/A</div>';
      return;
    }
    const tracks = this.player.getVariantTracks().filter(t => t.type === 'audio');
    if (tracks.length === 0) {
      this.audioOptions.innerHTML = '<div class="settings-option" style="color:#888;cursor:default">N/A</div>';
      return;
    }
    const currentLang = this.video.audioTracks && this.video.audioTracks.length > 0
      ? (this.video.audioTracks[0] || {}).language
      : (tracks[0] || {}).language;
    const seen = new Set();
    this.audioOptions.innerHTML = '';
    tracks.forEach(t => {
      const label = t.language ? t.language.toUpperCase() : 'Unknown';
      if (seen.has(label)) return;
      seen.add(label);
      const opt = document.createElement('div');
      opt.className = 'settings-option' + (t.language === currentLang ? ' active' : '');
      opt.textContent = label;
      opt.dataset.value = t.language;
      opt.addEventListener('click', () => this.selectAudio(opt, t.language));
      this.audioOptions.appendChild(opt);
    });
  }

  selectAudio(el, lang) {
    this.audioOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    this.player.selectAudioLanguage(lang);
  }

  populateSubs() {
    if (!this.player || typeof this.player.getTextTracks !== 'function') {
      this.subsOptions.innerHTML = '<div class="settings-option" data-value="off">Off</div><div class="settings-option" style="color:#888;cursor:default">N/A</div>';
      return;
    }
    const tracks = this.player.getTextTracks();
    this.subsOptions.innerHTML = '<div class="settings-option" data-value="off">Off</div>';
    if (tracks.length === 0) {
      this.subsOptions.innerHTML += '<div class="settings-option" style="color:#888;cursor:default">N/A</div>';
      return;
    }
    const activeLang = this.player.getTextTracks().filter(t => t.active)[0];
    const current = activeLang ? activeLang.language : null;
    const seen = new Set();
    tracks.forEach(t => {
      const label = t.language ? t.language.toUpperCase() : 'Unknown';
      if (seen.has(label)) return;
      seen.add(label);
      const opt = document.createElement('div');
      opt.className = 'settings-option' + (t.language === current ? ' active' : '');
      opt.textContent = label;
      opt.dataset.value = t.language;
      opt.addEventListener('click', () => this.selectSubs(opt, t));
      this.subsOptions.appendChild(opt);
    });
  }

  selectSubs(el, track) {
    this.subsOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    if (el.dataset.value === 'off') {
      this.player.setTextTrackVisibility(false);
      return;
    }
    this.player.selectTextTrack(track);
    this.player.setTextTrackVisibility(true);
  }

  populateSpeed() {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const current = this.video.playbackRate;
    this.speedOptions.innerHTML = '';
    speeds.forEach(s => {
      const opt = document.createElement('div');
      opt.className = 'settings-option' + (s === current ? ' active' : '');
      opt.textContent = s === 1 ? 'Normal' : `${s}x`;
      opt.dataset.value = s;
      opt.addEventListener('click', () => this.selectSpeed(opt, s));
      this.speedOptions.appendChild(opt);
    });
  }

  selectSpeed(el, speed) {
    this.speedOptions.querySelectorAll('.settings-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    this.video.playbackRate = speed;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      const el = this.video.closest('.shaka-video-container') || this.video.parentElement;
      el.requestFullscreen().catch(() => this.video.requestFullscreen().catch(() => {}));
    } else {
      document.exitFullscreen().catch(() => {});
    }
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
