# Unofficial Mitramite Status Form

Chrome extension that restores the trámite status lookup form on https://mitramite.renaper.gob.ar/. The site's own form is no longer rendered, but its `busqueda.php` API still works; this extension adds a form back and shows the stage progress, current status and history from the API response.

**Not affiliated with, endorsed by or connected to RENAPER or the Argentine government.**

## Install (from source)

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.
3. Open https://mitramite.renaper.gob.ar/ and enter a trámite number.

Saved case numbers are kept only in your browser's local storage. See [PRIVACY.md](PRIVACY.md).

## Development

No build step. Edit `content.js`, run `node --check content.js`, then reload the extension on `chrome://extensions` and refresh the page.
