# 🎓 SENA 3D - Experiencia Inmersiva Completa

## 🌟 Descripción

**SENA 3D** es una **experiencia inmersiva en 3D** del campus SENA Manizales, inspirada en el estilo visual de **Jujutsu Kaisen** (Templo Malevolo de Sukuna). Este proyecto ofrece:

- 🏗️ **Campus 3D detallado** con pasillos, salones, baños, biblioteca, cafetería y laboratorios
- 👥 **NPCs interactivos** (estudiantes, profesores, personal) con vestuario y animaciones
- 🕶️ **Soporte VR completo** con WebXR para experiencia inmersiva
- ✨ **Efectos realistas**: clima dinámico, iluminación, partículas y sonidos
- 🎨 **UI moderna** con paneles, diálogos y minimapa
- 🎮 **Controles flexibles**: teclado/mouse y VR

## 🚀 Características Principales

### 🏛️ Arquitectura del Campus

- **Edificios completos**: 2 pisos con múltiples salones
- **Pasillos detallados**: con iluminación y decoración
- **Salones de clases**: con mesas, sillas, pizarras y televisores
- **Baños**: con sanitarios, lavabos y accesorios
- **Biblioteca**: con estanterías, libros y mesas de lectura
- **Cafetería**: con mesas redondas, mostrador de comida y neveras
- **Laboratorios**: con computadoras, mesas de trabajo y proyectores
- **Exteriores**: caminos, estacionamiento y áreas verdes

### 👥 Sistema de NPCs

- **3 tipos de NPCs**: estudiantes, profesores y personal
- **Vestuario variado**: uniformes, ropa formal y casual
- **Animaciones**: caminar, estar de pie, sentado, enseñar, saludar
- **Interacción**: diálogos aleatorios y acciones contextuales
- **Movimiento autónomo**: NPCs que se mueven por el campus

### 🕶️ Realidad Virtual (WebXR)

- **Soporte completo para VR**: Oculus, HTC Vive, Windows Mixed Reality
- **Controles VR**:
  - **Trigger**: Interactuar / Agarrar objetos
  - **Grip**: Mover objetos
  - **Joystick**: Moverse por el campus
  - **Botones A/X**: Saltar
  - **Botones B/Y**: Correr
- **Raycasting**: Interacción precisa con objetos
- **Teletransportación**: Movimiento fluido en VR

### 🎨 Efectos Visuales

- **Clima dinámico**: despejado, lluvia, niebla, tormenta
- **Ciclo día/noche**: transiciones suaves de iluminación
- **Partículas**: polvo, lluvia, niebla
- **Iluminación realista**: sombras, luces de techo, luces exteriores
- **Materiales PBR**: texturas realistas con roughness y metalness

### 🎮 Controles

#### Teclado y Mouse (Modo Desktop)

| Tecla | Acción |
|-------|--------|
| W / ↑ | Mover adelante |
| S / ↓ | Mover atrás |
| A / ← | Mover izquierda |
| D / → | Mover derecha |
| Shift | Correr |
| Espacio | Saltar |
| C | Agacharse |
| E | Interactuar |
| M | Silenciar/Activar sonido |
| N | Cambiar clima |
| T | Iniciar tour automático |
| V | Alternar VR |
| Esc | Soltar mouse / Abrir menú |

#### Controles VR

- **Trigger**: Interactuar / Agarrar
- **Grip**: Mover objetos
- **Joystick**: Moverse
- **Botón A/X**: Saltar
- **Botón B/Y**: Correr

### 📱 Interfaz de Usuario

- **Minimapa**: Mapa del campus con posición del jugador
- **Panel de controles**: Lista de atajos de teclado
- **Panel de ubicación**: Información del lugar actual
- **Barra de estado**: FPS, coordenadas, clima, hora
- **Sistema de diálogos**: Interacción con NPCs
- **Notificaciones**: Mensajes emergentes
- **Menú de configuración**: Ajustes de sonido, visuales y controles
- **Panel VR**: Información y controles de realidad virtual

## 📁 Estructura del Proyecto

```
sena-3d/
├── index.html                      # Página principal
├── package.json                    # Dependencias
├── vite.config.js                  # Configuración de Vite
├── README.md                       # Documentación
├── .gitignore                      # Archivos ignorados
├── public/                         # Assets estáticos
│   ├── textures/                   # Texturas
│   ├── models/                     # Modelos 3D
│   └── sounds/                     # Sonidos
└── src/
    ├── index.js                     # Exportación de módulos
    ├── main.js                      # Aplicación principal
    ├── intro.js                     # Intro épica Jujutsu Kaisen
    ├── styles.css                   # Estilos CSS
    ├── world/
    │   ├── World.js                 # Sistema de mundo
    │   └── Building.js               # Sistema de edificios
    ├── npcs/
    │   └── NPC.js                   # Sistema de NPCs
    ├── vr/
    │   └── VRManager.js             # Gestor de VR
    ├── ui/
    │   ├── UIManager.js             # Gestor de UI
    │   └── Minimap.js                # Sistema de minimapa
    └── utils/
        └── Utils.js                 # Funciones utilitarias
```

## 🛠️ Instalación

### Requisitos

