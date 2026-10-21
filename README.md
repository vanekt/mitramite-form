# Unofficial Mitramite Status Form

Chrome extension that restores the trámite status lookup form on https://mitramite.renaper.gob.ar/. The site's own form is no longer rendered, but its `busqueda.php` API still works; this extension adds a form back and shows the stage progress, current status and history from the API response.

**Not affiliated with, endorsed by or connected to RENAPER or the Argentine government.**

## Install from ZIP

1. Download `mitramite-form-<version>.zip` from the [latest release](https://github.com/vanekt/mitramite-form/releases/latest) and unzip it into a folder you will keep (do not delete or move it afterwards).
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder.
4. Open https://mitramite.renaper.gob.ar/ and enter a trámite number.

Works in Chrome 111+ and other Chromium-based browsers. Chrome may show a "disable developer mode extensions" notice on startup, and extensions installed this way do not update automatically.

## Install (from source)

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Open https://mitramite.renaper.gob.ar/ and enter a trámite number.

Saved case numbers are kept only in your browser's local storage. See [PRIVACY.md](PRIVACY.md).

## Development

No build step. Edit `content.js`, run `node --check content.js`, then reload the extension on `chrome://extensions` and refresh the page.
