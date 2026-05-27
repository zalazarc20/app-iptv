# Stream Sniffer + Player

[English](#english) | [Español](#español)

---

## English

### What is it?

A Chrome extension that **automatically detects** video/stream URLs (HLS, DASH, MP4, M3U playlists) when you browse the web, and lets you play them instantly in a built-in player with Clearkey DRM support.

No more hunting for stream URLs in page source or network tabs. The extension does it for you.

### Features

- **Network Sniffer** — intercepts `m3u8`, `mpd`, `m3u`, `mp4` requests as you browse
- **Overlay** — a floating bar on every page showing detected streams with Play/Copy buttons
- **Popup** — shows all detected media URLs for the current tab, with toggle controls
- **HLS Player** — uses `hls.js` for `.m3u8` streams
- **DASH Player** — uses `shaka-player` for `.mpd` streams with **Clearkey DRM**
- **IPTV Player** — loads M3U playlists, channel list with search, EPG (multi-source)
- **Clearkey Detection** — automatically detects clearkey from page HTML (JWPlayer config, data attributes, license_key) when sniffing MPD/M3U8 URLs
- **Custom Controls** — YouTube-style purple-themed controls with quality/audio/subtitles/speed/fullscreen/cast
- **Direct Play** — click `.mpd`/`.m3u8` links to play directly (optional)
- **M3U Redirect** — click `.m3u` links to open the IPTV player automatically
- **Auto-Play** — optional auto-redirect for all or matching domains
- **Settings** — per-player settings page

### Installation (Unpacked)

**Download:** [scrapi-v2.vercel.app/extension.zip](https://scrapi-v2.vercel.app/extension.zip)

1. Download the `.zip` and extract it to a folder
2. Open **chrome://extensions**
3. Enable **Developer mode** (toggle top right)
4. Click **Load unpacked**
5. Select the extracted folder
6. Done. Pin the extension for quick access (optional)

Or if you prefer cloning the repo:

```bash
git clone https://github.com/zalazarc20/app-iptv.git
```
Then follow steps 2–6 above.

#### Packaging as .zip

Run the included `build.sh` to generate `extension.zip`:

```bash
bash build.sh
```
The zip excludes `.git/`, `build.sh`, and any existing `.zip` files. Useful for sharing or manual deployment.

### Usage

1. Browse any site with video streams (e.g. `telelibree.com`, any IPTV site)
2. The overlay bar appears when a stream is detected
3. Click **Play** to open the player, or **Copy** to copy the URL
4. Click the extension icon to open the popup with all detected URLs and toggle settings
5. For IPTV: click a `.m3u` link or paste a playlist URL in the popup/IPTV player
6. Keyboard shortcuts:
   - `Alt+Shift+S` — open popup
   - `Space` — play/pause
   - `F` or `Enter` — toggle fullscreen
   - `M` — mute/unmute
   - `Ctrl+F` — focus IPTV channel search

### Files

| File | Purpose |
|---|---|
| `background.js` | Service worker: sniffs network requests, manages DNR rules, message routing |
| `manifest.json` | Extension manifest (MV3) |
| `pages/overlay.js` + `.css` | Floating overlay injected into pages |
| `pages/popup.html` + `.js` + `.css` | Extension popup |
| `pages/options.html` | Options page |
| `player/player.html` + `.js` + `.css` | HLS/DASH direct player |
| `player/iptv-player.html` + `.js` + `.css` | IPTV player (channels + EPG) |
| `player/player-controls.js` + `.css` | Custom video controls (purple theme) |
| `player/settings.html` | Per-player settings |
| `js/hls.min.js` | hls.js library |
| `js/shaka-player.compiled.js` | shaka-player library (no UI module) |

---

## Español

### ¿Qué es?

Una extensión de Chrome que **detecta automáticamente** URLs de video/streaming (HLS, DASH, MP4, listas M3U) mientras navegas por la web, y te permite reproducirlas al instante en un reproductor integrado con soporte para Clearkey DRM.

Olvídate de buscar URLs en el código fuente o en la pestaña de red. La extensión lo hace por ti.

### Funcionalidades

- **Sniffer de red** — intercepta peticiones `m3u8`, `mpd`, `m3u`, `mp4` mientras navegas
- **Overlay** — barra flotante en cada página que muestra los streams detectados con botones Play/Copiar
- **Popup** — muestra todas las URLs de medios detectadas en la pestaña actual, con controles de configuración
- **Reproductor HLS** — usa `hls.js` para streams `.m3u8`
- **Reproductor DASH** — usa `shaka-player` para streams `.mpd` con **Clearkey DRM**
- **Reproductor IPTV** — carga listas M3U, lista de canales con búsqueda, EPG (multifuente)
- **Detección de Clearkey** — detecta automáticamente clearkey desde el HTML de la página (config JWPlayer, atributos data, license_key) al interceptar URLs MPD/M3U8
- **Controles personalizados** — controles estilo YouTube con tema púrpura, calidad/audio/subtitulos/velocidad/pantalla completa/cast
- **Reproducción directa** — haz clic en enlaces `.mpd`/`.m3u8` para reproducir directamente (opcional)
- **Redirección M3U** — haz clic en enlaces `.m3u` para abrir el reproductor IPTV automáticamente
- **Auto-Play** — redirección automática opcional para todos o dominios específicos
- **Ajustes** — página de configuración por reproductor

### Instalación (sin empaquetar)

**Descargar:** [scrapi-v2.vercel.app/extension.zip](https://scrapi-v2.vercel.app/extension.zip)

1. Descargá el `.zip` y extraelo en una carpeta
2. Abre **chrome://extensions**
3. Activa **Modo desarrollador** (interruptor arriba a la derecha)
4. Haz clic en **Cargar extensión sin empaquetar**
5. Seleccioná la carpeta donde extrajiste el zip
6. Listo. Fija la extensión para acceso rápido (opcional)

O si preferís clonar el repo:

```bash
git clone https://github.com/zalazarc20/app-iptv.git
```
Luego seguí los pasos 2–6 de arriba.

#### Empaquetar como .zip

Corré el `build.sh` incluido para generar `extension.zip`:

```bash
bash build.sh
```
El zip excluye `.git/`, `build.sh` y cualquier `.zip` existente. Útil para compartir o distribución manual.

### Uso

1. Navega a cualquier sitio con streams de video (ej. `telelibree.com`, cualquier sitio IPTV)
2. La barra overlay aparece cuando se detecta un stream
3. Haz clic en **Play** para abrir el reproductor, o **Copy** para copiar la URL
4. Haz clic en el ícono de la extensión para abrir el popup con todas las URLs detectadas y controles
5. Para IPTV: haz clic en un enlace `.m3u` o pega una URL de lista en el popup/reproductor IPTV
6. Atajos de teclado:
   - `Alt+Shift+S` — abrir popup
   - `Space` — reproducir/pausar
   - `F` o `Enter` — pantalla completa
   - `M` — silenciar/activar sonido
   - `Ctrl+F` — enfocar búsqueda de canales IPTV

### Archivos

| Archivo | Propósito |
|---|---|
| `background.js` | Service worker: intercepta peticiones de red, gestiona reglas DNR, enrutamiento de mensajes |
| `manifest.json` | Manifiesto de la extensión (MV3) |
| `pages/overlay.js` + `.css` | Overlay flotante inyectado en las páginas |
| `pages/popup.html` + `.js` + `.css` | Popup de la extensión |
| `pages/options.html` | Página de opciones |
| `player/player.html` + `.js` + `.css` | Reproductor directo HLS/DASH |
| `player/iptv-player.html` + `.js` + `.css` | Reproductor IPTV (canales + EPG) |
| `player/player-controls.js` + `.css` | Controles de video personalizados (tema púrpura) |
| `player/settings.html` | Ajustes por reproductor |
| `js/hls.min.js` | Librería hls.js |
| `js/shaka-player.compiled.js` | Librería shaka-player (sin módulo UI) |
