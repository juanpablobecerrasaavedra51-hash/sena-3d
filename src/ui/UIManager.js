/**
 * UIManager.js - Gestor de interfaz de usuario
 * UI moderna con paneles, diálogos y controles
 */

export class UIManager {
    constructor(container) {
        this.container = container;
        this.dialogs = [];
        this.panels = {};
        this.notifications = [];
        this.settings = {
            showCrosshair: true,
            showMinimap: true,
            showControls: true,
            showStatus: true,
            volume: 0.8,
            vrEnabled: false
        };
        
        this.init();
    }
    
    init() {
        this.createLoadingScreen();
        this.createMainUI();
        this.createDialogSystem();
        this.createNotificationSystem();
        this.createSettingsPanel();
        this.createVRPanel();
        this.setupEventListeners();
    }
    
    // Crear pantalla de carga
    createLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-logo">
                    <div class="loading-logo-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                </div>
                <div class="loading-bar-container">
                    <div class="loading-bar" id="loading-bar"></div>
                </div>
                <div id="loading-text">Cargando Campus SENA...</div>
                <div class="loading-tips" id="loading-tips">
                    Consejos: Usa WASD para moverte, Mouse para mirar
                </div>
            </div>
        `;
        
        this.container.appendChild(loadingScreen);
        this.panels.loadingScreen = loadingScreen;
    }
    
    // Crear UI principal
    createMainUI() {
        // Contenedor de UI
        const uiOverlay = document.createElement('div');
        uiOverlay.id = 'ui-overlay';
        uiOverlay.className = 'ui-overlay';
        
        // Panel de controles
        uiOverlay.innerHTML = `
            <div id="controls-panel" class="panel">
                <h3><i class="fas fa-gamepad"></i> Controles</h3>
                <div class="ctrl-grid">
                    <span class="ctrl-key">W</span><span class="ctrl-desc">Adelante</span>
                    <span class="ctrl-key">S</span><span class="ctrl-desc">Atrás</span>
                    <span class="ctrl-key">A</span><span class="ctrl-desc">Izquierda</span>
                    <span class="ctrl-key">D</span><span class="ctrl-desc">Derecha</span>
                    <span class="ctrl-key">Shift</span><span class="ctrl-desc">Correr</span>
                    <span class="ctrl-key">Espacio</span><span class="ctrl-desc">Saltar</span>
                    <span class="ctrl-key">C</span><span class="ctrl-desc">Agacharse</span>
                    <span class="ctrl-key">E</span><span class="ctrl-desc">Interactuar</span>
                    <span class="ctrl-key">M</span><span class="ctrl-desc">Silenciar</span>
                    <span class="ctrl-key">N</span><span class="ctrl-desc">Clima</span>
                    <span class="ctrl-key">T</span><span class="ctrl-desc">Tour</span>
                    <span class="ctrl-key">V</span><span class="ctrl-desc">VR</span>
                    <span class="ctrl-key">Esc</span><span class="ctrl-desc">Menú</span>
                </div>
            </div>
            
            <div id="room-panel" class="panel">
                <h3><i class="fas fa-map-marker-alt"></i> Ubicación</h3>
                <div id="room-name">Campus SENA</div>
                <div id="room-info">Manizales - Colombia</div>
            </div>
            
            <div id="status-bar" class="panel">
                <span id="mute-indicator" class="status-icon">🔊</span>
                <span id="weather-indicator" class="status-icon">☀️</span>
                <span id="time-indicator" class="status-icon">🌞</span>
                <span id="coords">X: 0 · Z: 0 · Y: 0</span>
                <span class="fps" id="fps">FPS: --</span>
            </div>
            
            <div id="interaction-hint" class="hint-panel">
                <i class="fas fa-hand-pointer"></i> Presiona <strong>E</strong> para interactuar
            </div>
            
