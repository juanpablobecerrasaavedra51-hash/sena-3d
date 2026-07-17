/**
 * Minimap.js - Sistema de minimapa
 * Muestra el mapa del campus y la posición del jugador
 */

export class Minimap {
    constructor(canvas, world, camera) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.world = world;
        this.camera = camera;
        
        this.size = 180;
        this.scale = 0.2; // Escala del mapa
        this.playerSize = 6;
        this.playerColor = '#00ffff';
        this.wallColor = '#666666';
        this.floorColor = '#444444';
        this.backgroundColor = '#0a0a1a';
        
        this.buildings = [];
        this.playerPosition = { x: 0, y: 0 };
        this.playerRotation = 0;
        
        this.init();
    }
    
    init() {
        // Configurar el canvas
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        // Dibujar el minimapa
        this.render();
        
        // Actualizar periódicamente
        this.startUpdateLoop();
    }
    
    // Agregar edificio al minimapa
    addBuilding(building) {
        this.buildings.push(building);
    }
    
    // Actualizar posición del jugador
    updatePlayerPosition(x, z, rotation) {
        this.playerPosition = { x, z };
        this.playerRotation = rotation;
    }
    
    // Dibujar el minimapa
    render() {
        // Limpiar el canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.size, this.size);
        
        // Dibujar el centro
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        
        // Dibujar edificios
        for (let i = 0; i < this.buildings.length; i++) {
            const building = this.buildings[i];
            this.drawBuilding(building, centerX, centerY);
        }
        
        // Dibujar el jugador
        this.drawPlayer(centerX, centerY);
        
        // Dibujar la brújula
        this.drawCompass(centerX, centerY);
    }
    
    // Dibujar un edificio
    drawBuilding(building, centerX, centerY) {
        // Por ahora dibujamos un rectángulo simple para cada edificio
        // En una implementación completa, se dibujarían las paredes, puertas, etc.
        
        const x = centerX + building.position.x * this.scale;
        const y = centerY + building.position.z * this.scale;
        const width = 40 * this.scale;
        const height = 30 * this.scale;
        
        this.ctx.fillStyle = this.wallColor;
        this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Dibujar el piso
        this.ctx.fillStyle = this.floorColor;
        this.ctx.fillRect(x - width / 2 + 2, y - height / 2 + 2, width - 4, height - 4);
    }
    
    // Dibujar el jugador
    drawPlayer(centerX, centerY) {
        const x = centerX + this.playerPosition.x * this.scale;
        const y = centerY + this.playerPosition.z * this.scale;
        
        // Dibujar el círculo del jugador
        this.ctx.fillStyle = this.playerColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.playerSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dibujar la línea de dirección
        const endX = x + Math.cos(this.playerRotation) * 15;
        const endY = y + Math.sin(this.playerRotation) * 15;
        
        this.ctx.strokeStyle = this.playerColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Dibujar el contorno
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.playerSize + 2, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    // Dibujar la brújula
    drawCompass(centerX, centerY) {
        const compassSize = 30;
        const compassX = centerX - compassSize / 2;
        const compassY = centerY - compassSize / 2;
        
        // Fondo de la brújula
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(compassX, compassY, compassSize, compassSize);
        
        // Líneas de la brújula
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        
        // Línea N-S
        this.ctx.beginPath();
        this.ctx.moveTo(compassX + compassSize / 2, compassY);
        this.ctx.lineTo(compassX + compassSize / 2, compassY + compassSize);
        this.ctx.stroke();
        
        // Línea E-W
        this.ctx.beginPath();
        this.ctx.moveTo(compassX, compassY + compassSize / 2);
        this.ctx.lineTo(compassX + compassSize, compassY + compassSize / 2);
        this.ctx.stroke();
        
        // Letras de la brújula
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText('N', compassX + compassSize / 2, compassY + 5);
        this.ctx.fillText('S', compassX + compassSize / 2, compassY + compassSize - 5);
        this.ctx.fillText('E', compassX + compassSize - 5, compassY + compassSize / 2);
        this.ctx.fillText('W', compassX + 5, compassY + compassSize / 2);
    }
    
    // Iniciar el loop de actualización
    startUpdateLoop() {
        const update = () => {
            this.update();
            requestAnimationFrame(update);
        };
        update();
    }
    
    // Actualizar el minimapa
    update() {
        if (this.camera) {
            // Actualizar posición y rotación del jugador
            this.updatePlayerPosition(
                this.camera.position.x,
                this.camera.position.z,
                this.camera.rotation.y
            );
        }
        
        // Redibujar el minimapa
        this.render();
    }
    
    // Redimensionar el minimapa
    resize(size) {
        this.size = size;
        this.canvas.width = size;
        this.canvas.height = size;
        this.render();
    }
    
    // Limpiar recursos
    dispose() {
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.size, this.size);
    }
}

export default Minimap;
