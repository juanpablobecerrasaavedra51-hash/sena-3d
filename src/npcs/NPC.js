/**
 * NPC.js - Sistema de personajes no jugadores
 * NPCs con animaciones, interacciones y vestuario
 */

// Importar Three.js desde CDN
import * as THREE from 'three';

export class NPC {
    constructor(scene, position, options = {}) {
        this.scene = scene;
        this.position = position;
        this.options = {
            type: 'student', // student, teacher, staff
            gender: 'male', // male, female
            outfit: 'casual', // casual, formal, uniform
            role: 'walking', // walking, standing, sitting, teaching
            ...options
        };
        
        this.group = new THREE.Group();
        this.group.position.set(position.x, position.y, position.z);
        this.scene.add(this.group);
        
        this.bodyParts = {};
        this.animations = {};
        this.currentAnimation = null;
        this.targetPosition = null;
        this.speed = 0.05;
        this.interactionRadius = 2;
        
        this.createBody();
        this.setupAnimations();
        this.setupInteraction();
    }
    
    // Crear el cuerpo del NPC
    createBody() {
        // Cabeza
        this.bodyParts.head = this.createHead();
        this.group.add(this.bodyParts.head);
        
        // Torso
        this.bodyParts.torso = this.createTorso();
        this.group.add(this.bodyParts.torso);
        
        // Brazos
        this.bodyParts.leftArm = this.createArm('left');
        this.bodyParts.rightArm = this.createArm('right');
        this.group.add(this.bodyParts.leftArm);
        this.group.add(this.bodyParts.rightArm);
        
        // Piernas
        this.bodyParts.leftLeg = this.createLeg('left');
        this.bodyParts.rightLeg = this.createLeg('right');
        this.group.add(this.bodyParts.leftLeg);
        this.group.add(this.bodyParts.rightLeg);
        
        // Posicionar partes del cuerpo
        this.positionBodyParts();
        
        // Ropa según el tipo
        this.dressNPC();
    }
    
    // Crear cabeza
    createHead() {
        const headGroup = new THREE.Group();
        
        // Cabeza base
        const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const skinColor = this.getSkinColor();
        const headMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.25;
        headGroup.add(head);
        
        // Cabello
        const hairGeometry = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairColor = this.getHairColor();
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.9
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.35;
        headGroup.add(hair);
        
        // Ojos
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 0.28, 0.25);
        headGroup.add(leftEye);
        
        const rightEye = leftEye.clone();
        rightEye.position.x = 0.1;
        headGroup.add(rightEye);
        