            <div id="objective-panel" class="panel objective-panel">
                <h3><i class="fas fa-bullseye"></i> Objetivo</h3>
                <div id="objective-text">Explora el campus y descubre todos los secretos</div>
            </div>
        `;
        
        this.container.appendChild(uiOverlay);
        this.panels.uiOverlay = uiOverlay;
        
        // Crosshair
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.className = 'crosshair';
        crosshair.innerHTML = `
            <div class="crosshair-line horizontal"></div>
            <div class="crosshair-line vertical"></div>
            <div class="crosshair-dot"></div>
        `;
        this.container.appendChild(crosshair);
        this.panels.crosshair = crosshair;
        
        // Minimap
        const minimapContainer = document.createElement('div');
        minimapContainer.className = 'minimap-container';
        minimapContainer.innerHTML = `
            <canvas id="minimap"></canvas>
            <div class="minimap-compass">
                <span>N</span>
                <span>E</span>
                <span>S</span>
                <span>W</span>
            </div>
        `;
        this.container.appendChild(minimapContainer);
        this.panels.minimap = minimapContainer;
    }
    
    // Crear sistema de diálogos
    createDialogSystem() {
        const dialogContainer = document.createElement('div');
        dialogContainer.id = 'dialog-container';
        dialogContainer.className = 'dialog-container';
        dialogContainer.style.display = 'none';
        
        dialogContainer.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-header">
                    <span class="dialog-title" id="dialog-title">NPC</span>
                    <button class="dialog-close" id="dialog-close">&times;</button>
                </div>
                <div class="dialog-content">
                    <div class="dialog-avatar" id="dialog-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="dialog-message" id="dialog-message">
                        Hola, ¿en qué puedo ayudarte?
                    </div>
                </div>
                <div class="dialog-options" id="dialog-options"></div>
            </div>
        `;
        
        this.container.appendChild(dialogContainer);
        this.panels.dialog = dialogContainer;
        
