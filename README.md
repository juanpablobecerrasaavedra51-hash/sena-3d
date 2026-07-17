# SENA 3D - Experiencia Inmersiva

## 🎮 Descripción

**SENA 3D** es una experiencia inmersiva en 3D inspirada en el estilo visual de **Jujutsu Kaisen**, específicamente en el **Templo Malevolo de Sukuna**. Este proyecto combina un entorno 3D explorable del campus SENA Manizales con una **intro épica** que impacta a simple vista.

## ✨ Características

### 🎬 Intro Épica (NUEVO!)
- **Diseño inspirado en Jujutsu Kaisen**: Colores oscuros, energía maldita y estilo visual único
- **Animaciones fluidas**: Logo animado, partículas dinámicas y efectos de energía
- **Efectos de post-procesamiento**: Bloom, glow y efectos visuales profesionales
- **Transiciones suaves**: Entrada y salida elegantes
- **Impacto visual**: Diseño que cautiva desde el primer momento

### 🏗️ Entorno 3D
- **Campus SENA Manizales**: Modelo 3D detallado del campus
- **Navegación libre**: Modo Orbit Controls para exploración
- **Modo FPS**: Pointer Lock Controls para inmersión total
- **Física básica**: Colisiones y movimiento realista

### 🎨 Diseño Visual
- **Tema oscuro**: Paleta de colores inspirada en Jujutsu Kaisen
- **UI moderna**: Interfaz limpia y profesional
- **Efectos de luz**: Iluminación dinámica y sombras
- **Clima variable**: Cambio entre diferentes condiciones climáticas

### ⌨️ Controles
- **WASD / Flechas**: Movimiento
- **Mouse**: Mirar (en modo FPS) o rotar cámara (en modo libre)
- **Shift**: Correr
- **Espacio**: Saltar
- **C**: Agacharse
- **E**: Interactuar
- **M**: Silenciar/Activar sonido
- **N**: Cambiar clima
- **T**: Iniciar tour automático
- **Esc**: Soltar mouse

## 🚀 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

1. Clonar el repositorio:
```bash
git clone https://github.com/juanpablobecerrasaavedra51-hash/sena-3d.git
cd sena-3d
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Abrir el navegador en `http://localhost:5173`

### Producción

Para construir la versión de producción:
```bash
npm run build
```

Para previsualizar la versión de producción:
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
sena-3d/
├── index.html              # Página principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── src/
│   ├── main.js             # Aplicación principal
│   ├── intro.js            # Intro épica (NUEVO!)
│   └── styles.css          # Estilos adicionales
├── public/                 # Assets estáticos
└── Meshy_AI_...glb         # Modelo 3D del campus
```

## 🎨 Personalización

### Cambiar la intro
Edita el archivo `src/intro.js` para modificar:
- Colores (parámetros en el constructor)
- Animaciones (métodos `animateIn` y `animateOut`)
- Geometrías (métodos `createLogo`, `createParticles`, etc.)

### Cambiar el entorno 3D
Edita el archivo `src/main.js` para modificar:
- Modelo 3D (método `loadModel`)
- Iluminación (método `setupLights`)
- Entorno (método `createEnvironment`)

### Cambiar estilos
Edita el archivo `index.html` o `src/styles.css` para modificar:
- Colores de la UI
- Posiciones de los paneles
- Animaciones CSS

## 🎯 Tecnologías Utilizadas

- **Three.js**: Motor 3D para la web
- **Vite**: Bundler rápido y moderno
- **GSAP**: Animaciones avanzadas
- **HTML5/CSS3**: Estructura y estilos
- **JavaScript ES6+**: Lógica de la aplicación

## 📸 Capturas de Pantalla

El proyecto incluye varias capturas de pantalla en el repositorio que muestran:
- La intro épica con efectos de energía
- El entorno 3D del campus
- La interfaz de usuario
- Diferentes vistas del modelo

## 🎵 Música y Sonido (Opcional)

Para agregar música de fondo a la intro:

1. Añade un archivo de audio en `public/audio/`
2. Modifica `src/intro.js` para cargar y reproducir el audio

Ejemplo:
```javascript
// En el constructor de JujutsuIntro
this.audio = new Audio('/audio/intro-music.mp3');
this.audio.loop = false;
this.audio.volume = 0.5;

// En animateIn()
this.audio.play();
```

## 🐛 Solución de Problemas

### El modelo 3D no carga
- Verifica que el archivo `.glb` esté en la raíz del proyecto
- Asegúrate de que la ruta en `loadModel()` sea correcta

### La intro no se muestra
- Verifica que el contenedor `#intro-canvas` exista en el HTML
- Asegúrate de que Three.js esté correctamente importado

### Bajo rendimiento
- Reduce la cantidad de partículas en `parameters.particleCount`
- Desactiva el bloom pass en `createPostProcessing()`

## 📜 Licencia

MIT License - Libre para uso personal y comercial.

## 🙏 Agradecimientos

- **Three.js**: Por el increíble motor 3D
- **Jujutsu Kaisen**: Por la inspiración visual
- **SENA Manizales**: Por el modelo 3D del campus

---

**¡Disfruta de la experiencia 3D!** 🎮✨
