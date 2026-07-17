/**
 * Utils.js - Funciones utilitarias
 * Funciones matemáticas, de conversión y helpers
 */

import * as THREE from 'three';

export class Utils {
    // Clamp un valor entre min y max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Lerp (Linear Interpolation)
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    // Convertir grados a radianes
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Convertir radianes a grados
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Generar un ID único
    static generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Generar un color aleatorio
    static randomColor() {
        return Math.random() * 0xffffff;
    }
    
    // Generar un color aleatorio en formato hex
    static randomHexColor() {
        return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    }
    
    // Convertir color hex a THREE.Color
    static hexToColor(hex) {
        return new THREE.Color(hex);
    }
    
    // Convertir RGB a hex
    static rgbToHex(r, g, b) {
        return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    // Formatear número
    static formatNumber(num, decimals = 2) {
        return num.toFixed(decimals);
    }
    
    // Formatear tiempo (segundos a HH:MM:SS)
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return [hours, minutes, secs]
            .map(v => v.toString().padStart(2, '0'))
            .join(':');
    }
    
    // Formatear distancia
    static formatDistance(meters) {
        if (meters < 1000) {
            return `${meters.toFixed(1)} m`;
        } else {
            return `${(meters / 1000).toFixed(2)} km`;
        }
    }
    
    // Verificar si un punto está dentro de un círculo
    static pointInCircle(px, pz, cx, cz, radius) {
        const dx = px - cx;
        const dz = pz - cz;
        return dx * dx + dz * dz <= radius * radius;
    }
    
    // Verificar si un punto está dentro de un rectángulo
    static pointInRect(px, pz, rx, rz, rw, rh) {
        return px >= rx && px <= rx + rw && pz >= rz && pz <= rz + rh;
    }
    
    // Calcular distancia entre dos puntos 2D
    static distance2D(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    // Calcular distancia entre dos puntos 3D
    static distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Normalizar un ángulo a [0, 2PI]
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
    
    // Calcular el ángulo entre dos puntos
    static angleBetween(x1, z1, x2, z2) {
        return Math.atan2(z2 - z1, x2 - x1);
    }
    
    // Suavizar un valor (smoothing)
    static smooth(value, target, smoothing) {
        return value + (target - value) * smoothing;
    }
    
    // Easing functions
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    static easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    
    static easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
    
    // Generar ruido Perlin simple (simplificado)
    static noise2D(x, y) {
        const n = x + y * 57;
        let result = (n << 13) ^ n;
        return (1.0 - ((result * (result * result * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
    }
    
    // Generar ruido Perlin suave
    static smoothNoise2D(x, y) {
        const corners = (this.noise2D(x - 1, y - 1) + this.noise2D(x + 1, y - 1) + 
                        this.noise2D(x - 1, y + 1) + this.noise2D(x + 1, y + 1)) / 16;
        const sides = (this.noise2D(x - 1, y) + this.noise2D(x + 1, y) + 
                       this.noise2D(x, y - 1) + this.noise2D(x, y + 1)) / 8;
        const center = this.noise2D(x, y) / 4;
        
        return corners + sides + center;
    }
    
    // Interpolación de ruido
    static interpolatedNoise2D(x, y) {
        const integerX = Math.floor(x);
        const fractionalX = x - integerX;
        
        const integerY = Math.floor(y);
        const fractionalY = y - integerY;
        
        const v1 = this.smoothNoise2D(integerX, integerY);
        const v2 = this.smoothNoise2D(integerX + 1, integerY);
        const v3 = this.smoothNoise2D(integerX, integerY + 1);
        const v4 = this.smoothNoise2D(integerX + 1, integerY + 1);
        
        const i1 = this.lerp(v1, v2, fractionalX);
        const i2 = this.lerp(v3, v4, fractionalX);
        
        return this.lerp(i1, i2, fractionalY);
    }
    
    // Generar terreno con ruido Perlin
    static generateTerrain(width, height, scale = 0.1) {
        const terrain = [];
        
        for (let x = 0; x < width; x++) {
            terrain[x] = [];
            for (let y = 0; y < height; y++) {
                terrain[x][y] = this.interpolatedNoise2D(x * scale, y * scale);
            }
        }
        
        return terrain;
    }
    
    // Cargar textura
    static loadTexture(path) {
        return new Promise((resolve, reject) => {
            const texture = new THREE.TextureLoader().load(
                path,
                resolve,
                undefined,
                reject
            );
        });
    }
    
    // Cargar modelo GLTF
    static loadGLTF(path, dracoPath = null) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            
            if (dracoPath) {
                const dracoLoader = new THREE.DRACOLoader();
                dracoLoader.setDecoderPath(dracoPath);
                loader.setDRACOLoader(dracoLoader);
            }
            
            loader.load(
                path,
                resolve,
                undefined,
                reject
            );
        });
    }
    
    // Cargar sonido
    static loadAudio(path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            audio.addEventListener('canplay', () => resolve(audio));
            audio.addEventListener('error', reject);
            audio.load();
        });
    }
    
