/**
 * Building.js - Sistema de edificios para el campus SENA
 * Crea pasillos, salones, baños, etc. con arquitectura detallada
 */

// Importar Three.js desde CDN
import * as THREE from 'three';

export class Building {
    constructor(scene, position = { x: 0, y: 0, z: 0 }) {
        this.scene = scene;
        this.position = position;
        this.group = new THREE.Group();
        this.group.position.set(position.x, position.y, position.z);
        this.scene.add(this.group);
        
        this.walls = [];
        this.doors = [];
        this.windows = [];
        this.floors = [];
        this.ceiling = null;
        
        this.materials = {
            wall: new THREE.MeshStandardMaterial({
                color: 0xf5f5f5,
                roughness: 0.7,
                metalness: 0.1
            }),
            floor: new THREE.MeshStandardMaterial({
                color: 0xdddddd,
                roughness: 0.9,
                metalness: 0.05
            }),
            ceiling: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.05
            }),
            door: new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.6,
                metalness: 0.2
            }),
            window: new THREE.MeshStandardMaterial({
                color: 0x87ceeb,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.3
            }),
            trim: new THREE.MeshStandardMaterial({
                color: 0x654321,
                roughness: 0.5,
                metalness: 0.3
            })
        };
    }
    
    // Crear un pasillo
    createHallway(length, width, height, direction = 'z') {
        const hallwayGroup = new THREE.Group();
        
        // Piso
        const floorGeometry = new THREE.PlaneGeometry(length, width);
        const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        hallwayGroup.add(floor);
        this.floors.push(floor);
        
        // Techo
        const ceilingGeometry = new THREE.PlaneGeometry(length, width);
        this.ceiling = new THREE.Mesh(ceilingGeometry, this.materials.ceiling);
        this.ceiling.rotation.x = Math.PI / 2;
        this.ceiling.position.y = height;
        hallwayGroup.add(this.ceiling);
        
        // Paredes laterales
        if (direction === 'z') {
            // Pared izquierda
            const leftWallGeometry = new THREE.PlaneGeometry(width, height);
            const leftWall = new THREE.Mesh(leftWallGeometry, this.materials.wall);
            leftWall.rotation.y = Math.PI / 2;
            leftWall.position.set(-length / 2, height / 2, 0);
            leftWall.castShadow = true;
            leftWall.receiveShadow = true;
            hallwayGroup.add(leftWall);
            this.walls.push(leftWall);
            
            // Pared derecha
            const rightWall = leftWall.clone();
            rightWall.position.x = length / 2;
            hallwayGroup.add(rightWall);
            this.walls.push(rightWall);
        } else if (direction === 'x') {
            // Pared frontal
            const frontWallGeometry = new THREE.PlaneGeometry(length, height);
            const frontWall = new THREE.Mesh(frontWallGeometry, this.materials.wall);
            frontWall.rotation.y = 0;
            frontWall.position.set(0, height / 2, -width / 2);
            frontWall.castShadow = true;
            frontWall.receiveShadow = true;
            hallwayGroup.add(frontWall);
            this.walls.push(frontWall);
            
            // Pared trasera
            const backWall = frontWall.clone();
            backWall.position.z = width / 2;
            hallwayGroup.add(backWall);
            this.walls.push(backWall);
        }
        
        // Añadir molduras (trim)
        this.addTrim(hallwayGroup, length, width, height, direction);
        
        this.group.add(hallwayGroup);
        return hallwayGroup;
    }
    
    // Añadir molduras a las paredes
    addTrim(group, length, width, height, direction) {
        const trimThickness = 0.1;
        const trimHeight = 0.2;
        
        if (direction === 'z') {
            // Moldura superior
            const topTrimGeometry = new THREE.BoxGeometry(length + 0.2, trimThickness, trimHeight);
            const topTrim = new THREE.Mesh(topTrimGeometry, this.materials.trim);
            topTrim.position.set(0, height - trimThickness / 2, 0);
            group.add(topTrim);
            
            // Moldura inferior
            const bottomTrim = topTrim.clone();
            bottomTrim.position.y = trimThickness / 2;
            group.add(bottomTrim);
        }
    }
    
    // Crear un salón de clases
    createClassroom(width, depth, height, classroomNumber = '101') {
        const classroomGroup = new THREE.Group();
        
        // Piso
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floor = new THREE.Mesh(floorGeometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        classroomGroup.add(floor);
        this.floors.push(floor);
        
        // Techo
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, this.materials.ceiling);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        classroomGroup.add(ceiling);
        
        // Paredes
        const wallThickness = 0.2;
        
        // Pared frontal (con pizarra y puerta)
        const frontWallGroup = new THREE.Group();
        
        // Pizarra
        const blackboardGeometry = new THREE.PlaneGeometry(4, 2);
        const blackboardMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9,
            metalness: 0.1
        });
        const blackboard = new THREE.Mesh(blackboardGeometry, blackboardMaterial);
        blackboard.position.set(0, height / 2, -depth / 2 + 0.1);
        frontWallGroup.add(blackboard);
        
        // Marco de la pizarra
        const blackboardFrameGeometry = new THREE.BoxGeometry(4.2, 0.1, 0.1);
        const blackboardFrame = new THREE.Mesh(blackboardFrameGeometry, this.materials.trim);
        blackboardFrame.position.set(0, height / 2, -depth / 2 + 0.1);
        frontWallGroup.add(blackboardFrame);
        
        // Puerta
        const doorWidth = 1.2;
        const doorHeight = 2.2;
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, wallThickness);
        const door = new THREE.Mesh(doorGeometry, this.materials.door);
        door.position.set(width / 2 - 2, doorHeight / 2, -depth / 2 + 0.1);
        door.userData = {
            type: 'door',
            interactive: true,
            room: `Classroom ${classroomNumber}`
        };
        frontWallGroup.add(door);
        this.doors.push(door);
        
        // Paredes laterales
        const leftWallGeometry = new THREE.PlaneGeometry(wallThickness, height);
        const leftWall = new THREE.Mesh(leftWallGeometry, this.materials.wall);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-width / 2 + wallThickness / 2, height / 2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        classroomGroup.add(leftWall);
        this.walls.push(leftWall);
        
        const rightWall = leftWall.clone();
        rightWall.position.x = width / 2 - wallThickness / 2;
        classroomGroup.add(rightWall);
        this.walls.push(rightWall);
        
        // Pared trasera
        const backWallGeometry = new THREE.PlaneGeometry(width, height);
        const backWall = new THREE.Mesh(backWallGeometry, this.materials.wall);
        backWall.position.set(0, height / 2, depth / 2 - wallThickness / 2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        classroomGroup.add(backWall);
        this.walls.push(backWall);
        
        // Ventanas en la pared trasera
        this.addWindows(classroomGroup, width, depth, height, 'back');
        
        // Mesas y sillas
        this.addFurniture(classroomGroup, width, depth, height);
        
        // Televisor
        this.addTV(classroomGroup, width, depth, height);
        
        // Cartel de la clase
        this.addClassroomSign(classroomGroup, width, depth, height, classroomNumber);
        
        classroomGroup.add(frontWallGroup);
        this.group.add(classroomGroup);
        
        return classroomGroup;
    }
    
    // Añadir ventanas
    addWindows(group, width, depth, height, wall) {
        const windowWidth = 1.5;
        const windowHeight = 1.2;
        const windowSpacing = 2;
        
        let startX, startZ, direction;
        
        if (wall === 'back') {
            startX = -width / 2 + windowWidth / 2 + 1;
            startZ = depth / 2 - 0.1;
            direction = 'x';
        } else if (wall === 'left') {
            startX = -width / 2 + 0.1;
            startZ = -depth / 2 + windowHeight / 2 + 1;
            direction = 'z';
        } else {
            startX = width / 2 - 0.1;
            startZ = -depth / 2 + windowHeight / 2 + 1;
            direction = 'z';
        }
        
        // Crear 3 ventanas
        for (let i = 0; i < 3; i++) {
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const window = new THREE.Mesh(windowGeometry, this.materials.window);
            
            if (direction === 'x') {
                window.position.set(startX + i * windowSpacing, height / 2, startZ);
            } else {
                window.rotation.y = Math.PI / 2;
                window.position.set(startX, height / 2, startZ + i * windowSpacing);
            }
            
            group.add(window);
            this.windows.push(window);
            
            // Marco de la ventana
            const windowFrameGeometry = new THREE.BoxGeometry(
                windowWidth + 0.1, 
                windowHeight + 0.1, 
                0.1
            );
            const windowFrame = new THREE.Mesh(windowFrameGeometry, this.materials.trim);
            windowFrame.position.copy(window.position);
            group.add(windowFrame);
        }
    }
    
    // Añadir mobiliario (mesas y sillas)
    addFurniture(group, width, depth, height) {
        const deskWidth = 1.2;
        const deskDepth = 0.6;
        const deskHeight = 0.75;
        const chairHeight = 0.5;
        
        // Crear 5 filas de mesas con 4 mesas cada una
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const x = -width / 2 + 2 + col * 2.5;
                const z = -depth / 2 + 2 + row * 2;
                
                // Mesa
                const deskGeometry = new THREE.BoxGeometry(deskWidth, deskHeight, deskDepth);
                const deskMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.7,
                    metalness: 0.2
                });
                const desk = new THREE.Mesh(deskGeometry, deskMaterial);
                desk.position.set(x, deskHeight / 2, z);
                desk.castShadow = true;
                desk.receiveShadow = true;
                group.add(desk);
                
                // Silla
                const chairGeometry = new THREE.BoxGeometry(0.4, chairHeight, 0.4);
                const chairMaterial = new THREE.MeshStandardMaterial({
                    color: 0x4169e1,
                    roughness: 0.6,
                    metalness: 0.3
                });
                const chair = new THREE.Mesh(chairGeometry, chairMaterial);
                chair.position.set(x, chairHeight / 2, z + deskDepth / 2 + 0.3);
                chair.castShadow = true;
                group.add(chair);
            }
        }
    }
    
    // Añadir televisor
    addTV(group, width, depth, height) {
        const tvWidth = 2;
        const tvHeight = 1.2;
        const tvThickness = 0.1;
        
        // Marco del televisor
        const tvFrameGeometry = new THREE.BoxGeometry(
            tvWidth + 0.2, 
            tvHeight + 0.2, 
            0.2
        );
        const tvFrameMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.8
        });
        const tvFrame = new THREE.Mesh(tvFrameGeometry, tvFrameMaterial);
        tvFrame.position.set(width / 2 - 1, height / 2, -depth / 2 + 0.1);
        tvFrame.castShadow = true;
        group.add(tvFrame);
        
        // Pantalla del televisor
        const screenGeometry = new THREE.PlaneGeometry(tvWidth, tvHeight);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(width / 2 - 1, height / 2, -depth / 2 + 0.2);
        screen.userData = {
            type: 'tv',
            interactive: true,
            screen: true
        };
        group.add(screen);
        this.interactiveObjects.push(screen);
        
        // Soporte del televisor
        const standGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const stand = new THREE.Mesh(standGeometry, tvFrameMaterial);
        stand.position.set(width / 2 - 1, height / 2 - tvHeight / 2 - 0.25, -depth / 2 + 0.1);
        group.add(stand);
    }
    
    // Añadir cartel de la clase
    addClassroomSign(group, width, depth, height, classroomNumber) {
        const signWidth = 1;
        const signHeight = 0.3;
        
        // Cartel
        const signGeometry = new THREE.BoxGeometry(signWidth, signHeight, 0.05);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, height + 0.2, -depth / 2 + 0.1);
        group.add(sign);
        
        // Texto del cartel (usando CanvasTexture)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Salón ${classroomNumber}`, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.2),
            textMaterial
        );
        textMesh.position.set(0, height + 0.2, -depth / 2 + 0.11);
        group.add(textMesh);
    }
    
    // Crear baños
    createBathroom(width, depth, height, isMale = true) {
        const bathroomGroup = new THREE.Group();
        
        // Piso (con baldosas)
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.95,
            metalness: 0.05
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        bathroomGroup.add(floor);
        this.floors.push(floor);
        
        // Techo
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, this.materials.ceiling);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        bathroomGroup.add(ceiling);
        
        // Paredes
        const wallThickness = 0.2;
        
        // Paredes laterales
        const leftWallGeometry = new THREE.PlaneGeometry(wallThickness, height);
        const leftWall = new THREE.Mesh(leftWallGeometry, this.materials.wall);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-width / 2 + wallThickness / 2, height / 2, 0);
        bathroomGroup.add(leftWall);
        this.walls.push(leftWall);
        
        const rightWall = leftWall.clone();
        rightWall.position.x = width / 2 - wallThickness / 2;
        bathroomGroup.add(rightWall);
        this.walls.push(rightWall);
        
        // Pared frontal
        const frontWallGeometry = new THREE.PlaneGeometry(width, height);
        const frontWall = new THREE.Mesh(frontWallGeometry, this.materials.wall);
        frontWall.position.set(0, height / 2, -depth / 2 + wallThickness / 2);
        bathroomGroup.add(frontWall);
        this.walls.push(frontWall);
        
        // Pared trasera
        const backWall = frontWall.clone();
        backWall.position.z = depth / 2 - wallThickness / 2;
        bathroomGroup.add(backWall);
        this.walls.push(backWall);
        
        // Puerta
        const doorWidth = 1;
        const doorHeight = 2;
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, wallThickness);
        const door = new THREE.Mesh(doorGeometry, this.materials.door);
        door.position.set(width / 2 - 1, doorHeight / 2, -depth / 2 + wallThickness / 2);
        door.userData = {
            type: 'door',
            interactive: true,
            room: isMale ? 'Baño Hombres' : 'Baño Mujeres'
        };
        bathroomGroup.add(door);
        this.doors.push(door);
        
        // Sanitarios
        this.addBathroomFixtures(bathroomGroup, width, depth, height, isMale);
        
        // Cartel del baño
        this.addBathroomSign(bathroomGroup, width, depth, height, isMale);
        
        this.group.add(bathroomGroup);
        return bathroomGroup;
    }
    
    // Añadir accesorios de baño
    addBathroomFixtures(group, width, depth, height, isMale) {
        // Lavabos
        for (let i = 0; i < 3; i++) {
            const sinkWidth = 0.6;
            const sinkDepth = 0.4;
            const sinkHeight = 0.8;
            
            const sinkGeometry = new THREE.BoxGeometry(sinkWidth, sinkHeight, sinkDepth);
            const sinkMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8
            });
            const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
            sink.position.set(
                -width / 2 + 1 + i * 2,
                sinkHeight / 2,
                depth / 2 - 1
            );
            group.add(sink);
            
            // Grifo
            const faucetGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
            const faucetMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.8,
                roughness: 0.3
            });
            const faucet = new THREE.Mesh(faucetGeometry, faucetMaterial);
            faucet.rotation.x = Math.PI / 2;
            faucet.position.set(
                -width / 2 + 1 + i * 2,
                sinkHeight + 0.1,
                depth / 2 - 1 + sinkDepth / 2
            );
            group.add(faucet);
        }
        
        // Inodoros o urinarios
        if (isMale) {
            // Urinarios
            for (let i = 0; i < 2; i++) {
                const urinalGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
                const urinalMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.8
                });
                const urinal = new THREE.Mesh(urinalGeometry, urinalMaterial);
                urinal.position.set(
                    width / 2 - 1,
                    0.3,
                    depth / 2 - 1 + i * 1.5
                );
                group.add(urinal);
            }
        }
        
        // Cabinas
        for (let i = 0; i < 2; i++) {
            const stallWidth = 1.2;
            const stallDepth = 1;
            const stallHeight = 2;
            
            // Paredes de la cabina
            const stallWallGeometry = new THREE.PlaneGeometry(stallWidth, stallHeight);
            const stallWallMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.7
            });
            
            const leftStallWall = new THREE.Mesh(stallWallGeometry, stallWallMaterial);
            leftStallWall.rotation.y = Math.PI / 2;
            leftStallWall.position.set(
                width / 2 - 3 + i * 2.5,
                stallHeight / 2,
                -depth / 2 + 1
            );
            group.add(leftStallWall);
            
            const rightStallWall = leftStallWall.clone();
            rightStallWall.position.x = width / 2 - 3 + i * 2.5 + stallWidth;
            group.add(rightStallWall);
            
            // Puerta de la cabina
            const stallDoorGeometry = new THREE.BoxGeometry(0.1, stallHeight - 0.5, stallDepth);
            const stallDoor = new THREE.Mesh(stallDoorGeometry, this.materials.door);
            stallDoor.position.set(
                width / 2 - 3 + i * 2.5 + stallWidth / 2,
                (stallHeight - 0.5) / 2,
                -depth / 2 + 1 + stallDepth / 2
            );
            group.add(stallDoor);
        }
    }
    
    // Añadir cartel del baño
    addBathroomSign(group, width, depth, height, isMale) {
        const signWidth = 0.8;
        const signHeight = 0.3;
        
        const signGeometry = new THREE.BoxGeometry(signWidth, signHeight, 0.05);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: isMale ? 0x0066cc : 0xcc0066,
            roughness: 0.7
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, height + 0.2, -depth / 2 + 0.1);
        group.add(sign);
        
        // Icono del baño
        const iconCanvas = document.createElement('canvas');
        iconCanvas.width = 64;
        iconCanvas.height = 64;
        const iconCtx = iconCanvas.getContext('2d');
        iconCtx.fillStyle = 'white';
        iconCtx.fillRect(0, 0, iconCanvas.width, iconCanvas.height);
        iconCtx.font = 'bold 40px Arial';
        iconCtx.fillStyle = 'black';
        iconCtx.textAlign = 'center';
        iconCtx.textBaseline = 'middle';
        iconCtx.fillText(isMale ? '♂' : '♀', iconCanvas.width / 2, iconCanvas.height / 2);
        
        const iconTexture = new THREE.CanvasTexture(iconCanvas);
        const iconMaterial = new THREE.MeshBasicMaterial({ map: iconTexture });
        const iconMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.6),
            iconMaterial
        );
        iconMesh.position.set(0, height + 0.2, -depth / 2 + 0.11);
        group.add(iconMesh);
    }
    
    // Crear tableros (pizarras)
    createWhiteboard(width, height, position) {
        const whiteboardGroup = new THREE.Group();
        
        // Marco
        const frameGeometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.copy(position);
        whiteboardGroup.add(frame);
        
        // Superficie de la pizarra
        const boardGeometry = new THREE.PlaneGeometry(width, height);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.1
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(position.x, position.y, position.z + 0.06);
        board.userData = {
            type: 'whiteboard',
            interactive: true,
            writable: true
        };
        whiteboardGroup.add(board);
        
        this.group.add(whiteboardGroup);
        return whiteboardGroup;
    }
    
    // Crear escaleras
    createStairs(steps, width, depth, height, direction = 'up') {
        const stairsGroup = new THREE.Group();
        const stepHeight = height / steps;
        const stepDepth = depth / steps;
        
        for (let i = 0; i < steps; i++) {
            // Peldaño
            const stepGeometry = new THREE.BoxGeometry(width, stepHeight, stepDepth);
            const stepMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.8
            });
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(0, stepHeight / 2 + i * stepHeight, -i * stepDepth);
            step.castShadow = true;
            step.receiveShadow = true;
            stairsGroup.add(step);
        }
        
        this.group.add(stairsGroup);
        return stairsGroup;
    }
    
    // Limpiar recursos
    dispose() {
        this.scene.remove(this.group);
        
        // Limpiar geometrías y materiales
        this.group.traverse((object) => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
    }
}

export default Building;