        // Pupilas
        const pupilGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.1, 0.28, 0.27);
        headGroup.add(leftPupil);
        
        const rightPupil = leftPupil.clone();
        rightPupil.position.x = 0.1;
        headGroup.add(rightPupil);
        
        // Cejas
        const eyebrowGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.05);
        const eyebrowMaterial = new THREE.MeshStandardMaterial({
            color: hairColor
        });
        
        const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
        leftEyebrow.position.set(-0.12, 0.32, 0.25);
        headGroup.add(leftEyebrow);
        
        const rightEyebrow = leftEyebrow.clone();
        rightEyebrow.position.x = 0.12;
        headGroup.add(rightEyebrow);
        
        // Boca
        const mouthGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.05);
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 0.2, 0.25);
        headGroup.add(mouth);
        
        return headGroup;
    }
    
    // Crear torso
    createTorso() {
        const torsoGeometry = new THREE.CylinderGeometry(0.35, 0.25, 0.6, 32);
        const skinColor = this.getSkinColor();
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 0.3;
        return torso;
    }
    
    // Crear brazo
    createArm(side) {
        const armGroup = new THREE.Group();
        
        // Brazo superior
        const upperArmGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.4, 16);
        const skinColor = this.getSkinColor();
        const upperArmMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });
        const upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
        upperArm.rotation.x = Math.PI / 2;
        armGroup.add(upperArm);
        
        // Antebrazo
        const forearmGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.4, 16);
        const forearm = new THREE.Mesh(forearmGeometry, upperArmMaterial);
        forearm.position.y = -0.4;
        forearm.rotation.x = Math.PI / 2;
        armGroup.add(forearm);
        
        // Mano
        const handGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const hand = new THREE.Mesh(handGeometry, upperArmMaterial);
        hand.position.y = -0.8;
        armGroup.add(hand);
        
        return armGroup;
    }
    
    // Crear pierna
    createLeg(side) {
        const legGroup = new THREE.Group();
        
        // Muslo
        const thighGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 16);
        const skinColor = this.getSkinColor();
        const thighMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });
        const thigh = new THREE.Mesh(thighGeometry, thighMaterial);
        thigh.rotation.x = Math.PI / 2;
        legGroup.add(thigh);
        
        // Pierna inferior
        const lowerLegGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 16);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, thighMaterial);
        lowerLeg.position.y = -0.5;
        lowerLeg.rotation.x = Math.PI / 2;
        legGroup.add(lowerLeg);
        
        // Pie
        const footGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.2);
        const foot = new THREE.Mesh(footGeometry, thighMaterial);
        foot.position.y = -1;
        foot.rotation.x = Math.PI / 4;
        legGroup.add(foot);
        
        return legGroup;
    }
    
    // Posicionar partes del cuerpo
    positionBodyParts() {
        // Torso en el centro
        this.bodyParts.torso.position.set(0, 0, 0);
        
        // Cabeza sobre el torso
        this.bodyParts.head.position.set(0, 0.6, 0);
        
        // Brazos a los lados
        this.bodyParts.leftArm.position.set(-0.4, 0.5, 0);
        this.bodyParts.rightArm.position.set(0.4, 0.5, 0);
        
        // Piernas
        this.bodyParts.leftLeg.position.set(-0.15, -0.3, 0);
        this.bodyParts.rightLeg.position.set(0.15, -0.3, 0);
    }
    
    // Vestir al NPC según su tipo
    dressNPC() {
        const outfit = this.options.outfit;
        const type = this.options.type;
        
        // Camisa
        if (type === 'teacher' || outfit === 'formal') {
            this.addShirt(0xffffff, 0.36, 0.4); // Camisa blanca
        } else if (type === 'student' && outfit === 'uniform') {
            this.addShirt(0x0066cc, 0.36, 0.4); // Camisa azul (uniforme)
        } else {
            this.addShirt(this.getRandomColor(), 0.36, 0.4); // Camisa casual
        }
        
        // Pantalón
        if (type === 'teacher' || outfit === 'formal') {
            this.addPants(0x333333, 0.34, 0.5); // Pantalón negro
        } else if (type === 'student' && outfit === 'uniform') {
            this.addPants(0x666666, 0.34, 0.5); // Pantalón gris (uniforme)
        } else {
            this.addPants(this.getRandomColor(), 0.34, 0.5); // Pantalón casual
        }
        
        // Chaleco o corbata para profesores
        if (type === 'teacher') {
            this.addTie();
        }
        
        // Delantal para personal de limpieza
        if (type === 'staff' && this.options.role === 'cleaner') {
            this.addApron();
        }
    }
    
    // Añadir camisa
    addShirt(color, radiusTop, radiusBottom) {
        const shirtGeometry = new THREE.CylinderGeometry(
            radiusTop, 
            radiusBottom, 
            0.4, 
            32
        );
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7
        });
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
        shirt.position.y = 0.4;
        shirt.rotation.y = Math.PI / 4; // Rotación para que quede como camisa
        this.group.add(shirt);
    }
    
    // Añadir pantalón
    addPants(color, radiusTop, radiusBottom) {
        const pantsGeometry = new THREE.CylinderGeometry(
            radiusTop, 
            radiusBottom, 
            0.5, 
            16,
            1,
            false,
            0,
            Math.PI
        );
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7
        });
        const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
        pants.position.set(0, -0.1, 0);
        pants.rotation.x = Math.PI / 2;
        this.group.add(pants);
    }
    
    // Añadir corbata
    addTie() {
        const tieGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.02);
        const tieMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.5
        });
        const tie = new THREE.Mesh(tieGeometry, tieMaterial);
        tie.position.set(0, 0.45, 0.2);
        tie.rotation.x = Math.PI / 4;
        this.group.add(tie);
    }
    
    // Añadir delantal
    addApron() {
        const apronGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.05);
        const apronMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8
        });
        const apron = new THREE.Mesh(apronGeometry, apronMaterial);
        apron.position.set(0, 0.15, 0.15);
        this.group.add(apron);
    }
    
    // Configurar animaciones
    setupAnimations() {
        this.animations = {
            idle: this.createIdleAnimation(),
            walking: this.createWalkingAnimation(),
            sitting: this.createSittingAnimation(),
            teaching: this.createTeachingAnimation(),
            waving: this.createWavingAnimation()
        };
        
        this.currentAnimation = this.animations.idle;
    }
    
    // Animación de reposo
    createIdleAnimation() {
        return {
            update: (deltaTime) => {
                // Pequeño movimiento de balanceo
                this.bodyParts.head.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
                this.bodyParts.leftArm.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
                this.bodyParts.rightArm.rotation.x = Math.sin(Date.now() * 0.001 + Math.PI) * 0.05;
            }
        };
    }
    
    // Animación de caminar
    createWalkingAnimation() {
        return {
            update: (deltaTime) => {
                const time = Date.now() * 0.005;
                
                // Movimiento de brazos
                this.bodyParts.leftArm.rotation.x = Math.sin(time) * 0.5;
                this.bodyParts.rightArm.rotation.x = Math.sin(time + Math.PI) * 0.5;
                
                // Movimiento de piernas
                this.bodyParts.leftLeg.rotation.x = Math.sin(time) * 0.5;
                this.bodyParts.rightLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
                
                // Movimiento de cabeza
                this.bodyParts.head.rotation.y = Math.sin(time * 0.5) * 0.1;
                
                // Movimiento del torso
                this.bodyParts.torso.position.y = 0.3 + Math.sin(time * 0.5) * 0.02;
            }
        };
    }
    
    // Animación de sentado
    createSittingAnimation() {
        return {
            update: (deltaTime) => {
                // Posición de sentado
                this.bodyParts.torso.position.y = 0.1;
                this.bodyParts.head.position.y = 0.4;
                
                // Piernas dobladas
                this.bodyParts.leftLeg.rotation.x = -Math.PI / 4;
                this.bodyParts.rightLeg.rotation.x = -Math.PI / 4;
                this.bodyParts.leftLeg.position.y = -0.3;
                this.bodyParts.rightLeg.position.y = -0.3;
                
                // Brazos en reposo
                this.bodyParts.leftArm.rotation.x = -Math.PI / 6;
                this.bodyParts.rightArm.rotation.x = -Math.PI / 6;
                
                // Pequeño movimiento
                this.bodyParts.head.rotation.y = Math.sin(Date.now() * 0.0005) * 0.05;
            }
        };
    }
    
    // Animación de enseñar
    createTeachingAnimation() {
        return {
            update: (deltaTime) => {
                const time = Date.now() * 0.002;
                
                // Brazo derecho levantado
                this.bodyParts.rightArm.rotation.x = Math.sin(time * 0.5) * 0.3 - 0.5;
                this.bodyParts.rightArm.rotation.z = Math.sin(time * 0.3) * 0.2;
                
                // Brazo izquierdo en la cintura
                this.bodyParts.leftArm.rotation.x = -0.3;
                
                // Cabeza mirando hacia los estudiantes
                this.bodyParts.head.rotation.y = Math.sin(time * 0.2) * 0.1;
            }
        };
    }
    
    // Animación de saludar
    createWavingAnimation() {
        return {
            update: (deltaTime) => {
                const time = Date.now() * 0.005;
                
                // Brazo derecho moviéndose
                this.bodyParts.rightArm.rotation.x = Math.sin(time * 2) * 0.8 - 0.5;
                this.bodyParts.rightArm.rotation.z = Math.sin(time * 2) * 0.5;
                
                // Sonrisa
                if (this.bodyParts.head.children[5]) {
                    this.bodyParts.head.children[5].scale.y = 0.1 + Math.sin(time * 2) * 0.05;
                }
            }
        };
    }
    
    // Configurar interacción
    setupInteraction() {
        this.group.userData = {
            type: 'npc',
            interactive: true,
            npc: this,
            interactionRadius: this.interactionRadius
        };
    }
    
    // Actualizar NPC
    update(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
        }
        
        // Mover hacia el objetivo si hay uno
        if (this.targetPosition) {
            const direction = new THREE.Vector3(
                this.targetPosition.x - this.group.position.x,
                0,
                this.targetPosition.z - this.group.position.z
            ).normalize();
            
            const distance = this.group.position.distanceTo(this.targetPosition);
            
            if (distance > 0.1) {
                this.group.position.add(direction.multiplyScalar(this.speed));
                
                // Rotar hacia la dirección del movimiento
                this.group.lookAt(this.targetPosition);
                this.group.rotation.y += Math.PI; // Corregir rotación
            } else {
                this.targetPosition = null;
            }
        }
    }
    
    // Mover NPC a una posición
    moveTo(position) {
        this.targetPosition = new THREE.Vector3(position.x, 0, position.z);
        this.currentAnimation = this.animations.walking;
    }
    
    // Cambiar animación
    setAnimation(animationName) {
        if (this.animations[animationName]) {
            this.currentAnimation = this.animations[animationName];
        }
    }
    
    // Interactuar con el NPC
    interact() {
        // Cambiar animación temporalmente
        const originalAnimation = this.currentAnimation;
        this.currentAnimation = this.animations.waving;
        
        // Volver a la animación original después de 3 segundos
        setTimeout(() => {
            this.currentAnimation = originalAnimation;
        }, 3000);
        
        // Mostrar diálogo (esto se manejaría en el sistema de UI)
        this.showDialog();
    }
    
    // Mostrar diálogo
    showDialog() {
        const messages = {
            student: [
                "¡Hola! ¿Sabes dónde es el salón 101?",
                "Estoy estudiando para el examen de Three.js",
                "¿Has visto mi cuaderno?",
                "El profesor explicó algo interesante hoy"
            ],
            teacher: [
                "Bienvenido al campus SENA. ¿En qué puedo ayudarte?",
                "Recuerda: la práctica hace al maestro",
                "¿Tienes alguna pregunta sobre la clase?",
                "El conocimiento es poder"
            ],
            staff: [
                "¿Necesitas ayuda para encontrar algo?",
                "El campus está limpio gracias a nuestro trabajo",
                "¿Buscas a alguien en particular?",
                "Mantengamos el orden en el campus"
            ]
        };
        
        const randomMessage = messages[this.options.type][
            Math.floor(Math.random() * messages[this.options.type].length)
        ];
        
        // Este evento sería escuchado por el sistema de UI
        window.dispatchEvent(new CustomEvent('npc-dialog', {
            detail: {
                npc: this,
                message: randomMessage
            }
        }));
    }
    
    // Obtener color de piel según género
    getSkinColor() {
        const skinColors = {
            male: [0xffdab9, 0xf4c2a1, 0xd2b48c, 0xc68642],
            female: [0xffd1dc, 0xf5deb3, 0xdeb887, 0xf5f5dc]
        };
        const colors = skinColors[this.options.gender] || skinColors.male;
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Obtener color de cabello
    getHairColor() {
        const hairColors = [0x000000, 0x8b4513, 0xa0522d, 0xd2691e, 0xcd853f, 0xf4a460];
        return hairColors[Math.floor(Math.random() * hairColors.length)];
    }
    
    // Obtener color aleatorio
    getRandomColor() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Limpiar recursos
    dispose() {
        this.scene.remove(this.group);
        
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

export default NPC;
