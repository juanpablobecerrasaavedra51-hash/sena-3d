/**
 * SENA 3D EXPERIENCE - VERSIÓN COMPLETA
 * Experiencia inmersiva con:
 * - Campus 3D detallado (pasillos, salones, baños, etc.)
 * - NPCs interactivos con vestuario
 * - Soporte VR (WebXR)
 * - Efectos realistas (clima, iluminación dinámica)
 * - UI moderna y responsive
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// Importar nuestros módulos
import { JujutsuIntro } from './intro.js';
import { World } from './world/World.js';
import { NPC } from './npcs/NPC.js';
import { VRManager } from './vr/VRManager.js';
import { UIManager } from './ui/UIManager.js';

// Estados de la aplicación
const AppState = {
    LOADING: 'loading',
    INTRO: 'intro',
    MAIN: 'main'
};

class SENA3DApp {
    constructor() {
        // Configuración inicial
        this.state = AppState.LOADING;
        this.container = document.getElementById('app');
        this.loadingScreen = document.getElementById('loading-screen');
        this.introContainer = document.getElementById('intro-canvas');
        this.uiContainer = document.getElementById('ui-overlay');
        
        // Componentes principales
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pointerControls = null;
        this.world = null;
        this.vrManager = null;
        this.uiManager = null;
        this.intro = null;
        
        // Variables de movimiento
        this.clock = new THREE.Clock();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.prevTime = performance.now();
        
        // Raycaster para interacciones
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Inicializar
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupControls();
        this.setupLights();
        this.setupEventListeners();
        
        // Inicializar gestores
        this.uiManager = new UIManager(document.body);
        
        // Iniciar la intro después de cargar los recursos básicos
        this.startIntro();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            precision: "highp"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.softShadows = true;
        
        // Configurar XR
        this.renderer.xr.enabled = true;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 1, 1000);
        this.scene.name = 'main-scene';
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
        this.camera.name = 'main-camera';
    }
    
    setupControls() {
        // Orbit Controls para navegación libre
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 500;
        this.controls.enabled = false;
        
        // Pointer Lock Controls para modo FPS
        this.pointerControls = new PointerLockControls(
            this.camera,
            this.renderer.domElement
        );
        this.scene.add(this.pointerControls.getObject());
        this.pointerControls.enabled = false;
    }
    
    setupLights() {
        // Luz ambiental base
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Luz hemisférica
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a4a4a, 0.6);
        this.scene.add(hemiLight);
    }
    
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Keyboard
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse move
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // Mouse click para pointer lock
        this.renderer.domElement.addEventListener('click', () => {
            if (this.state === AppState.MAIN && !this.vrManager?.isEnabled()) {
                this.pointerControls.lock();
            }
        });
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => {
            console.log('Error al activar pointer lock');
        });
        
        // Evento para iniciar VR
        window.addEventListener('start-vr', () => {
            this.toggleVR();
        });
    }
    
    startIntro() {
        this.state = AppState.INTRO;
        
        // Mostrar la intro
        this.introContainer.style.display = 'block';
        this.uiManager.hideLoadingScreen();
        
        // Crear la intro épica
        this.intro = new JujutsuIntro(this.introContainer);
        
        // Después de 5 segundos, terminar la intro
        setTimeout(() => {
            this.endIntro();
        }, 5000);
    }
    
    endIntro() {
        if (this.intro) {
            this.intro.animateOut(() => {
                this.startMainApp();
            });
        } else {
            this.startMainApp();
        }
    }
    
    startMainApp() {
        this.state = AppState.MAIN;
        
        // Ocultar la intro
        this.introContainer.style.display = 'none';
        
        // Limpiar la intro
        if (this.intro) {
            this.intro.destroy();
            this.intro = null;
        }
        
        // Mostrar UI
        this.uiManager.panels.uiOverlay.classList.add('visible');
        
        // Activar controles
        this.controls.enabled = true;
        this.pointerControls.enabled = true;
        
        // Crear el mundo
        this.createWorld();
        
        // Crear el gestor de VR
        this.vrManager = new VRManager(this.renderer, this.camera, this.scene);
        
        // Registrar objetos interactivos con VR
        if (this.world) {
            const interactiveObjects = this.world.getInteractiveObjects();
            for (let i = 0; i < interactiveObjects.length; i++) {
                this.vrManager.registerInteractiveObject(interactiveObjects[i]);
            }
        }
        
        // Iniciar el loop de animación
        this.animate();
        
        // Actualizar UI
        this.uiManager.updateLocation('Campus SENA', 'Manizales - Colombia');
        this.uiManager.updateObjective('Explora el campus y descubre todos los secretos');
        
        // Mostrar mensaje de bienvenida
        setTimeout(() => {
            this.uiManager.showNotification(
                '¡Bienvenido al Campus SENA 3D! Usa WASD para moverte y E para interactuar',
                'info'
            );
        }, 1000);
    }
    
    createWorld() {
        // Crear el mundo con todos los elementos
        this.world = new World(this.scene, this.camera);
        
        // Añadir objetos interactivos al raycaster
        const interactiveObjects = this.world.getInteractiveObjects();
        this.interactiveObjects = interactiveObjects;
    }
    
    toggleVR() {
        if (this.vrManager) {
            if (this.vrManager.isEnabled()) {
                this.vrManager.endVR();
            } else {
                this.vrManager.startVR();
            }
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.intro) {
            this.intro.onResize();
        }
        
        if (this.vrManager) {
            this.vrManager.onResize();
        }
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                this.moveUp = true;
                break;
            case 'KeyC':
                this.moveDown = true;
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyN':
                this.toggleWeather();
                break;
            case 'KeyT':
                this.startTour();
                break;
            case 'KeyV':
                this.toggleVR();
                break;
            case 'KeyE':
                this.interact();
                break;
            case 'Escape':
                this.exitPointerLock();
                break;
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
            case 'Space':
                this.moveUp = false;
                break;
            case 'KeyC':
                this.moveDown = false;
                break;
        }
    }
    
    onPointerLockChange() {
        const locked = document.pointerLockElement === this.renderer.domElement;
        this.controls.enabled = !locked;
        this.pointerControls.enabled = locked;
        
        if (locked) {
            this.uiManager.panels.crosshair.classList.add('visible');
        } else {
            this.uiManager.panels.crosshair.classList.remove('visible');
        }
    }
    
    exitPointerLock() {
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
    }
    
    onMouseMove(event) {
        if (this.state !== AppState.MAIN) return;
        
        // Actualizar posición del mouse
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting para interacciones
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Verificar intersecciones con objetos interactivos
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.uiManager.showInteractionHint(true);
            
            // Resaltar objeto
            if (object.userData.originalMaterial) {
                object.material = object.userData.originalMaterial;
            }
            object.userData.originalMaterial = object.material;
            
            const highlightMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            });
            
            // Copiar propiedades del material original
            if (object.material.map) {
                highlightMaterial.map = object.material.map;
            }
            if (object.material.transparent) {
                highlightMaterial.transparent = true;
                highlightMaterial.opacity = object.material.opacity;
            }
            
            object.material = highlightMaterial;
        } else {
            this.uiManager.showInteractionHint(false);
        }
    }
    
    interact() {
        if (this.state !== AppState.MAIN) return;
        
        // Raycasting desde el centro de la cámara
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        
        // Verificar intersecciones con objetos interactivos
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleInteraction(object);
        }
    }
    
    handleInteraction(object) {
        console.log('Interactuando con:', object.userData);
        
        switch (object.userData.type) {
            case 'door':
                this.openDoor(object);
                break;
            case 'tv':
                this.toggleTV(object);
                break;
            case 'whiteboard':
                this.interactWithWhiteboard(object);
                break;
            case 'npc':
                this.interactWithNPC(object);
                break;
            case 'computer-screen':
                this.interactWithComputer(object);
                break;
            case 'elevator-button':
                this.pressElevatorButton(object);
                break;
            case 'fire-extinguisher':
                this.useFireExtinguisher(object);
                break;
            case 'info-sign':
                this.readInfoSign(object);
                break;
            default:
                console.log('Objeto interactivo desconocido:', object.userData.type);
        }
    }
    
    openDoor(door) {
        console.log('Abriendo puerta:', door.userData.room);
        
        // Animación de apertura
        const originalRotation = door.rotation.y;
        const targetRotation = originalRotation + Math.PI / 2;
        
        const animate = () => {
            door.rotation.y += (targetRotation - door.rotation.y) * 0.1;
            
            if (Math.abs(targetRotation - door.rotation.y) > 0.01) {
                requestAnimationFrame(animate);
            }
        };
        animate();
        
        // Mostrar notificación
        this.uiManager.showNotification(`Puerta abierta: ${door.userData.room}`, 'success');
    }
    
    toggleTV(tv) {
        console.log('Alternando TV');
        
        // Cambiar el material de la pantalla
        const screen = tv.parent.children.find(c => c.userData.screen);
        
        if (screen) {
            if (screen.material.color.getHex() === 0x000000) {
                // Encender TV
                screen.material.color.setHex(0x0066cc);
                screen.material.emissive = new THREE.Color(0x0066cc);
                screen.material.emissiveIntensity = 0.5;
                this.uiManager.showNotification('TV encendida', 'success');
            } else {
                // Apagar TV
                screen.material.color.setHex(0x000000);
                screen.material.emissive = new THREE.Color(0x000000);
                screen.material.emissiveIntensity = 0;
                this.uiManager.showNotification('TV apagada', 'info');
            }
        }
    }
    
    interactWithWhiteboard(whiteboard) {
        console.log('Interactuando con pizarra');
        
        // Cambiar el color de la pizarra temporalmente
        const originalColor = whiteboard.material.color.clone();
        whiteboard.material.color.setHex(0xffff00);
        
        setTimeout(() => {
            whiteboard.material.color.copy(originalColor);
        }, 1000);
        
        this.uiManager.showNotification('Escribiendo en la pizarra...', 'info');
    }
    
    interactWithNPC(npcObject) {
        console.log('Interactuando con NPC');
        
        if (npcObject.userData.npc) {
            const npc = npcObject.userData.npc;
            npc.interact();
        }
    }
    
    interactWithComputer(computer) {
        console.log('Interactuando con computadora');
        
        // Cambiar el color de la pantalla
        const originalColor = computer.material.color.clone();
        computer.material.color.setHex(0x00ff00);
        computer.material.emissive = new THREE.Color(0x00ff00);
        computer.material.emissiveIntensity = 0.5;
        
        setTimeout(() => {
            computer.material.color.copy(originalColor);
            computer.material.emissive = new THREE.Color(0x000000);
            computer.material.emissiveIntensity = 0;
        }, 1000);
        
        this.uiManager.showNotification('Computadora encendida', 'success');
    }
    
    pressElevatorButton(button) {
        console.log('Presionando botón de ascensor:', button.userData.floor);
        
        // Animación del botón
        const originalScale = button.scale.clone();
        button.scale.multiplyScalar(0.9);
        
        setTimeout(() => {
            button.scale.copy(originalScale);
        }, 200);
        
        this.uiManager.showNotification(
            `Llamando ascensor al piso ${button.userData.floor}`,
            'info'
        );
    }
    
    useFireExtinguisher(extinguisher) {
        console.log('Usando extintor');
        
        this.uiManager.showNotification('Extintor listo para usar', 'success');
    }
    
    readInfoSign(sign) {
        console.log('Leyendo cartel:', sign.userData.message);
        
        this.uiManager.showNotification(
            `Información: ${sign.userData.message}`,
            'info'
        );
    }
    
    toggleMute() {
        const muteIndicator = document.getElementById('mute-indicator');
        if (muteIndicator) {
            if (muteIndicator.textContent === '🔊') {
                muteIndicator.textContent = '🔇';
                this.uiManager.showNotification('Sonido desactivado', 'info');
            } else {
                muteIndicator.textContent = '🔊';
                this.uiManager.showNotification('Sonido activado', 'info');
            }
        }
    }
    
    toggleWeather() {
        if (!this.world) return;
        
        const weatherOptions = ['clear', 'rain', 'fog', 'storm'];
        const currentIndex = weatherOptions.indexOf(this.world.weather);
        const nextIndex = (currentIndex + 1) % weatherOptions.length;
        const nextWeather = weatherOptions[nextIndex];
        
        this.world.setWeather(nextWeather);
        
        const weatherNames = {
            clear: 'Despejado',
            rain: 'Lluvioso',
            fog: 'Neblina',
            storm: 'Tormenta'
        };
        
        this.uiManager.showNotification(
            `Clima cambiado a: ${weatherNames[nextWeather]}`,
            'info'
        );
    }
    
    startTour() {
        console.log('Iniciando tour...');
        
        this.uiManager.showNotification(
            'Tour automático iniciado. Sigue las instrucciones.',
            'success'
        );
        
        // Implementar tour automático
        this.startAutomaticTour();
    }
    
    startAutomaticTour() {
        // Posiciones del tour
        const tourPositions = [
            { x: 0, y: 2, z: 5, lookAt: { x: 0, y: 2, z: 0 } },
            { x: 0, y: 2, z: 25, lookAt: { x: 0, y: 2, z: 0 } },
            { x: -25, y: 2, z: 25, lookAt: { x: 0, y: 2, z: 25 } },
            { x: -25, y: 2, z: 0, lookAt: { x: -25, y: 2, z: 25 } },
            { x: 0, y: 2, z: 0, lookAt: { x: 0, y: 2, z: -50 } },
            { x: 0, y: 2, z: -50, lookAt: { x: 0, y: 2, z: 0 } },
            { x: -80, y: 2, z: 0, lookAt: { x: -80, y: 2, z: 25 } },
            { x: -80, y: 2, z: 25, lookAt: { x: -80, y: 2, z: 0 } },
            { x: 0, y: 2, z: 5, lookAt: { x: 0, y: 2, z: 0 } }
        ];
        
        let currentPosition = 0;
        
        const moveToPosition = () => {
            if (currentPosition >= tourPositions.length) {
                this.uiManager.showNotification('Tour completado', 'success');
                return;
            }
            
            const target = tourPositions[currentPosition];
            
            // Mover cámara
            this.camera.position.set(target.x, target.y, target.z);
            this.camera.lookAt(
                new THREE.Vector3(target.lookAt.x, target.lookAt.y, target.lookAt.z)
            );
            
            // Actualizar controles
            this.controls.target.copy(new THREE.Vector3(target.lookAt.x, target.lookAt.y, target.lookAt.z));
            this.controls.update();
            
            // Mostrar información
            const messages = [
                'Bienvenido al Campus SENA Manizales',
                'Este es el pasillo principal',
                'Aquí están los salones de clases',
                'Puedes entrar a cualquier salón',
                'Este es el patio central',
                'Al fondo está la biblioteca',
                'Y aquí está la cafetería',
                'Dentro puedes encontrar comida y bebidas',
                'Tour completado. ¡Explora por tu cuenta!'
            ];
            
            this.uiManager.updateObjective(messages[currentPosition]);
            
            currentPosition++;
            
            // Siguiente posición después de 3 segundos
            setTimeout(moveToPosition, 3000);
        };
        
        moveToPosition();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = performance.now();
        const delta = (time - this.prevTime) / 1000;
        
        if (this.state === AppState.INTRO) {
            // Animar la intro
            if (this.intro) {
                this.intro.update();
                this.intro.render();
            }
        } else if (this.state === AppState.MAIN) {
            // Animar la escena principal
            if (document.pointerLockElement === this.renderer.domElement) {
                // Movimiento con Pointer Lock
                this.velocity.x -= this.velocity.x * 10.0 * delta;
                this.velocity.z -= this.velocity.z * 10.0 * delta;
                
                this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
                this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
                this.direction.normalize();
                
                if (this.moveForward || this.moveBackward) {
                    this.velocity.z -= this.direction.z * 70.0 * delta;
                }
                if (this.moveLeft || this.moveRight) {
                    this.velocity.x -= this.direction.x * 70.0 * delta;
                }
                
                // Salto
                if (this.moveUp && this.camera.position.y < 2.5) {
                    this.velocity.y += 10 * delta;
                }
                
                // Gravedad
                this.velocity.y -= 9.8 * delta;
                
                // Aplicar movimiento
                this.pointerControls.moveRight(-this.velocity.x * delta);
                this.pointerControls.moveForward(-this.velocity.z * delta);
                this.camera.position.y += this.velocity.y * delta;
                
                // Limitar altura
                if (this.camera.position.y < 1.8) {
                    this.camera.position.y = 1.8;
                    this.velocity.y = 0;
                }
            } else {
                // Movimiento con Orbit Controls
                this.controls.update();
            }
            
            // Actualizar mundo
            if (this.world) {
                this.world.update(delta);
            }
            
            // Actualizar VR
            if (this.vrManager) {
                this.vrManager.update();
            }
            
            // Actualizar FPS
            this.updateFPS(delta);
            
            // Actualizar coordenadas
            this.updateCoordinates();
            
            // Actualizar hora del día
            if (this.world) {
                const dayTime = this.world.dayTime;
                this.uiManager.updateTime(dayTime);
            }
            
            // Renderizar
            if (this.vrManager && this.vrManager.isEnabled()) {
                this.renderer.setAnimationLoop(() => {
                    this.renderer.render(this.scene, this.camera);
                });
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        this.prevTime = time;
    }
    
    updateFPS(delta) {
        const fps = Math.round(1 / delta);
        this.uiManager.updateFPS(fps);
    }
    
    updateCoordinates() {
        const position = this.camera.position;
        this.uiManager.updateCoords(position.x, position.y, position.z);
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si WebGL está disponible
    if (!THREE.WebGLRenderer) {
        alert('WebGL no está disponible en tu navegador. Por favor, actualiza tu navegador.');
        return;
    }
    
    // Crear la aplicación
    window.app = new SENA3DApp();
});

// Exportar para uso en otros módulos
export default SENA3DApp;