        // Evento para cerrar diálogo
        document.getElementById('dialog-close').addEventListener('click', () => {
            this.hideDialog();
        });
    }
    
    // Crear sistema de notificaciones
    createNotificationSystem() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        
        this.container.appendChild(notificationContainer);
        this.panels.notificationContainer = notificationContainer;
    }
    
    // Crear panel de configuración
    createSettingsPanel() {
        const settingsPanel = document.createElement('div');
        settingsPanel.id = 'settings-panel';
        settingsPanel.className = 'settings-panel';
        settingsPanel.style.display = 'none';
        
        settingsPanel.innerHTML = `
            <div class="settings-header">
                <h2><i class="fas fa-cog"></i> Configuración</h2>
                <button class="settings-close" id="settings-close">&times;</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3><i class="fas fa-volume-up"></i> Sonido</h3>
                    <div class="setting-item">
                        <label>Volumen</label>
                        <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.8">
                        <span id="volume-value">80%</span>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3><i class="fas fa-eye"></i> Visual</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="crosshair-toggle" checked>
                            Mostrar Crosshair
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="minimap-toggle" checked>
                            Mostrar Minimapa
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="controls-toggle" checked>
                            Mostrar Controles
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3><i class="fas fa-mouse-pointer"></i> Controles</h3>
                    <div class="setting-item">
                        <label>Sensibilidad del Mouse</label>
                        <input type="range" id="mouse-sensitivity" min="0.1" max="2" step="0.1" value="1">
                    </div>
                </div>
                
                <button class="settings-save" id="settings-save">Guardar</button>
            </div>
        `;
        
        this.container.appendChild(settingsPanel);
        this.panels.settings = settingsPanel;
        
        // Eventos
        document.getElementById('settings-close').addEventListener('click', () => {
            this.toggleSettings();
        });
        
        document.getElementById('settings-save').addEventListener('click', () => {
            this.saveSettings();
            this.toggleSettings();
        });
        
        // Eventos de los controles
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.settings.volume = volume;
            document.getElementById('volume-value').textContent = `${Math.round(volume * 100)}%`;
        });
        
        document.getElementById('crosshair-toggle').addEventListener('change', (e) => {
            this.settings.showCrosshair = e.target.checked;
            this.updateCrosshair();
        });
        
        document.getElementById('minimap-toggle').addEventListener('change', (e) => {
            this.settings.showMinimap = e.target.checked;
            this.updateMinimap();
        });
        
        document.getElementById('controls-toggle').addEventListener('change', (e) => {
            this.settings.showControls = e.target.checked;
            this.updateControls();
        });
    }
    
    // Crear panel de VR
    createVRPanel() {
        const vrPanel = document.createElement('div');
        vrPanel.id = 'vr-panel';
        vrPanel.className = 'vr-panel';
        vrPanel.style.display = 'none';
        
        vrPanel.innerHTML = `
            <div class="vr-header">
                <h2><i class="fas fa-vr-cardboard"></i> Realidad Virtual</h2>
                <button class="vr-close" id="vr-close">&times;</button>
            </div>
            <div class="vr-content">
                <div class="vr-info">
                    <p>Conecta tu dispositivo VR para una experiencia inmersiva completa.</p>
                </div>
                <div class="vr-controls">
                    <h3>Controles VR</h3>
                    <ul>
                        <li><strong>Trigger:</strong> Interactuar / Agarrar</li>
                        <li><strong>Grip:</strong> Mover objetos</li>
                        <li><strong>Joystick:</strong> Moverse</li>
                        <li><strong>Botón A/X:</strong> Saltar</li>
                        <li><strong>Botón B/Y:</strong> Correr</li>
                    </ul>
                </div>
                <button class="vr-start" id="vr-start">Iniciar VR</button>
            </div>
        `;
        
        this.container.appendChild(vrPanel);
        this.panels.vr = vrPanel;
        
        // Eventos
        document.getElementById('vr-close').addEventListener('click', () => {
            this.toggleVRPanel();
        });
        
        document.getElementById('vr-start').addEventListener('click', () => {
            this.startVR();
        });
    }
    
    // Configurar eventos
    setupEventListeners() {
        // Evento para mostrar diálogo
        window.addEventListener('npc-dialog', (e) => {
            this.showDialog(e.detail.npc, e.detail.message);
        });
        
        // Evento para mostrar notificación
        window.addEventListener('show-notification', (e) => {
            this.showNotification(e.detail.message, e.detail.type);
        });
        
        // Evento para actualizar ubicación
        window.addEventListener('update-location', (e) => {
            this.updateLocation(e.detail.room, e.detail.info);
        });
        
        // Evento para actualizar coordenadas
        window.addEventListener('update-coords', (e) => {
            this.updateCoords(e.detail.x, e.detail.y, e.detail.z);
        });
        
        // Evento para actualizar FPS
        window.addEventListener('update-fps', (e) => {
            this.updateFPS(e.detail.fps);
        });
        
        // Evento para actualizar clima
        window.addEventListener('update-weather', (e) => {
            this.updateWeather(e.detail.weather);
        });
        
        // Evento para actualizar hora
        window.addEventListener('update-time', (e) => {
            this.updateTime(e.detail.time);
        });
        
        // Evento para mostrar hint de interacción
        window.addEventListener('show-interaction-hint', (e) => {
            this.showInteractionHint(e.detail.show);
        });
        
        // Evento para actualizar objetivo
        window.addEventListener('update-objective', (e) => {
            this.updateObjective(e.detail.text);
        });
        
        // Evento para mostrar menú de VR
        window.addEventListener('vr-enabled', (e) => {
            this.settings.vrEnabled = true;
            this.updateVRStatus();
        });
        
        window.addEventListener('vr-disabled', (e) => {
            this.settings.vrEnabled = false;
            this.updateVRStatus();
        });
        
        // Tecla ESC para abrir/cerrar menú
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.panels.settings.style.display === 'block') {
                    this.toggleSettings();
                } else if (this.panels.dialog.style.display === 'block') {
                    this.hideDialog();
                } else {
                    this.toggleSettings();
                }
            }
            
            // Tecla V para abrir panel de VR
            if (e.code === 'KeyV') {
                this.toggleVRPanel();
            }
        });
    }
    
    // Mostrar diálogo
    showDialog(npc, message) {
        const dialog = this.panels.dialog;
        if (!dialog) return;
        
        // Configurar el diálogo
        const title = document.getElementById('dialog-title');
        const avatar = document.getElementById('dialog-avatar');
        const messageEl = document.getElementById('dialog-message');
        
        if (npc) {
            title.textContent = npc.options.type === 'teacher' ? 'Profesor' : 
                               npc.options.type === 'student' ? 'Estudiante' : 'Personal';
            
            // Icono según el tipo
            avatar.innerHTML = npc.options.type === 'teacher' ? 
                '<i class="fas fa-chalkboard-teacher"></i>' :
                npc.options.type === 'student' ? 
                '<i class="fas fa-user-graduate"></i>' :
                '<i class="fas fa-user-tie"></i>';
        }
        
        messageEl.textContent = message;
        
        // Mostrar el diálogo
        dialog.style.display = 'block';
        
        // Enfocar el diálogo
        setTimeout(() => {
            dialog.querySelector('.dialog-box').classList.add('visible');
        }, 10);
    }
    
    // Ocultar diálogo
    hideDialog() {
        const dialog = this.panels.dialog;
        if (!dialog) return;
        
        dialog.querySelector('.dialog-box').classList.remove('visible');
        
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
    }
    
    // Mostrar notificación
    showNotification(message, type = 'info') {
        const container = this.panels.notificationContainer;
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        this.notifications.push(notification);
        
        // Eliminar notificación después de 5 segundos
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }
    
    // Eliminar notificación
    removeNotification(notification) {
        const container = this.panels.notificationContainer;
        if (!container) return;
        
        notification.classList.add('hiding');
        
        setTimeout(() => {
            container.removeChild(notification);
            const index = this.notifications.indexOf(notification);
            if (index !== -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    // Actualizar ubicación
    updateLocation(room, info) {
        const roomName = document.getElementById('room-name');
        const roomInfo = document.getElementById('room-info');
        
        if (roomName) roomName.textContent = room || 'Campus SENA';
        if (roomInfo) roomInfo.textContent = info || 'Manizales - Colombia';
    }
    
    // Actualizar coordenadas
    updateCoords(x, y, z) {
        const coords = document.getElementById('coords');
        if (coords) {
            coords.textContent = `X: ${x.toFixed(1)} · Z: ${z.toFixed(1)} · Y: ${y.toFixed(1)}`;
        }
    }
    
    // Actualizar FPS
    updateFPS(fps) {
        const fpsEl = document.getElementById('fps');
        if (fpsEl) {
            fpsEl.textContent = `FPS: ${fps}`;
            
            // Cambiar color según el FPS
            if (fps < 30) {
                fpsEl.style.color = '#ff4444';
            } else if (fps < 45) {
                fpsEl.style.color = '#ffaa44';
            } else {
                fpsEl.style.color = '#44ff44';
            }
        }
    }
    
    // Actualizar clima
    updateWeather(weather) {
        const weatherIndicator = document.getElementById('weather-indicator');
        if (!weatherIndicator) return;
        
        let icon, color;
        switch (weather) {
            case 'rain':
                icon = '🌧️';
                color = '#4682b4';
                break;
            case 'fog':
                icon = '🌫️';
                color = '#999999';
                break;
            case 'storm':
                icon = '⛈️';
                color = '#4b0082';
                break;
            default:
                icon = '☀️';
                color = '#88ff99';
        }
        
        weatherIndicator.textContent = icon;
        weatherIndicator.style.color = color;
    }
    
    // Actualizar hora
    updateTime(time) {
        const timeIndicator = document.getElementById('time-indicator');
        if (!timeIndicator) return;
        
        let icon, text;
        if (time < 0.25) {
            icon = '🌙';
            text = 'Noche';
        } else if (time < 0.5) {
            icon = '🌅';
            text = 'Amanecer';
        } else if (time < 0.75) {
            icon = '☀️';
            text = 'Día';
        } else {
            icon = '🌇';
            text = 'Atardecer';
        }
        
        timeIndicator.textContent = icon;
        timeIndicator.title = text;
    }
    
    // Mostrar hint de interacción
    showInteractionHint(show) {
        const hint = document.getElementById('interaction-hint');
        if (!hint) return;
        
        if (show) {
            hint.classList.add('visible');
        } else {
            hint.classList.remove('visible');
        }
    }
    
    // Actualizar objetivo
    updateObjective(text) {
        const objectiveText = document.getElementById('objective-text');
        if (objectiveText) {
            objectiveText.textContent = text;
        }
    }
    
    // Alternar configuración
    toggleSettings() {
        const settings = this.panels.settings;
        if (!settings) return;
        
        if (settings.style.display === 'block') {
            settings.style.display = 'none';
        } else {
            settings.style.display = 'block';
        }
    }
    
    // Alternar panel de VR
    toggleVRPanel() {
        const vrPanel = this.panels.vr;
        if (!vrPanel) return;
        
        if (vrPanel.style.display === 'block') {
            vrPanel.style.display = 'none';
        } else {
            vrPanel.style.display = 'block';
        }
    }
    
    // Guardar configuración
    saveSettings() {
        // Guardar en localStorage
        localStorage.setItem('sena3d-settings', JSON.stringify(this.settings));
        
        // Aplicar configuraciones
        this.applySettings();
        
        // Mostrar notificación
        this.showNotification('Configuración guardada', 'success');
    }
    
    // Aplicar configuración
    applySettings() {
        this.updateCrosshair();
        this.updateMinimap();
        this.updateControls();
        this.updateVRStatus();
    }
    
    // Actualizar crosshair
    updateCrosshair() {
        const crosshair = this.panels.crosshair;
        if (!crosshair) return;
        
        if (this.settings.showCrosshair) {
            crosshair.classList.add('visible');
        } else {
            crosshair.classList.remove('visible');
        }
    }
    
    // Actualizar minimap
    updateMinimap() {
        const minimap = this.panels.minimap;
        if (!minimap) return;
        
        if (this.settings.showMinimap) {
            minimap.classList.add('visible');
        } else {
            minimap.classList.remove('visible');
        }
    }
    
    // Actualizar controles
    updateControls() {
        const controlsPanel = document.getElementById('controls-panel');
        if (!controlsPanel) return;
        
        if (this.settings.showControls) {
            controlsPanel.classList.add('visible');
        } else {
            controlsPanel.classList.remove('visible');
        }
    }
    
    // Actualizar estado de VR
    updateVRStatus() {
        const vrButton = document.querySelector('.vr-start');
        if (!vrButton) return;
        
        if (this.settings.vrEnabled) {
            vrButton.textContent = 'Salir de VR';
            vrButton.classList.add('active');
        } else {
            vrButton.textContent = 'Iniciar VR';
            vrButton.classList.remove('active');
        }
    }
    
    // Iniciar VR
    startVR() {
        window.dispatchEvent(new CustomEvent('start-vr'));
    }
    
    // Mostrar pantalla de carga
    showLoadingScreen() {
        const loadingScreen = this.panels.loadingScreen;
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }
    
    // Ocultar pantalla de carga
    hideLoadingScreen() {
        const loadingScreen = this.panels.loadingScreen;
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
    
    // Actualizar barra de carga
    updateLoadingProgress(progress) {
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.style.width = `${progress * 100}%`;
        }
        
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            if (progress < 0.3) {
                loadingText.textContent = 'Cargando texturas...';
            } else if (progress < 0.6) {
                loadingText.textContent = 'Cargando modelos...';
            } else if (progress < 0.9) {
                loadingText.textContent = 'Inicializando mundo...';
            } else {
                loadingText.textContent = 'Listo para explorar!';
            }
        }
    }
    
    // Mostrar mensaje de error
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // Mostrar mensaje de éxito
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    // Mostrar mensaje de advertencia
    showWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    // Limpiar recursos
    dispose() {
        // Limpiar diálogos
        this.hideDialog();
        
        // Limpiar notificaciones
        for (let i = 0; i < this.notifications.length; i++) {
            this.removeNotification(this.notifications[i]);
        }
        
        // Limpiar paneles
        for (const key in this.panels) {
            if (this.panels[key] && this.panels[key].parentNode) {
                this.panels[key].parentNode.removeChild(this.panels[key]);
            }
        }
    }
}

export default UIManager;
