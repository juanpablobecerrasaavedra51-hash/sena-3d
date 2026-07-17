/**
 * World.js - Sistema de mundo 3D completo
 * Integra edificios, NPCs, efectos y entorno
 */

import * as THREE from 'three';
import { Building } from './Building.js';
import { NPC } from '../npcs/NPC.js';

export class World {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        this.buildings = [];
        this.npcs = [];
        this.interactiveObjects = [];
        this.lights = [];
        this.effects = [];
        
        this.dayTime = 0.5; // 0 = noche, 0.5 = día, 1 = atardecer
        this.weather = 'clear'; // clear, rain, fog, storm
        
        this.init();
    }
    
    init() {
        this.createGround();
        this.createSky();
        this.createCampus();
        this.createNPCs();
        this.createLighting();
        this.createEffects();
        this.createInteractiveObjects();
    }
    
    // Crear el suelo del campus
    createGround() {
        // Suelo principal (césped)
        const grassGeometry = new THREE.PlaneGeometry(500, 500);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x3c8d3f,
            roughness: 0.95,
            metalness: 0.05
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.receiveShadow = true;
        this.scene.add(grass);
        
        // Caminos
        this.createPaths();
        
        // Estacionamiento
        this.createParking();
    }
    
    // Crear caminos
    createPaths() {
        const pathMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Camino principal
        const mainPath = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 10),
            pathMaterial
        );
        mainPath.rotation.x = -Math.PI / 2;
        mainPath.position.y = 0.01;
        mainPath.receiveShadow = true;
        this.scene.add(mainPath);
        
        // Camino secundario
        const secondaryPath = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 150),
            pathMaterial
        );
        secondaryPath.rotation.x = -Math.PI / 2;
        secondaryPath.position.set(50, 0.01, 0);
        secondaryPath.receiveShadow = true;
        this.scene.add(secondaryPath);
    }
    
    // Crear estacionamiento
    createParking() {
        const parkingMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const parking = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 60),
            parkingMaterial
        );
        parking.rotation.x = -Math.PI / 2;
        parking.position.set(-100, 0.01, -100);
        parking.receiveShadow = true;
        this.scene.add(parking);
        
        // Líneas del estacionamiento
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9
        });
        
        for (let i = 0; i < 5; i++) {
            const line = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 50),
                lineMaterial
            );
            line.rotation.x = -Math.PI / 2;
            line.position.set(-100 + i * 16, 0.02, -100 + 25);
            this.scene.add(line);
        }
    }
    
    // Crear el cielo
    createSky() {
        // Cielo con shader
        const skyGeometry = new THREE.SphereGeometry(1000, 60, 40);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87ceeb) },
                bottomColor: { value: new THREE.Color(0x1e90ff) },
                offset: { value: 50 },
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
        
        // Sol
        const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 2
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(200, 300, -200);
        this.scene.add(sun);
        
        // Luz del sol
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(200, 300, -200);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        this.scene.add(sunLight);
        this.lights.push(sunLight);
    }
    
    // Crear el campus con edificios
    createCampus() {
        // Edificio principal (Aulas)
        const mainBuilding = new Building(this.scene, { x: 0, y: 0, z: 0 });
        
        // Primer piso - Pasillo principal
        mainBuilding.createHallway(50, 10, 4, 'z');
        
        // Salones del primer piso
        for (let i = 0; i < 5; i++) {
            const classroom = mainBuilding.createClassroom(12, 10, 4, `10${i + 1}`);
            classroom.position.set(-25 + i * 15, 0, 25);
        }
        
        // Baños
        const maleBathroom = mainBuilding.createBathroom(10, 8, 3, true);
        maleBathroom.position.set(30, 0, 25);
        
        const femaleBathroom = mainBuilding.createBathroom(10, 8, 3, false);
        femaleBathroom.position.set(45, 0, 25);
        
        // Tableros en el pasillo
        for (let i = 0; i < 3; i++) {
            const whiteboard = mainBuilding.createWhiteboard(4, 2, {
                x: -10 + i * 20,
                y: 2,
                z: 24.9
            });
            whiteboard.userData.interactive = true;
            whiteboard.userData.type = 'whiteboard';
            this.interactiveObjects.push(whiteboard);
        }
        
        // Escaleras
        const stairs = mainBuilding.createStairs(10, 5, 3, 3);
        stairs.position.set(55, 0, 0);
        
        // Segundo piso
        const secondFloor = new Building(this.scene, { x: 0, y: 4, z: 0 });
        secondFloor.createHallway(50, 10, 4, 'z');
        secondFloor.group.position.y = 4;
        
        // Salones del segundo piso
        for (let i = 0; i < 5; i++) {
            const classroom = secondFloor.createClassroom(12, 10, 4, `20${i + 1}`);
            classroom.position.set(-25 + i * 15, 0, 25);
        }
        
        // Laboratorios
        for (let i = 0; i < 2; i++) {
            const lab = this.createLaboratory(15, 12, 4, `Lab ${i + 1}`);
            lab.position.set(-30 + i * 35, 0, -30);
            this.scene.add(lab);
        }
        
        // Biblioteca
        const library = this.createLibrary(25, 20, 5);
        library.position.set(0, 0, -60);
        this.scene.add(library);
        
        // Comedor
        const cafeteria = this.createCafeteria(30, 25, 4);
        cafeteria.position.set(-80, 0, 0);
        this.scene.add(cafeteria);
        
        this.buildings.push(mainBuilding, secondFloor);
    }
    
    // Crear laboratorio
    createLaboratory(width, depth, height, name) {
        const labGroup = new THREE.Group();
        
        const building = new Building(this.scene);
        const room = building.createClassroom(width, depth, height, name);
        labGroup.add(room);
        
        // Mesas de laboratorio
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                const table = this.createLabTable();
                table.position.set(-width / 2 + 5 + i * 5, 0, -depth / 2 + 5 + j * 5);
                room.add(table);
            }
        }
        
        // Computadoras
        for (let i = 0; i < 6; i++) {
            const computer = this.createComputer();
            computer.position.set(-width / 2 + 3 + i * 5, 0.75, -depth / 2 + 3);
            room.add(computer);
        }
        
        // Pizarra grande
        const whiteboard = building.createWhiteboard(6, 3, { x: 0, y: 2, z: -depth / 2 + 0.1 });
        whiteboard.userData.interactive = true;
        whiteboard.userData.type = 'whiteboard';
        room.add(whiteboard);
        this.interactiveObjects.push(whiteboard);
        
        // Proyector
        const projector = this.createProjector();
        projector.position.set(0, height - 0.5, -depth / 2 + 1);
        room.add(projector);
        
        return labGroup;
    }
    
    // Crear mesa de laboratorio
    createLabTable() {
        const tableGroup = new THREE.Group();
        
        // Tabla
        const tableGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.75;
        tableGroup.add(table);
        
        // Patas
        const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7
        });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.7, 0.35, -0.4);
        tableGroup.add(leg1);
        
        const leg2 = leg1.clone();
        leg2.position.x = 0.7;
        tableGroup.add(leg2);
        
        const leg3 = leg1.clone();
        leg3.position.z = 0.4;
        tableGroup.add(leg3);
        
        const leg4 = leg2.clone();
        leg4.position.z = 0.4;
        tableGroup.add(leg4);
        
        return tableGroup;
    }
    
    // Crear computadora
    createComputer() {
        const computerGroup = new THREE.Group();
        
        // Monitor
        const monitorGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05);
        const monitorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.8
        });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.y = 0.75;
        computerGroup.add(monitor);
        
        // Pantalla
        const screenGeometry = new THREE.PlaneGeometry(0.38, 0.28);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 0.75, 0.03);
        screen.userData = {
            type: 'computer-screen',
            interactive: true
        };
        computerGroup.add(screen);
        this.interactiveObjects.push(screen);
        
        // Teclado
        const keyboardGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.2);
        const keyboardMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8
        });
        const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
        keyboard.position.set(0, 0.65, 0.15);
        computerGroup.add(keyboard);
        
        // Mouse
        const mouseGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const mouseMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const mouse = new THREE.Mesh(mouseGeometry, mouseMaterial);
        mouse.position.set(0.15, 0.65, 0.25);
        computerGroup.add(mouse);
        
        return computerGroup;
    }
    
    // Crear proyector
    createProjector() {
        const projectorGroup = new THREE.Group();
        
        // Proyector
        const projectorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const projectorMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const projector = new THREE.Mesh(projectorGeometry, projectorMaterial);
        projectorGroup.add(projector);
        
        // Lente
        const lensGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const lensMaterial = new THREE.MeshStandardMaterial({
            color: 0x8888ff,
            transparent: true,
            opacity: 0.7
        });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        lens.position.set(0, 0, 0.15);
        projectorGroup.add(lens);
        
        // Luz del proyector
        const projectorLight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6);
        projectorLight.position.set(0, 0, 0.2);
        projectorLight.target.position.set(0, 0, -10);
        projectorGroup.add(projectorLight);
        projectorGroup.add(projectorLight.target);
        this.lights.push(projectorLight);
        
        return projectorGroup;
    }
    
    // Crear biblioteca
    createLibrary(width, depth, height) {
        const libraryGroup = new THREE.Group();
        
        const building = new Building(this.scene);
        const room = building.createClassroom(width, depth, height, 'Biblioteca');
        libraryGroup.add(room);
        
        // Estanterías
        for (let i = 0; i < 5; i++) {
            const bookshelf = this.createBookshelf();
            bookshelf.position.set(-width / 2 + 3 + i * 5, 0, -depth / 2 + 0.5);
            room.add(bookshelf);
        }
        
        // Mesas de lectura
        for (let i = 0; i < 4; i++) {
            const readingTable = this.createReadingTable();
            readingTable.position.set(-width / 2 + 5 + i * 8, 0, 0);
            room.add(readingTable);
        }
        
        // Mostrador de préstamos
        const counter = this.createLibraryCounter();
        counter.position.set(0, 0, depth / 2 - 2);
        room.add(counter);
        
        return libraryGroup;
    }
    
    // Crear estantería
    createBookshelf() {
        const bookshelfGroup = new THREE.Group();
        
        // Estructura de la estantería
        const shelfGeometry = new THREE.BoxGeometry(1, 2, 0.3);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        bookshelfGroup.add(shelf);
        
        // Libros
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const book = this.createBook();
                book.position.set(
                    -0.4 + j * 0.25,
                    0.8 - i * 0.2,
                    0.16
                );
                book.rotation.y = Math.random() * 0.1 - 0.05;
                bookshelfGroup.add(book);
            }
        }
        
        return bookshelfGroup;
    }
    
    // Crear libro
    createBook() {
        const bookGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.2);
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            roughness: 0.8
        });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        return book;
    }
    
    // Crear mesa de lectura
    createReadingTable() {
        const tableGroup = new THREE.Group();
        
        // Tabla
        const tableGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.75;
        tableGroup.add(table);
        
        // Patas
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7
        });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.7, 0.35, -0.4);
        tableGroup.add(leg1);
        
        const leg2 = leg1.clone();
        leg2.position.x = 0.7;
        tableGroup.add(leg2);
        
        const leg3 = leg1.clone();
        leg3.position.z = 0.4;
        tableGroup.add(leg3);
        
        const leg4 = leg2.clone();
        leg4.position.z = 0.4;
        tableGroup.add(leg4);
        
        // Lámpara
        const lamp = this.createTableLamp();
        lamp.position.set(0, 0.85, 0);
        tableGroup.add(lamp);
        
        return tableGroup;
    }
    
    // Crear lámpara de mesa
    createTableLamp() {
        const lampGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        lampGroup.add(base);
        
        // Brazo
        const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 16);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.7
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.rotation.x = Math.PI / 4;
        arm.position.y = 0.1;
        lampGroup.add(arm);
        
        // Pantalla
        const shadeGeometry = new THREE.ConeGeometry(0.08, 0.1, 16);
        const shadeMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8
        });
        const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
        shade.rotation.x = -Math.PI / 2;
        shade.position.set(0, 0.5, 0.3);
        lampGroup.add(shade);
        
        // Luz
        const light = new THREE.PointLight(0xffaa66, 0.5, 5);
        light.position.set(0, 0.5, 0.3);
        lampGroup.add(light);
        this.lights.push(light);
        
        return lampGroup;
    }
    
    // Crear mostrador de biblioteca
    createLibraryCounter() {
        const counterGroup = new THREE.Group();
        
        // Mostrador
        const counterGeometry = new THREE.BoxGeometry(3, 0.1, 1);
        const counterMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.y = 0.75;
        counterGroup.add(counter);
        
        // Computadora en el mostrador
        const computer = this.createComputer();
        computer.position.set(0, 0.75, 0);
        counterGroup.add(computer);
        
        // Cartel de "Préstamos"
        const signGeometry = new THREE.BoxGeometry(1, 0.3, 0.05);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 1.2, 0.03);
        counterGroup.add(sign);
        
        return counterGroup;
    }
    
    // Crear cafetería
    createCafeteria(width, depth, height) {
        const cafeteriaGroup = new THREE.Group();
        
        const building = new Building(this.scene);
        const room = building.createClassroom(width, depth, height, 'Cafetería');
        cafeteriaGroup.add(room);
        
        // Mesas redondas
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const table = this.createRoundTable();
                table.position.set(-width / 2 + 8 + i * 8, 0, -depth / 2 + 8 + j * 8);
                room.add(table);
            }
        }
        
        // Mostrador de comida
        const foodCounter = this.createFoodCounter();
        foodCounter.position.set(0, 0, depth / 2 - 2);
        room.add(foodCounter);
        
        // Neveras
        for (let i = 0; i < 2; i++) {
            const fridge = this.createFridge();
            fridge.position.set(-width / 2 + 3 + i * 10, 0, depth / 2 - 0.5);
            room.add(fridge);
        }
        
        return cafeteriaGroup;
    }
    
    // Crear mesa redonda
    createRoundTable() {
        const tableGroup = new THREE.Group();
        
        // Tabla redonda
        const tableGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = 0.75;
        tableGroup.add(table);
        
        // Pata central
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7
        });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.y = 0.35;
        tableGroup.add(leg);
        
        // Sillas
        for (let i = 0; i < 4; i++) {
            const chair = this.createChair();
            chair.rotation.y = (i / 4) * Math.PI * 2;
            chair.position.set(Math.cos((i / 4) * Math.PI * 2) * 1, 0, Math.sin((i / 4) * Math.PI * 2) * 1);
            tableGroup.add(chair);
        }
        
        return tableGroup;
    }
    
    // Crear silla
    createChair() {
        const chairGroup = new THREE.Group();
        
        // Asiento
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0x4169e1,
            roughness: 0.7
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.5;
        chairGroup.add(seat);
        
        // Respaldo
        const backGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x4169e1,
            roughness: 0.7
        });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.set(0, 0.7, -0.15);
        chairGroup.add(back);
        
        // Patas
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 16);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7
        });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.15, 0.25, -0.15);
        chairGroup.add(leg1);
        
        const leg2 = leg1.clone();
        leg2.position.x = 0.15;
        chairGroup.add(leg2);
        
        const leg3 = leg1.clone();
        leg3.position.z = 0.15;
        chairGroup.add(leg3);
        
        const leg4 = leg2.clone();
        leg4.position.z = 0.15;
        chairGroup.add(leg4);
        
        return chairGroup;
    }
    
    // Crear mostrador de comida
    createFoodCounter() {
        const counterGroup = new THREE.Group();
        
        // Mostrador
        const counterGeometry = new THREE.BoxGeometry(4, 0.1, 1);
        const counterMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.y = 0.75;
        counterGroup.add(counter);
        
        // Vidrio protector
        const glassGeometry = new THREE.BoxGeometry(3.8, 0.5, 0.05);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x8888ff,
            transparent: true,
            opacity: 0.3
        });
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(0, 0.95, 0.03);
        counterGroup.add(glass);
        
        // Cartel de menú
        const menuGeometry = new THREE.BoxGeometry(1, 0.4, 0.05);
        const menuMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.7
        });
        const menu = new THREE.Mesh(menuGeometry, menuMaterial);
        menu.position.set(0, 1.2, -0.3);
        counterGroup.add(menu);
        
        return counterGroup;
    }
    
    // Crear nevera
    createFridge() {
        const fridgeGroup = new THREE.Group();
        
        // Cuerpo de la nevera
        const bodyGeometry = new THREE.BoxGeometry(1, 1.8, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        fridgeGroup.add(body);
        
        // Puerta
        const doorGeometry = new THREE.BoxGeometry(0.98, 1.78, 0.05);
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.5,
            metalness: 0.3
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0, 0.3);
        door.userData = {
            type: 'fridge-door',
            interactive: true
        };
        fridgeGroup.add(door);
        this.interactiveObjects.push(door);
        
        // Mango
        const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 16);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(0.4, 0.9, 0.31);
        fridgeGroup.add(handle);
        
        return fridgeGroup;
    }
    
    // Crear NPCs
    createNPCs() {
        // Estudiantes
        for (let i = 0; i < 20; i++) {
            const npc = new NPC(this.scene, {
                x: Math.random() * 200 - 100,
                y: 0,
                z: Math.random() * 200 - 100
            }, {
                type: 'student',
                gender: Math.random() > 0.5 ? 'male' : 'female',
                outfit: 'uniform',
                role: ['walking', 'standing', 'sitting'][Math.floor(Math.random() * 3)]
            });
            this.npcs.push(npc);
        }
        
        // Profesores
        for (let i = 0; i < 5; i++) {
            const npc = new NPC(this.scene, {
                x: Math.random() * 100 - 50,
                y: 0,
                z: Math.random() * 100 - 50
            }, {
                type: 'teacher',
                gender: Math.random() > 0.5 ? 'male' : 'female',
                outfit: 'formal',
                role: ['walking', 'teaching'][Math.floor(Math.random() * 2)]
            });
            this.npcs.push(npc);
        }
        
        // Personal
        for (let i = 0; i < 3; i++) {
            const npc = new NPC(this.scene, {
                x: Math.random() * 50 - 25,
                y: 0,
                z: Math.random() * 50 - 25
            }, {
                type: 'staff',
                gender: Math.random() > 0.5 ? 'male' : 'female',
                outfit: 'casual',
                role: ['walking', 'standing'][Math.floor(Math.random() * 2)]
            });
            this.npcs.push(npc);
        }
    }
    
    // Crear iluminación
    createLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Luz hemisférica
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a4a4a, 0.6);
        this.scene.add(hemiLight);
        this.lights.push(hemiLight);
        
        // Luces de techo en los pasillos
        for (let i = 0; i < 10; i++) {
            const ceilingLight = new THREE.PointLight(0xffaa66, 1, 20);
            ceilingLight.position.set(-25 + i * 10, 3.5, 25);
            ceilingLight.castShadow = true;
            this.scene.add(ceilingLight);
            this.lights.push(ceilingLight);
            
            // Modelo de la lámpara
            const lampGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.2, 16);
            const lampMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.7
            });
            const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
            lamp.position.set(-25 + i * 10, 3.5, 25);
            this.scene.add(lamp);
        }
        
        // Luces exteriores
        for (let i = 0; i < 5; i++) {
            const streetLight = new THREE.SpotLight(0xffaa66, 1, 30, Math.PI / 4);
            streetLight.position.set(-150 + i * 75, 5, -50);
            streetLight.castShadow = true;
            this.scene.add(streetLight);
            this.lights.push(streetLight);
            
            // Poste de luz
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 16);
            const poleMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.7
            });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.set(-150 + i * 75, 2.5, -50);
            this.scene.add(pole);
            
            // Lámpara
            const lampGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const lampMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa66,
                emissive: 0xffaa66
            });
            const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
            lamp.position.set(-150 + i * 75, 5, -50);
            this.scene.add(lamp);
        }
    }
    
    // Crear efectos
    createEffects() {
        // Partículas de polvo
        this.createDustParticles();
        
        // Efectos de clima
        this.createWeatherEffects();
    }
    
    // Crear partículas de polvo
    createDustParticles() {
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 500,
                Math.random() * 10,
                (Math.random() - 0.5) * 500
            );
            
            colors.push(0.8, 0.8, 0.8);
            
            sizes.push(Math.random() * 0.1 + 0.05);
        }
        
        particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.effects.push(particleSystem);
    }
    
    // Crear efectos de clima
    createWeatherEffects() {
        // Por ahora solo creamos la estructura, los efectos se activan según el clima
        this.weatherEffects = {
            rain: null,
            fog: null,
            storm: null
        };
    }
    
    // Crear objetos interactivos adicionales
    createInteractiveObjects() {
        // Botones de ascensor
        for (let i = 0; i < 2; i++) {
            const elevatorButton = this.createElevatorButton();
            elevatorButton.position.set(55 + i * 5, 1, 0);
            elevatorButton.userData = {
                type: 'elevator-button',
                interactive: true,
                floor: i === 0 ? 1 : 2
            };
            this.scene.add(elevatorButton);
            this.interactiveObjects.push(elevatorButton);
        }
        
        // Extintores
        for (let i = 0; i < 3; i++) {
            const fireExtinguisher = this.createFireExtinguisher();
            fireExtinguisher.position.set(
                -20 + i * 100,
                0.5,
                30
            );
            fireExtinguisher.userData = {
                type: 'fire-extinguisher',
                interactive: true
            };
            this.scene.add(fireExtinguisher);
            this.interactiveObjects.push(fireExtinguisher);
        }
        
        // Carteles informativos
        for (let i = 0; i < 5; i++) {
            const sign = this.createInfoSign();
            sign.position.set(
                -40 + i * 40,
                2,
                -20
            );
            sign.userData = {
                type: 'info-sign',
                interactive: true,
                message: `Información ${i + 1}`
            };
            this.scene.add(sign);
            this.interactiveObjects.push(sign);
        }
    }
    
    // Crear botón de ascensor
    createElevatorButton() {
        const buttonGroup = new THREE.Group();
        
        // Botón
        const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.5,
            metalness: 0.5
        });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonGroup.add(button);
        
        // Luz del botón
        const lightGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 0.03;
        buttonGroup.add(light);
        
        return buttonGroup;
    }
    
    // Crear extintor
    createFireExtinguisher() {
        const extinguisherGroup = new THREE.Group();
        
        // Cuerpo
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        extinguisherGroup.add(body);
        
        // Boquilla
        const nozzleGeometry = new THREE.ConeGeometry(0.05, 0.15, 16);
        const nozzleMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7
        });
        const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle.rotation.x = Math.PI;
        nozzle.position.y = 0.25;
        extinguisherGroup.add(nozzle);
        
        // Mango
        const handleGeometry = new THREE.TorusGeometry(0.08, 0.02, 16, 32);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.y = 0.35;
        extinguisherGroup.add(handle);
        
        return extinguisherGroup;
    }
    
    // Crear cartel informativo
    createInfoSign() {
        const signGroup = new THREE.Group();
        
        // Marco
        const frameGeometry = new THREE.BoxGeometry(1, 0.8, 0.05);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.7
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        signGroup.add(frame);
        
        // Cartel
        const signGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.01);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.z = 0.03;
        signGroup.add(sign);
        
        return signGroup;
    }
    
    // Actualizar el mundo
    update(deltaTime) {
        // Actualizar NPCs
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update(deltaTime);
        }
        
        // Actualizar efectos según el clima
        this.updateWeatherEffects(deltaTime);
        
        // Actualizar hora del día
        this.updateDayTime(deltaTime);
    }
    
    // Actualizar efectos del clima
    updateWeatherEffects(deltaTime) {
        switch (this.weather) {
            case 'rain':
                this.updateRain(deltaTime);
                break;
            case 'fog':
                this.updateFog(deltaTime);
                break;
            case 'storm':
                this.updateStorm(deltaTime);
                break;
        }
    }
    
    // Actualizar lluvia
    updateRain(deltaTime) {
        // Implementación de lluvia
    }
    
    // Actualizar niebla
    updateFog(deltaTime) {
        // Ajustar niebla según la hora del día
        const fogDensity = 0.001 + (1 - this.dayTime) * 0.003;
        this.scene.fog.density = fogDensity;
    }
    
    // Actualizar hora del día
    updateDayTime(deltaTime) {
        // Simular el paso del tiempo
        this.dayTime += deltaTime * 0.0001;
        if (this.dayTime > 1) this.dayTime = 0;
        
        // Ajustar colores del cielo según la hora
        const skyMaterial = this.scene.getObjectByName('sky')?.material;
        if (skyMaterial && skyMaterial.uniforms) {
            const time = this.dayTime;
            
            if (time < 0.25) {
                // Noche
                skyMaterial.uniforms.topColor.value.setHex(0x000033);
                skyMaterial.uniforms.bottomColor.value.setHex(0x000011);
            } else if (time < 0.5) {
                // Amanecer
                const factor = (time - 0.25) / 0.25;
                skyMaterial.uniforms.topColor.value.setHex(
                    THREE.Color.lerp(
                        new THREE.Color(0x000033),
                        new THREE.Color(0x87ceeb),
                        factor
                    ).getHex()
                );
                skyMaterial.uniforms.bottomColor.value.setHex(
                    THREE.Color.lerp(
                        new THREE.Color(0x000011),
                        new THREE.Color(0x1e90ff),
                        factor
                    ).getHex()
                );
            } else if (time < 0.75) {
                // Día
                skyMaterial.uniforms.topColor.value.setHex(0x87ceeb);
                skyMaterial.uniforms.bottomColor.value.setHex(0x1e90ff);
            } else {
                // Atardecer
                const factor = (time - 0.75) / 0.25;
                skyMaterial.uniforms.topColor.value.setHex(
                    THREE.Color.lerp(
                        new THREE.Color(0x87ceeb),
                        new THREE.Color(0x000033),
                        factor
                    ).getHex()
                );
                skyMaterial.uniforms.bottomColor.value.setHex(
                    THREE.Color.lerp(
                        new THREE.Color(0x1e90ff),
                        new THREE.Color(0x000011),
                        factor
                    ).getHex()
                );
            }
        }
        
        // Ajustar intensidad de las luces
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            if (light.isPointLight || light.isSpotLight) {
                light.intensity = 0.5 + (1 - Math.abs(0.5 - this.dayTime)) * 0.5;
            }
        }
    }
    
    // Cambiar clima
    setWeather(weather) {
        this.weather = weather;
        
        switch (weather) {
            case 'rain':
                this.scene.fog.density = 0.002;
                break;
            case 'fog':
                this.scene.fog.density = 0.005;
                break;
            case 'storm':
                this.scene.fog.density = 0.003;
                break;
            default:
                this.scene.fog.density = 0.001;
        }
    }
    
    // Obtener objetos interactivos
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
    
    // Limpiar recursos
    dispose() {
        // Limpiar edificios
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].dispose();
        }
        
        // Limpiar NPCs
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].dispose();
        }
        
        // Limpiar efectos
        for (let i = 0; i < this.effects.length; i++) {
            this.scene.remove(this.effects[i]);
            if (this.effects[i].geometry) this.effects[i].geometry.dispose();
            if (this.effects[i].material) this.effects[i].material.dispose();
        }
    }
}

export default World;
