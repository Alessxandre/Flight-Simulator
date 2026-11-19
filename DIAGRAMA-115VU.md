# Diagrama ENG 115VU

En la versión pública, el botón **Diagrama 115VU** de la barra del cockpit abre el diagrama de Ignition & Starting en Claude, en una pestaña nueva. Ese diagrama es privado: solo se ve con la sesión de su dueño.

Las figuras vienen de material de curso, así que no se incluyen en este repositorio.

## Versión sincronizada (solo uso local)

`src/ui/Diagram115VUPanel.tsx` contiene la ventana flotante que sincroniza ENG MASTER 1/2 y ENG MODE con el diagrama. Para usarla en tu computadora:

1. Copia la carpeta del diagrama (HTML + `img/`) en `public/diagram-115vu/`. No la subas a GitHub; agrégala a `.gitignore`.
2. En `src/App.tsx`, cambia el enlace `Diagrama 115VU` por el panel `<Diagram115VUPanel />`.
