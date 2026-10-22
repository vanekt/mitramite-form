# Unofficial Mitramite Status Form

[EN](README.md) | **ES** | [RU](README-RU.md)

**Instalá la extensión, abrí https://mitramite.renaper.gob.ar/ y el formulario de consulta vuelve a aparecer.**

Extensión de Chrome que restaura el formulario de consulta de trámites en https://mitramite.renaper.gob.ar/. El formulario original de la página ya no se muestra, pero el servicio de consulta sigue funcionando; esta extensión vuelve a agregarlo y muestra las etapas del proceso, el estado actual y el historial de seguimiento.

**No está afiliada, respaldada ni conectada con el RENAPER ni con el Gobierno argentino.**

![Captura de pantalla](docs/screenshot.jpg)

## Funciones

- Formulario de consulta en la página: ingresá el número de trámite y mirá su estado.
- Etapas del proceso (Inicio, Verificación, Producción, Embalaje, Correo), estado actual y anterior, forma de entrega, oficina y fecha de inicio.
- Historial completo de seguimiento, incluidos los movimientos del correo.
- Recuerda los números que consultaste y te los sugiere al hacer foco en el campo; no se consulta nada hasta que elijas uno.
- Actualización con un clic y diseño adaptable a ventanas chicas.
- La interfaz está en español, igual que el sitio.

## Instalación

[**Instalar desde Chrome Web Store**](https://chromewebstore.google.com/detail/unofficial-mitramite-stat/afjbckgljnnaimdckbgaigfjnnmlobai), o instalala manualmente desde un ZIP, como se explica abajo.

### Desde un ZIP

1. Descargá `mitramite-form-<versión>.zip` desde el [último release](https://github.com/vanekt/mitramite-form/releases/latest) y descomprimilo en una carpeta que vayas a conservar (no la borres ni la muevas después).
2. Abrí `chrome://extensions` y activá el **Modo desarrollador**.
3. Hacé clic en **Cargar descomprimida** y elegí la carpeta descomprimida.

Funciona en Chrome 111+ y en otros navegadores basados en Chromium. Chrome puede mostrar un aviso sobre extensiones en modo desarrollador al iniciar, y las extensiones instaladas de esta forma no se actualizan solas.

## Uso

Instalá la extensión y luego abrí https://mitramite.renaper.gob.ar/, ingresá un número de trámite y presioná el botón.

## Privacidad

La extensión envía el número que ingresás al servicio de consulta del propio sitio, igual que lo hacía el formulario original, y no recopila nada más. Los números guardados quedan en el almacenamiento local de tu navegador para ese sitio y podés eliminarlos desde la lista de sugerencias. Ver [PRIVACY.md](PRIVACY.md) (en inglés).
