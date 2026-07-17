/**
 * SENA 3D EXPERIENCE
 * Aplicación principal con intro épica estilo Jujutsu Kaisen
 * y entorno 3D explorable
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from 'gsap';
import { JujutsuIntro } from './intro.js';

// Estado de la aplicación
const AppState = {
    LOADING: 'loading',
    INTRO: 'intro',
    MAIN: 'main'
};

class SENA3DApp {
    constructor() {
        this.state = AppState.LOADING;
        this.container = document.getElementById('app');
        this.loadingScreen = document.getElementById('loading-screen');
        this.introContainer = document.getElementById('intro-canvas');
        this.uiOverlay = document.getElementById('ui-overlay');
        this.crosshair = document.getElementById('crosshair');
        this.interactionHint = document.getElementById('interaction-hint');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pointerControls = null;
        
        this.intro = null;
        this.model = null;
        
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
        
        this.raycaster = new THREE.Raycaster();
        this.intersects = [];
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupControls();
        this.setupLights();
        this.setupEventListeners();
        
        // Iniciar la intro después de cargar
        this.startIntro();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x8dc7ed);
        this.scene.fog = new THREE.Fog(0x8dc7ed, 80, 420);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(120, 75, 120);
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
        this.controls.minDistance = 25;
        this.controls.maxDistance = 280;
        this.controls.enabled = false; // Desactivado durante la intro
        
        // Pointer Lock Controls para modo FPS
        this.pointerControls = new PointerLockControls(
            this.camera,
            this.renderer.domElement
        );
        this.scene.add(this.pointerControls.getObject());
        this.pointerControls.enabled = false;
    }
    
    setupLights() {
        // Luz ambiental
        const ambientLight = new THREE.HemisphereLight(
            0xeaebf4,
            0x4a4a4a,
            0.8
        );
        this.scene.add(ambientLight);
        
        // Luz direccional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
        directionalLight.position.set(100, 150, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -140;
        directionalLight.shadow.camera.right = 140;
        directionalLight.shadow.camera.top = 140;
        directionalLight.shadow.camera.bottom = -140;
        this.scene.add(directionalLight);
        
        // Luz de ambiente adicional
        const ambientLight2 = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight2);
    }
    
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Keyboard
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Pointer Lock
        this.renderer.domElement.addEventListener('click', () => {
            if (this.state === AppState.MAIN) {
                this.pointerControls.lock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => {
            console.log('Pointer lock error');
        });
        
        // Mouse move para raycaster
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
    }
    
    startIntro() {
        this.state = AppState.INTRO;
        
        // Mostrar la intro
        this.introContainer.style.display = 'block';
        this.loadingScreen.classList.add('hidden');
        
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
        this.uiOverlay.classList.add('visible');
        this.crosshair.classList.add('active');
        
        // Activar controles
        this.controls.enabled = true;
        this.pointerControls.enabled = true;
        
        // Cargar el modelo 3D
        this.loadModel();
        
        // Crear el entorno
        this.createEnvironment();
        
        // Iniciar el loop de animación
        this.animate();
    }
    
    loadModel() {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
        
        // Cargar el modelo principal
        loader.load(
            '/Meshy_AI_Aerial_View_of_a_Mode_0715153906_texture.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                
                // Ajustar posición y escala
                this.model.position.set(0, 0, 0);
                this.model.scale.set(1, 1, 1);
                
                // Centrar la cámara
                this.centerCameraOnModel();
                
                // Ocultar loading
                this.loadingScreen.classList.add('hidden');
            },
            (progress) => {
                // Actualizar barra de progreso
                const percentLoaded = (progress.loaded / progress.total * 100).toFixed(2);
                document.getElementById('loading-text').textContent = 
                    `Cargando modelo... ${percentLoaded}%`;
            },
            (error) => {
                console.error('Error cargando el modelo:', error);
                this.createEnvironment();
                this.loadingScreen.classList.add('hidden');
            }
        );
    }
    
    centerCameraOnModel() {
        if (!this.model) return;
        
        // Calcular el bounding box
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Posicionar la cámara
        const distance = size.length() * 1.5;
        this.camera.position.set(
            center.x,
            center.y + distance * 0.5,
            center.z + distance
        );
        
        // Mirar al centro
        this.camera.lookAt(center);
        
        // Actualizar controles
        this.controls.target.copy(center);
        this.controls.update();
    }
    
    createEnvironment() {
        // Crear suelo
        this.createGround();
        
        // Crear caminos
        this.createRoads();
        
        // Crear edificios
        this.createBuildings();
        
        // Crear árboles
        this.createTrees();
        
        // Crear cielo
        this.createSky();
    }
    
    createGround() {
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x3c8d3f,
            roughness: 0.95
        });
        const grassPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(280, 240),
            grassMat
        );
        grassPlane.rotation.x = -Math.PI / 2;
        grassPlane.receiveShadow = true;
        this.scene.add(grassPlane);
        
        const soilMat = new THREE.MeshStandardMaterial({
            color: 0x5b4a31,
            roughness: 0.95
        });
        const field = new THREE.Mesh(
            new THREE.PlaneGeometry(280, 30),
            soilMat
        );
        field.rotation.x = -Math.PI / 2;
        field.position.z = 110;
        this.scene.add(field);
    }
    
    createRoads() {
        const asphalt = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        
        const roadMain = new THREE.Mesh(
            new THREE.PlaneGeometry(260, 22),
            asphalt
        );
        roadMain.rotation.x = -Math.PI / 2;
        roadMain.position.z = -92;
        roadMain.receiveShadow = true;
        this.scene.add(roadMain);
        
        const roadSide = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 180),
            asphalt
        );
        roadSide.rotation.x = -Math.PI / 2;
        roadSide.position.set(120, 0.01, 0);
        this.scene.add(roadSide);
        
        const lineMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9
        });
        const centerLine = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 180),
            lineMat
        );
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(120, 0.02, 0);
        this.scene.add(centerLine);
    }
    
    createBuildings() {
        const buildingColor = 0xf7f7f7;
        const stripeColor = 0x0f4f93;
        
        const rows = [
            { z: -32, xs: [-95, -30, 35, 100] },
            { z: 8, xs: [-95, -30, 35, 100] },
            { z: 48, xs: [-95, -30, 35, 100] }
        ];
        
        rows.forEach(row => {
            row.xs.forEach(x => {
                this.createGabledBlock(x, row.z, 48, 28, 12, buildingColor, stripeColor);
            });
        });
        
        this.addCentralWalkways();
        this.createAdministration(-75, 90, 46, 24, 12);
        this.createAdministration(75, 90, 46, 24, 12);
    }
    
    createGabledBlock(x, z, width, depth, height, baseColor, accentColor) {
        const group = new THREE.Group();
        const wallMat = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.78
        });
        const accentMat = new THREE.MeshStandardMaterial({
            color: accentColor,
            roughness: 0.82
        });
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x1f5d9a,
            emissive: 0x112d58,
            emissiveIntensity: 0.25,
            roughness: 0.08,
            metalness: 0.15
        });
        
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(width - 0.5, depth - 0.5),
            new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.96 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.05;
        group.add(floor);
        
        const thickness = 0.7;
        const wallHeight = height;
        const doorWidth = 7;
        
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(thickness, wallHeight, depth),
            wallMat
        );
        leftWall.position.set(-width / 2 + thickness / 2, wallHeight / 2, 0);
        group.add(leftWall);
        
        const rightWall = leftWall.clone();
        rightWall.position.set(width / 2 - thickness / 2, wallHeight / 2, 0);
        group.add(rightWall);
        
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(width, wallHeight, thickness),
            wallMat
        );
        backWall.position.set(0, wallHeight / 2, -depth / 2 + thickness / 2);
        group.add(backWall);
        
        const frontLeft = new THREE.Mesh(
            new THREE.BoxGeometry((width - doorWidth) / 2 - 0.5, wallHeight, thickness),
            wallMat
        );
        frontLeft.position.set(
            -doorWidth / 2 - ((width - doorWidth) / 2 - 0.5) / 2,
            wallHeight / 2,
            depth / 2 - thickness / 2
        );
        group.add(frontLeft);
        
        const frontRight = frontLeft.clone();
        frontRight.position.set(
            doorWidth / 2 + ((width - doorWidth) / 2 - 0.5) / 2,
            wallHeight / 2,
            depth / 2 - thickness / 2
        );
        group.add(frontRight);
        
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(width - 2, 1.4, 0.8),
            accentMat
        );
        stripe.position.set(0, wallHeight * 0.58, depth / 2 - thickness - 0.05);
        group.add(stripe);
        
        const windows = Math.max(2, Math.floor((width - 10) / 10));
        for (let i = 0; i < windows; i++) {
            const xPos = -width / 2 + 8 + i * 10;
            const win = new THREE.Mesh(
                new THREE.BoxGeometry(4, 4, 0.1),
                windowMat
            );
            win.position.set(xPos, wallHeight * 0.55, depth / 2 - thickness - 0.01);
            group.add(win);
            
            const backWin = win.clone();
            backWin.position.set(xPos, wallHeight * 0.55, -depth / 2 + thickness + 0.01);
            group.add(backWin);
        }
        
        const roof = this.createGableRoof(width + 2, depth + 4, 4.5, accentColor);
        roof.position.set(0, wallHeight + 1.8, 0);
        group.add(roof);
        
        group.position.set(x, 0, z);
        this.scene.add(group);
        return group;
    }
    
    createGableRoof(width, depth, height, roofColor) {
        const roofMat = new THREE.MeshStandardMaterial({
            color: roofColor,
            roughness: 0.75,
            side: THREE.DoubleSide
        });
        const roof = new THREE.Group();
        
        const sideA = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth * 0.56),
            roofMat
        );
        sideA.rotation.set(Math.PI / 2 - 0.75, 0, 0);
        sideA.position.set(0, height / 2, -depth * 0.14);
        roof.add(sideA);
        
        const sideB = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth * 0.56),
            roofMat
        );
        sideB.rotation.set(Math.PI / 2 + 0.75, 0, 0);
        sideB.position.set(0, height / 2, depth * 0.14);
        roof.add(sideB);
        
        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(width + 1, 0.4, 0.4),
            roofMat
        );
        ridge.position.set(0, height * 0.62, 0);
        roof.add(ridge);
        
        return roof;
    }
    
    addCentralWalkways() {
        const pathMat = new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.9
        });
        
        const pathA = new THREE.Mesh(
            new THREE.BoxGeometry(20, 0.15, 130),
            pathMat
        );
        pathA.position.set(0, 0.08, 20);
        this.scene.add(pathA);
        
        const pathB = new THREE.Mesh(
            new THREE.BoxGeometry(160, 0.15, 8),
            pathMat
        );
        pathB.position.set(0, 0.08, -20);
        this.scene.add(pathB);
        
        const pathC = new THREE.Mesh(
            new THREE.BoxGeometry(160, 0.15, 8),
            pathMat
        );
        pathC.position.set(0, 0.08, 45);
        this.scene.add(pathC);
    }
    
    createAdministration(x, z, width, depth, height) {
        const group = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.78
        });
        const accentMat = new THREE.MeshStandardMaterial({
            color: 0x0f4f93,
            roughness: 0.8
        });
        
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(width - 0.5, depth - 0.5),
            new THREE.MeshStandardMaterial({ color: 0xf0efee, roughness: 0.9 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.05;
        group.add(floor);
        
        const wall = new THREE.BoxGeometry(width, height, 0.6);
        const front = new THREE.Mesh(wall, baseMat);
        front.position.set(0, height / 2, depth / 2 - 0.3);
        group.add(front);
        
        const back = front.clone();
        back.position.set(0, height / 2, -depth / 2 + 0.3);
        group.add(back);
        
        const left = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, height, depth),
            baseMat
        );
        left.position.set(-width / 2 + 0.3, height / 2, 0);
        group.add(left);
        
        const right = left.clone();
        right.position.set(width / 2 - 0.3, height / 2, 0);
        group.add(right);
        
        const blueBar = new THREE.Mesh(
            new THREE.BoxGeometry(width - 1, 1.5, 0.8),
            accentMat
        );
        blueBar.position.set(0, height * 0.6, depth / 2 - 0.9);
        group.add(blueBar);
        
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(12, 3.5, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
        );
        sign.position.set(0, height * 0.75, depth / 2 - 0.7);
        group.add(sign);
        
        group.position.set(x, 0, z);
        this.scene.add(group);
    }
    
    createTrees() {
        const positions = [
            [-120, -20], [-90, -50], [-100, 60], [-50, 80],
            [20, 90], [80, 88], [110, 10], [100, -35],
            [40, -95], [-10, -90], [-130, 35], [-75, 50]
        ];
        positions.forEach(([x, z]) => this.createTree(x, z));
    }
    
    createTree(x, z) {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 4.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x6b4226 })
        );
        trunk.position.y = 2.25;
        tree.add(trunk);
        
        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(3.6, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x2f6a2f, roughness: 0.95 })
        );
        leaves.position.y = 6;
        tree.add(leaves);
        
        tree.position.set(x, 0, z);
        this.scene.add(tree);
    }
    
    createSky() {
        // Crear un cielo con degradado
        const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x8dc7ed) },
                bottomColor: { value: new THREE.Color(0x4a90e2) },
                offset: { value: 20 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.intro) {
            this.intro.onResize();
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
            this.crosshair.classList.add('active');
        } else {
            this.crosshair.classList.remove('active');
        }
    }
    
    exitPointerLock() {
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
    }
    
    onMouseMove(event) {
        if (this.state !== AppState.MAIN) return;
        
        // Raycasting para interacciones
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(mouse, this.camera);
        
        // Verificar intersecciones con objetos interactivos
        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(obj => obj.userData.interactive)
        );
        
        if (intersects.length > 0) {
            this.interactionHint.classList.add('visible');
        } else {
            this.interactionHint.classList.remove('visible');
        }
    }
    
    toggleMute() {
        // Implementar mute
        const muteIndicator = document.getElementById('mute-indicator');
        if (muteIndicator.textContent === '🔊') {
            muteIndicator.textContent = '🔇';
        } else {
            muteIndicator.textContent = '🔊';
        }
    }
    
    toggleWeather() {
        // Implementar cambio de clima
        const weatherIndicator = document.getElementById('weather-indicator');
        const currentWeather = weatherIndicator.textContent;
        
        if (currentWeather.includes('Despejado')) {
            weatherIndicator.textContent = '☁️ Nublado';
            weatherIndicator.style.color = '#999999';
            this.scene.fog.color.setHex(0x696969);
            this.scene.background.setHex(0x696969);
        } else if (currentWeather.includes('Nublado')) {
            weatherIndicator.textContent = '🌧️ Lluvia';
            weatherIndicator.style.color = '#4682b4';
            this.scene.fog.color.setHex(0x4682b4);
            this.scene.background.setHex(0x4682b4);
        } else {
            weatherIndicator.textContent = '☀️ Despejado';
            weatherIndicator.style.color = '#88ff99';
            this.scene.fog.color.setHex(0x8dc7ed);
            this.scene.background.setHex(0x8dc7ed);
        }
    }
    
    startTour() {
        // Implementar tour automático
        console.log('Iniciando tour...');
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
                
                this.pointerControls.moveRight(-this.velocity.x * delta);
                this.pointerControls.moveForward(-this.velocity.z * delta);
            } else {
                // Movimiento con Orbit Controls
                this.controls.update();
            }
            
            // Actualizar FPS
            this.updateFPS(delta);
            
            // Actualizar coordenadas
            this.updateCoordinates();
            
            // Renderizar
            this.renderer.render(this.scene, this.camera);
        }
        
        this.prevTime = time;
    }
    
    updateFPS(delta) {
        const fps = Math.round(1 / delta);
        document.getElementById('fps').textContent = `FPS: ${fps}`;
    }
    
    updateCoordinates() {
        const position = this.camera.position;
        document.getElementById('coords').textContent = 
            `X: ${position.x.toFixed(1)} · Z: ${position.z.toFixed(1)} · Y: ${position.y.toFixed(1)}`;
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SENA3DApp();
});
