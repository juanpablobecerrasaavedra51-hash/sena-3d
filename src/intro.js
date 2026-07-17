/**
 * INTRO EPICA - JUJUTSU KAISEN STYLE
 * Templo Malevolo de Sukuna
 */

import * as THREE from 'three';

export class JujutsuIntro {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();
        
        this.parameters = {
            colorPrimary: 0x8b0000,
            colorSecondary: 0x4b0082,
            colorAccent: 0x00ffff,
            colorDark: 0x050008,
            colorLight: 0xffffff,
            particleCount: 1500,
            particleSize: 0.08
        };
        
        this.objects = {};
        this.particles = null;
        this.animationFrameId = null;
        this.isComplete = false;
        
        this.init();
        this.createScene();
        this.createParticles();
        this.createCursedEnergy();
        this.createLogo();
        this.createText();
        this.setupEvents();
        this.animateIn();
    }
    
    init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(this.parameters.colorDark, 1, 100);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        this.clock = new THREE.Clock();
    }
    
    createScene() {
        this.scene.background = new THREE.Color(this.parameters.colorDark);
        
        const ambientLight = new THREE.AmbientLight(this.parameters.colorPrimary, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(this.parameters.colorAccent, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        const cursedLight = new THREE.PointLight(this.parameters.colorSecondary, 2, 50);
        cursedLight.position.set(0, 0, -2);
        this.scene.add(cursedLight);
        this.objects.cursedLight = cursedLight;
        
        const hemiLight = new THREE.HemisphereLight(
            this.parameters.colorSecondary,
            this.parameters.colorDark,
            0.3
        );
        hemiLight.position.set(0, 1, 0);
        this.scene.add(hemiLight);
    }
    
    createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        
        const colorPrimary = new THREE.Color(this.parameters.colorPrimary);
        const colorSecondary = new THREE.Color(this.parameters.colorSecondary);
        const colorAccent = new THREE.Color(this.parameters.colorAccent);
        
        for (let i = 0; i < this.parameters.particleCount; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 3 + Math.random() * 2;
            
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);
            
            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.33) color = colorPrimary;
            else if (colorChoice < 0.66) color = colorSecondary;
            else color = colorAccent;
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = this.parameters.particleSize * (0.5 + Math.random());
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: this.parameters.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }
    
    animateParticles() {
        const positions = this.particles.geometry.attributes.position.array;
        const time = this.clock.getElapsedTime();
        
        for (let i = 0; i < positions.length; i += 3) {
            const offset = i / 3;
            const angle = time * 0.1 + offset * 0.01;
            const noise = Math.sin(angle * 3) * Math.cos(angle * 2) * 0.1;
            
            positions[i] += Math.sin(time * 0.05 + offset) * 0.002;
            positions[i + 1] += Math.cos(time * 0.03 + offset) * 0.002;
            positions[i + 2] += Math.sin(time * 0.07 + offset) * 0.001 + noise * 0.01;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    createCursedEnergy() {
        const energyGroup = new THREE.Group();
        
        const spiralGeometry = new THREE.BufferGeometry();
        const spiralPoints = [];
        const spiralColors = [];
        const spiralCount = 200;
        const colorAccent = new THREE.Color(this.parameters.colorAccent);
        
        for (let i = 0; i < spiralCount; i++) {
            const t = i / spiralCount;
            const radius = 0.5 + t * 2;
            const height = -t * 4;
            const theta = t * Math.PI * 8 + Math.sin(t * Math.PI * 4) * 0.5;
            
            spiralPoints.push(radius * Math.cos(theta), height, radius * Math.sin(theta));
            const alpha = 0.5 + t * 0.5;
            spiralColors.push(colorAccent.r * alpha, colorAccent.g * alpha, colorAccent.b * alpha);
        }
        
        spiralGeometry.setAttribute('position', new THREE.Float32BufferAttribute(spiralPoints, 3));
        spiralGeometry.setAttribute('color', new THREE.Float32BufferAttribute(spiralColors, 3));
        
        const spiralMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            linewidth: 2
        });
        
        const spiralLine = new THREE.Line(spiralGeometry, spiralMaterial);
        spiralLine.rotation.x = Math.PI / 4;
        spiralLine.rotation.y = Math.PI / 4;
        energyGroup.add(spiralLine);
        
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(1 + i * 0.3, 1.2 + i * 0.3, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: this.parameters.colorAccent,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3 - i * 0.1,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.z = -i * 0.5;
            energyGroup.add(ring);
        }
        
        this.objects.energyGroup = energyGroup;
        this.scene.add(energyGroup);
    }
    
    createLogo() {
        const logoGroup = new THREE.Group();
        
        const outerCircleGeometry = new THREE.RingGeometry(1.5, 1.8, 64);
        const outerCircleMaterial = new THREE.MeshBasicMaterial({
            color: this.parameters.colorPrimary,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const outerCircle = new THREE.Mesh(outerCircleGeometry, outerCircleMaterial);
        outerCircle.rotation.x = Math.PI / 2;
        logoGroup.add(outerCircle);
        
        const innerCircleGeometry = new THREE.RingGeometry(0.8, 1.1, 64);
        const innerCircleMaterial = new THREE.MeshBasicMaterial({
            color: this.parameters.colorAccent,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const innerCircle = new THREE.Mesh(innerCircleGeometry, innerCircleMaterial);
        innerCircle.rotation.x = Math.PI / 2;
        logoGroup.add(innerCircle);
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lineGeometry = new THREE.BufferGeometry();
            const linePoints = [0, 0, 0, Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0];
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: this.parameters.colorSecondary,
                transparent: true,
                opacity: 0.7,
                linewidth: 3
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.rotation.x = Math.PI / 2;
            logoGroup.add(line);
        }
        
        const centerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const centerMaterial = new THREE.MeshBasicMaterial({ color: this.parameters.colorLight });
        const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
        logoGroup.add(centerSphere);
        
        const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.parameters.colorAccent,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        logoGroup.add(glowSphere);
        
        logoGroup.position.z = -3;
        logoGroup.scale.set(0.01, 0.01, 0.01);
        
        this.objects.logo = logoGroup;
        this.scene.add(logoGroup);
    }
    
    createText() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 120px "Arial Black", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 12;
        ctx.strokeText('SENA', canvas.width / 2, canvas.height / 2 - 60);
        
        const gradient = ctx.createLinearGradient(0, canvas.height / 2 - 60, canvas.width, canvas.height / 2 - 60);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#8b0000');
        gradient.addColorStop(1, '#4b0082');
        
        ctx.fillStyle = gradient;
        ctx.fillText('SENA', canvas.width / 2, canvas.height / 2 - 60);
        
        ctx.font = 'bold 48px "Arial", sans-serif';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('3D EXPERIENCE', canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 6;
        ctx.strokeText('3D EXPERIENCE', canvas.width / 2, canvas.height / 2 + 60);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4, 2, 1);
        sprite.position.set(0, -1.5, -2);
        
        this.objects.titleText = sprite;
        this.scene.add(sprite);
    }
    
    setupEvents() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animateIn() {
        this.startTime = Date.now();
        
        const logoScale = { x: 0.01, y: 0.01, z: 0.01 };
        const logoTarget = { x: 1, y: 1, z: 1 };
        
        const animateLogo = () => {
            const progress = Math.min((Date.now() - this.startTime) / 1500, 1);
            const easeOutBack = 1 - Math.pow(1 - progress, 3) * (1 + 1.7 * (1 - progress));
            
            logoScale.x = 0.01 + (logoTarget.x - 0.01) * easeOutBack;
            logoScale.y = 0.01 + (logoTarget.y - 0.01) * easeOutBack;
            logoScale.z = 0.01 + (logoTarget.z - 0.01) * easeOutBack;
            
            if (this.objects.logo) {
                this.objects.logo.scale.set(logoScale.x, logoScale.y, logoScale.z);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateLogo);
            } else {
                const textStartTime = Date.now();
                const animateText = () => {
                    const textProgress = Math.min((Date.now() - textStartTime) / 1000, 1);
                    if (this.objects.titleText && this.objects.titleText.material) {
                        this.objects.titleText.material.opacity = textProgress;
                    }
                    if (textProgress < 1) requestAnimationFrame(animateText);
                };
                animateText();
            }
        };
        animateLogo();
        
        this.animateCursedLight();
        this.animateEnergyGroup();
    }
    
    animateCursedLight() {
        const lightStartTime = Date.now();
        const animate = () => {
            const time = (Date.now() - lightStartTime) / 2000;
            if (this.objects.cursedLight) {
                this.objects.cursedLight.intensity = 2 + Math.sin(time * Math.PI * 2) * 3;
            }
            if (!this.isComplete) requestAnimationFrame(animate);
        };
        animate();
    }
    
    animateEnergyGroup() {
        const energyStartTime = Date.now();
        const animate = () => {
            const time = (Date.now() - energyStartTime) / 10000;
            if (this.objects.energyGroup) {
                this.objects.energyGroup.rotation.y = time * Math.PI * 2;
            }
            if (!this.isComplete) requestAnimationFrame(animate);
        };
        animate();
    }
    
    animateOut(onComplete) {
        this.isComplete = true;
        
        const startTime = Date.now();
        const duration = 800;
        
        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const easeInBack = progress * progress * (1 + 0.7 * progress);
            
            if (this.objects.logo) {
                const scale = 1 - easeInBack * 0.99;
                this.objects.logo.scale.set(scale, scale, scale);
            }
            
            if (this.objects.titleText && this.objects.titleText.material) {
                this.objects.titleText.material.opacity = 1 - easeInBack;
            }
            
            if (this.camera) {
                this.camera.position.z = 5 + easeInBack * 10;
            }
            
            if (this.particles && this.particles.material) {
                this.particles.material.opacity = 1 - easeInBack;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        animate();
    }
    
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        
        this.targetMouse.lerp(this.mouse, 0.1);
        
        if (this.particles) {
            this.particles.rotation.x = this.targetMouse.y * 0.1;
            this.particles.rotation.y = this.targetMouse.x * 0.1;
        }
        
        if (this.objects.logo) {
            this.objects.logo.scale.x = this.objects.logo.scale.x + Math.sin(elapsedTime * 2) * 0.0002;
            this.objects.logo.scale.y = this.objects.logo.scale.y + Math.sin(elapsedTime * 2) * 0.0002;
        }
        
        this.animateParticles();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    startAnimationLoop() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            this.update();
            this.render();
        };
        animate();
    }
    
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    destroy() {
        this.stopAnimationLoop();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        if (this.scene) {
            this.scene.traverse((object) => {
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
                if (object.isPoints) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) object.material.dispose();
                }
                if (object.isLine) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) object.material.dispose();
                }
            });
        }
    }
}

export default JujutsuIntro;
