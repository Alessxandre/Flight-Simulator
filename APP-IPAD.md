# Instalar el simulador como app en el iPad

La app se publica sola en GitHub Pages cada vez que subes cambios a `main`.

## Una sola vez: activar GitHub Pages

En github.com, abre tu repositorio y ve a **Settings → Pages**. En **Build and deployment → Source**, elige **GitHub Actions**.

Con una cuenta gratuita, el repositorio tiene que ser público para usar Pages.

## Publicar

```bash
npm run build          # comprueba que compila sin errores
git add -A
git commit -m "App instalable (PWA) y publicación en GitHub Pages"
git push
```

En la pestaña **Actions** del repositorio verás «Publicar app en GitHub Pages». Cuando termine en verde, la app queda en:

`https://<tu-usuario>.github.io/<nombre-del-repositorio>/`

## Instalar en el iPad

1. Abre esa dirección en Safari (o Edge).
2. Entra una vez al cockpit con internet y espera a que cargue el modelo 3D (unos 60 MB). Así queda guardado para usarse sin conexión.
3. Toca **Compartir → Agregar a pantalla de inicio**.

## Actualizaciones

Cada `git push` publica una versión nueva. La app toma el código nuevo la próxima vez que la abras con internet. Si cambias modelos, sonidos o figuras del diagrama, sube `VERSION` en `public/sw.js` (por ejemplo, de `v1` a `v2`) para que los iPads descarguen todo de nuevo.

## Privacidad

El repositorio y el sitio son públicos, pero no incluyen las figuras del manual. El botón **Diagrama 115VU** abre el diagrama privado en Claude, que solo se ve con tu sesión iniciada.