- Node.js 18+ 
- npm o yarn
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Dispositivo VR opcional (Oculus, HTC Vive, etc.)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/juanpablobecerrasaavedra51-hash/sena-3d.git
   cd sena-3d
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir el navegador:**
   ```
   http://localhost:5173
   ```

### Producción

Para construir la versión de producción:
```bash
npm run build
```

Para previsualizar la versión de producción:
```bash
npm run preview
```

## 🎯 Uso

### Exploración Libre

1. Usa **WASD** para moverte por el campus
2. Usa el **mouse** para mirar alrededor
3. Presiona **E** para interactuar con objetos y NPCs
4. Presiona **Shift** para correr
5. Presiona **Espacio** para saltar

### Modo VR

1. Conecta tu dispositivo VR
2. Presiona **V** para abrir el panel de VR
3. Haz clic en **Iniciar VR**
4. Usa los controles del dispositivo para moverte e interactuar

### Tour Automático

1. Presiona **T** para iniciar el tour
2. El sistema te guiará por los lugares más importantes del campus
3. Puedes cancelar el tour en cualquier momento

## 🎨 Personalización

### Añadir nuevos edificios

Edita el archivo `src/world/World.js` y añade nuevos edificios en el método `createCampus()`:

```javascript
// Ejemplo: Añadir un nuevo edificio
const newBuilding = new Building(this.scene, { x: 100, y: 0, z: -100 });
newBuilding.createClassroom(12, 10, 4, 'Nuevo Salón');
this.buildings.push(newBuilding);
```

### Añadir nuevos NPCs

Edita el archivo `src/world/World.js` y añade nuevos NPCs en el método `createNPCs()`:

```javascript
// Ejemplo: Añadir un nuevo NPC
const newNPC = new NPC(this.scene, { x: 50, y: 0, z: 50 }, {
    type: 'teacher',
    gender: 'male',
    outfit: 'formal',
    role: 'teaching'
});
this.npcs.push(newNPC);
```

### Cambiar el clima

Usa el método `setWeather()` del mundo:

```javascript
this.world.setWeather('rain'); // lluvia
this.world.setWeather('fog'); // niebla
this.world.setWeather('storm'); // tormenta
this.world.setWeather('clear'); // despejado
```

### Añadir objetos interactivos

Añade objetos al array `interactiveObjects` en el mundo:

```javascript
const newObject = new THREE.Mesh(geometry, material);
newObject.userData = {
    type: 'custom',
    interactive: true,
    action: () => console.log('Objeto interactivo')
};
this.scene.add(newObject);
this.interactiveObjects.push(newObject);
```

## 🎵 Sonido y Música

Para agregar sonido:

1. Coloca los archivos de audio en `public/sounds/`
2. Usa el sistema de audio en `src/utils/Utils.js`:

```javascript
import { Utils } from './utils/Utils.js';

// Cargar sonido
const audio = await Utils.loadAudio('/sounds/background.mp3');

// Reproducir sonido
Utils.playSound(audio, 0.5, true); // volumen 0.5, loop true

// Detener sonido
Utils.stopSound(audio);
```

## 📸 Capturas de Pantalla

El proyecto incluye varias capturas de pantalla que muestran:
- La intro épica con efectos de energía maldita
- El campus 3D con edificios detallados
- Los salones de clases con mobiliario
- La biblioteca con estanterías y libros
- La cafetería con mesas y mostrador
- Los NPCs interactivos
- La interfaz de usuario
- El modo VR

## 🐛 Solución de Problemas

### El proyecto no carga
- Verifica que Node.js esté instalado
- Ejecuta `npm install` para instalar dependencias
- Asegúrate de que tu navegador soporte WebGL

### La intro no se muestra
- Verifica que el contenedor `#intro-canvas` exista en el HTML
- Asegúrate de que Three.js esté correctamente importado

### El modo VR no funciona
- Verifica que tu navegador soporte WebXR
- Usa Chrome o Edge para mejor compatibilidad
- Asegúrate de que tu dispositivo VR esté conectado

### Bajo rendimiento
- Reduce la cantidad de NPCs en `createNPCs()`
- Desactiva el bloom pass en la configuración de post-procesamiento
- Reduce la resolución de las sombras

### Errores de texturas
- Asegúrate de que las rutas de las texturas sean correctas
- Verifica que los archivos de textura existan en `public/textures/`

## 📜 Licencia

MIT License - Libre para uso personal y comercial.

## 🙏 Agradecimientos

- **Three.js**: Por el increíble motor 3D
- **WebXR**: Por el soporte de realidad virtual
- **Jujutsu Kaisen**: Por la inspiración visual
- **SENA Manizales**: Por el modelo 3D del campus
- **Font Awesome**: Por los iconos
- **Google Fonts**: Por las tipografías

## 📞 Contacto

Para preguntas o sugerencias, abre un **Issue** en el repositorio o contacta al autor.

---

**¡Disfruta de la experiencia 3D más inmersiva del campus SENA!** 🎮✨

> **Nota**: Este proyecto está en constante evolución. Se planean futuras mejoras como:
> - Más edificios y áreas del campus
> - Sistema de misiones y logros
> - Multijugador en línea
> - Realidad Aumentada (AR)
> - Integración con bases de datos reales del SENA
