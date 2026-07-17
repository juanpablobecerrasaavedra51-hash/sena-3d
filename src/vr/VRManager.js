/**
 * VRManager.js - Gestor de realidad virtual
 * Compatibilidad con WebXR para experiencia inmersiva
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class VRManager {
    constructor(renderer, camera, scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        
        this.isVREnabled = false;
        this.isVRSupported = false;
        this.controller = null;
        this.controllerGrip = null;
        this.controllers = [];
        this.raycasters = [];
        this.intersectedObjects = [];
        this.interactiveObjects = [];
        
        this.setupVR();
    }
    
    // Configurar VR
    setupVR() {
        // Verificar si WebXR está disponible
        this.isVRSupported = 'xr' in navigator;
        
        if (this.isVRSupported) {
            // Configurar el renderer para XR
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local');
            
            // Añadir el botón de VR
            this.addVRButton();
            
            // Configurar controles
            this.setupControllers();
            
            // Configurar eventos
            this.setupEvents();
            
            console.log('WebXR está disponible');
        } else {
            console.warn('WebXR no está disponible en este navegador');
        }
    }
    
    // Añadir botón de VR
    addVRButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.bottom = '20px';
        buttonContainer.style.left = '50%';
        buttonContainer.style.transform = 'translateX(-50%)';
        buttonContainer.style.zIndex = '100';
        buttonContainer.style.padding = '10px';
        buttonContainer.style.background = 'rgba(0, 0, 0, 0.7)';
        buttonContainer.style.borderRadius = '8px';
        buttonContainer.style.display = 'none'; // Oculto por defecto
        buttonContainer.id = 'vr-button-container';
        
        document.body.appendChild(buttonContainer);
        
        // Crear el botón de VR
        const button = VRButton.createButton(this.renderer);
        button.style.margin = '0';
        button.style.padding = '8px 16px';
        button.style.fontSize = '14px';
        button.style.border = 'none';
        button.style.borderRadius = '6px';
        button.style.background = '#0066cc';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s ease';
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#0052a3';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#0066cc';
        });
        
        buttonContainer.appendChild(button);
        
        // Mostrar el botón cuando XR esté disponible
        if (this.isVRSupported) {
            buttonContainer.style.display = 'block';
        }
    }
    
    // Configurar controles de VR
    setupControllers() {
        // Controlador izquierdo
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('selectstart', () => this.onSelectStart(0));
        this.controller.addEventListener('selectend', () => this.onSelectEnd(0));
        this.controller.addEventListener('squeezestart', () => this.onSqueezeStart(0));
        this.controller.addEventListener('squeezeend', () => this.onSqueezeEnd(0));
        this.scene.add(this.controller);
        this.controllers.push(this.controller);
        
        // Controlador derecho
        const controller1 = this.renderer.xr.getController(1);
        controller1.addEventListener('selectstart', () => this.onSelectStart(1));
        controller1.addEventListener('selectend', () => this.onSelectEnd(1));
        controller1.addEventListener('squeezestart', () => this.onSqueezeStart(1));
        controller1.addEventListener('squeezeend', () => this.onSqueezeEnd(1));
        this.scene.add(controller1);
        this.controllers.push(controller1);
        
        // Crear raycaster para cada controlador
        for (let i = 0; i < this.controllers.length; i++) {
            const raycaster = new THREE.Raycaster();
            this.raycasters.push(raycaster);
        }
        
        // Crear modelos visuales para los controladores
        this.createControllerModels();
    }
    
    // Crear modelos visuales para los controladores
    createControllerModels() {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);
        
        const line = new THREE.Line(geometry);
        line.name = 'controller-line';
        line.scale.z = 5;
        
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            const controllerModel = line.clone();
            controllerModel.visible = false;
            controller.add(controllerModel);
            
            // Añadir un pequeño cubo en la punta
            const cubeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0x00ff00 : 0xff0000
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.z = -5;
            controllerModel.add(cube);
        }
    }
    
    // Configurar eventos
    setupEvents() {
        // Evento cuando se inicia la sesión XR
        this.renderer.xr.addEventListener('sessionstart', () => {
            this.onSessionStart();
        });
        
        // Evento cuando termina la sesión XR
        this.renderer.xr.addEventListener('sessionend', () => {
            this.onSessionEnd();
        });
        
        // Evento de conexión del controlador
        this.renderer.xr.addEventListener('connected', (event) => {
            this.onControllerConnected(event);
        });
        
        // Evento de desconexión del controlador
        this.renderer.xr.addEventListener('disconnected', (event) => {
            this.onControllerDisconnected(event);
        });
    }
    
    // Cuando se inicia la sesión XR
    onSessionStart() {
        this.isVREnabled = true;
        console.log('Sesión XR iniciada');
        
        // Mostrar los modelos de los controladores
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            const line = controller.getObjectByName('controller-line');
            if (line) line.visible = true;
        }
        
        // Desactivar otros controles
        window.dispatchEvent(new CustomEvent('vr-enabled', {
            detail: { enabled: true }
        }));
    }
    
    // Cuando termina la sesión XR
    onSessionEnd() {
        this.isVREnabled = false;
        console.log('Sesión XR terminada');
        
        // Ocultar los modelos de los controladores
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            const line = controller.getObjectByName('controller-line');
            if (line) line.visible = false;
        }
        
        // Reactivar otros controles
        window.dispatchEvent(new CustomEvent('vr-disabled', {
            detail: { enabled: false }
        }));
    }
    
    // Cuando se conecta un controlador
    onControllerConnected(event) {
        console.log('Controlador conectado:', event.data);
    }
    
    // Cuando se desconecta un controlador
    onControllerDisconnected(event) {
        console.log('Controlador desconectado:', event.data);
    }
    
    // Cuando se presiona el botón de selección
    onSelectStart(controllerIndex) {
        console.log(`Select start en controlador ${controllerIndex}`);
        this.checkIntersection(controllerIndex);
    }
    
    // Cuando se suelta el botón de selección
    onSelectEnd(controllerIndex) {
        console.log(`Select end en controlador ${controllerIndex}`);
    }
    
    // Cuando se presiona el botón de squeeze
    onSqueezeStart(controllerIndex) {
        console.log(`Squeeze start en controlador ${controllerIndex}`);
    }
    
    // Cuando se suelta el botón de squeeze
    onSqueezeEnd(controllerIndex) {
        console.log(`Squeeze end en controlador ${controllerIndex}`);
    }
    
    // Verificar intersección con objetos
    checkIntersection(controllerIndex) {
        const controller = this.controllers[controllerIndex];
        const raycaster = this.raycasters[controllerIndex];
        
        // Obtener la posición y dirección del controlador
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        
        // Verificar intersección con objetos interactivos
        const intersects = raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleIntersection(object, controllerIndex);
        }
    }
    
    // Manejar intersección con objeto
    handleIntersection(object, controllerIndex) {
        console.log('Intersección con:', object.userData);
        
        if (object.userData.interactive) {
            // Objeto interactivo
            if (object.userData.type === 'door') {
                this.openDoor(object);
            } else if (object.userData.type === 'tv') {
                this.toggleTV(object);
            } else if (object.userData.type === 'whiteboard') {
                this.interactWithWhiteboard(object);
            } else if (object.userData.type === 'npc') {
                this.interactWithNPC(object);
            } else if (object.userData.type === 'light') {
                this.toggleLight(object);
            }
        }
    }
    
    // Abrir puerta
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
        
        // Mostrar mensaje
        window.dispatchEvent(new CustomEvent('vr-action', {
            detail: {
                action: 'open-door',
                room: door.userData.room
            }
        }));
    }
    
    // Alternar TV
    toggleTV(tv) {
        console.log('Alternando TV');
        
        // Cambiar el material de la pantalla
        const screen = tv.parent.getObjectByName('tv-screen') || 
                      tv.parent.children.find(c => c.userData.screen);
        
        if (screen) {
            if (screen.material.color.getHex() === 0x000000) {
                // Encender TV
                screen.material.color.setHex(0x0066cc);
                screen.material.emissive = new THREE.Color(0x0066cc);
                screen.material.emissiveIntensity = 0.5;
            } else {
                // Apagar TV
                screen.material.color.setHex(0x000000);
                screen.material.emissive = new THREE.Color(0x000000);
                screen.material.emissiveIntensity = 0;
            }
        }
        
        window.dispatchEvent(new CustomEvent('vr-action', {
            detail: {
                action: 'toggle-tv'
            }
        }));
    }
    
    // Interactuar con pizarra
    interactWithWhiteboard(whiteboard) {
        console.log('Interactuando con pizarra');
        
        // Cambiar el color de la pizarra temporalmente
        const originalColor = whiteboard.material.color.clone();
        whiteboard.material.color.setHex(0xffff00);
        
        setTimeout(() => {
            whiteboard.material.color.copy(originalColor);
        }, 1000);
        
        window.dispatchEvent(new CustomEvent('vr-action', {
            detail: {
                action: 'write-whiteboard'
            }
        }));
    }
    
    // Interactuar con NPC
    interactWithNPC(npcObject) {
        console.log('Interactuando con NPC');
        
        if (npcObject.userData.npc) {
            npcObject.userData.npc.interact();
        }
        
        window.dispatchEvent(new CustomEvent('vr-action', {
            detail: {
                action: 'talk-npc'
            }
        }));
    }
    
    // Alternar luz
    toggleLight(lightObject) {
        console.log('Alternando luz');
        
        if (lightObject.isLight) {
            lightObject.intensity = lightObject.intensity > 0 ? 0 : 1;
        }
        
        window.dispatchEvent(new CustomEvent('vr-action', {
            detail: {
                action: 'toggle-light'
            }
        }));
    }
    
    // Registrar objeto interactivo
    registerInteractiveObject(object) {
        if (!this.interactiveObjects.includes(object)) {
            this.interactiveObjects.push(object);
        }
    }
    
    // Remover objeto interactivo
    unregisterInteractiveObject(object) {
        const index = this.interactiveObjects.indexOf(object);
        if (index !== -1) {
            this.interactiveObjects.splice(index, 1);
        }
    }
    
    // Actualizar el raycaster
    updateRaycasters() {
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            const raycaster = this.raycasters[i];
            
            if (controller && raycaster) {
                const tempMatrix = new THREE.Matrix4();
                tempMatrix.identity().extractRotation(controller.matrixWorld);
                
                raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
                raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
                
                // Verificar intersecciones
                const intersects = raycaster.intersectObjects(this.interactiveObjects);
                
                if (intersects.length > 0) {
                    // Resaltar objeto
                    const object = intersects[0].object;
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
                }
            }
        }
    }
    
    // Actualizar el gestor de VR
    update() {
        if (this.isVREnabled) {
            this.updateRaycasters();
        }
    }
    
    // Verificar si VR está disponible
    isAvailable() {
        return this.isVRSupported;
    }
    
    // Verificar si VR está activado
    isEnabled() {
        return this.isVREnabled;
    }
    
    // Iniciar sesión VR manualmente
    async startVR() {
        if (this.isVRSupported && !this.isVREnabled) {
            try {
                await this.renderer.xr.setSession(
                    await navigator.xr.requestSession('immersive-vr', {
                        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
                    })
                );
            } catch (error) {
                console.error('Error al iniciar VR:', error);
            }
        }
    }
    
    // Terminar sesión VR manualmente
    async endVR() {
        if (this.isVREnabled) {
            await this.renderer.xr.setSession(null);
        }
    }
    
    // Limpiar recursos
    dispose() {
        // Remover controladores
        for (let i = 0; i < this.controllers.length; i++) {
            this.scene.remove(this.controllers[i]);
        }
        
        // Remover botón de VR
        const buttonContainer = document.getElementById('vr-button-container');
        if (buttonContainer) {
            buttonContainer.remove();
        }
        
        // Limpiar eventos
        this.renderer.xr.removeEventListener('sessionstart', this.onSessionStart);
        this.renderer.xr.removeEventListener('sessionend', this.onSessionEnd);
    }
}

export default VRManager;