    // Reproducir sonido
    static playSound(audio, volume = 1, loop = false) {
        audio.volume = volume;
        audio.loop = loop;
        audio.currentTime = 0;
        audio.play().catch(e => console.error('Error al reproducir sonido:', e));
    }
    
    // Detener sonido
    static stopSound(audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    // Formatear bytes
    static formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    
    // Formatear fecha
    static formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
    
    // Generar nombre aleatorio
    static randomName(type = 'student') {
        const firstNames = {
            male: ['Juan', 'Carlos', 'Luis', 'Pedro', 'Miguel', 'Alejandro', 'Jorge', 'Daniel'],
            female: ['María', 'Ana', 'Laura', 'Sofía', 'Lucía', 'Valentina', 'Camila', 'Isabella']
        };
        
        const lastNames = ['Pérez', 'Gómez', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Díaz', 'Hernández'];
        
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // Generar mensaje aleatorio para NPC
    static randomNPCMessage(type) {
        const messages = {
            student: [
                "¡Hola! ¿Sabes dónde es el salón 101?",
                "Estoy estudiando para el examen de Three.js",
                "¿Has visto mi cuaderno?",
                "El profesor explicó algo interesante hoy",
                "¿Me puedes ayudar con este ejercicio?",
                "Estoy buscando a mi compañero de proyecto",
                "¿Sabes a qué hora es el descanso?",
                "El campus es muy grande, ¿verdad?"
            ],
            teacher: [
                "Bienvenido al campus SENA. ¿En qué puedo ayudarte?",
                "Recuerda: la práctica hace al maestro",
                "¿Tienes alguna pregunta sobre la clase?",
                "El conocimiento es poder",
                "No olvides entregar la tarea a tiempo",
                "¿Has entendido el tema de hoy?",
                "La tecnología avanza rápido, mantente actualizado",
                "El trabajo en equipo es fundamental"
            ],
            staff: [
                "¿Necesitas ayuda para encontrar algo?",
                "El campus está limpio gracias a nuestro trabajo",
                "¿Buscas a alguien en particular?",
                "Mantengamos el orden en el campus",
                "¿Sabes dónde está la oficina de admisiones?",
                "El horario de atención es de 8am a 5pm",
                "¿Necesitas información sobre algún trámite?",
                "El campus tiene más de 10 edificios"
            ]
        };
        
        return messages[type][Math.floor(Math.random() * messages[type].length)];
    }
    
    // Verificar si el dispositivo es móvil
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Verificar si el navegador soporta WebXR
    static supportsWebXR() {
        return 'xr' in navigator;
    }
    
    // Verificar si el navegador soporta WebGL
    static supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }
    
    // Obtener parámetros de la URL
    static getUrlParams() {
        const params = {};
        const query = window.location.search.substring(1);
        const vars = query.split('&');
        
        for (let pair of vars) {
            const [key, value] = pair.split('=');
            params[key] = decodeURIComponent(value || '');
        }
        
        return params;
    }
    
    // Establecer parámetros en la URL
    static setUrlParams(params) {
        const query = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        window.history.pushState({}, '', `?${query}`);
    }
    
    // Guardar en localStorage
    static saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
            return false;
        }
    }
    
    // Cargar de localStorage
    static loadFromStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error al cargar de localStorage:', e);
            return defaultValue;
        }
    }
    
    // Eliminar de localStorage
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error al eliminar de localStorage:', e);
            return false;
        }
    }
    
    // Limpiar localStorage
    static clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error al limpiar localStorage:', e);
            return false;
        }
    }
}

export default Utils;
