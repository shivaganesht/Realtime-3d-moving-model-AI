/**
 * NEXUS Main Application Controller
 * Integrates particle system with hand tracking gestures
 * @author Shiva
 */

class App {
    constructor() {
        this.particleSystem = null;
        this.handTracker = null;
        this.lastGesture = null;
        this.gestureHoldTime = 0;
        this.gestureThreshold = 400;
        this.colorChangeDebounce = 0;
        this.shapeChangeDebounce = 0;
        this.burstDebounce = 0;
        this.currentActiveGesture = null;
        
        this.init();
    }
    
    async init() {
        // Initialize particle system
        const container = document.getElementById('container');
        this.particleSystem = new ParticleSystem(container);
        
        // Setup UI controls
        this.setupControls();
        
        // Initialize hand tracking
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas-overlay');
        
        try {
            this.handTracker = new HandTracker(video, canvas, (data) => {
                this.handleHandData(data);
            });
            
            // Hide loading screen after initialization
            setTimeout(() => {
                const loading = document.getElementById('loading');
                loading.style.opacity = '0';
                loading.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
                this.updateStatus('SYSTEM ONLINE', true);
            }, 2500);
            
        } catch (error) {
            console.error('Failed to initialize hand tracking:', error);
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center;">
                    <p style="color: #ff4444; font-family: Orbitron; font-size: 18px; letter-spacing: 3px;">CAMERA ACCESS DENIED</p>
                    <p style="margin-top: 20px; color: rgba(255,255,255,0.5);">Please allow camera access and refresh the page</p>
                </div>
            `;
        }
    }
    
    setupControls() {
        // Shape buttons
        document.querySelectorAll('[data-shape]').forEach(btn => {
            btn.addEventListener('click', () => {
                const shape = btn.dataset.shape;
                this.particleSystem.setShape(shape);
                
                document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updateStatus(`SHAPE: ${shape.toUpperCase()}`, true);
            });
        });
        
        // Color buttons
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                this.particleSystem.setColorTheme(color);
                
                document.querySelectorAll('[data-color]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updateStatus(`THEME: ${color.toUpperCase()}`, true);
            });
        });
    }
    
    handleHandData(data) {
        if (!data.handDetected) {
            this.lastGesture = null;
            this.gestureHoldTime = 0;
            this.clearActiveGesture();
            this.updateStatus('AWAITING HAND INPUT...', false);
            return;
        }
        
        // Update particle position based on hand position
        if (data.position) {
            this.particleSystem.updateHandPosition(data.position.x, data.position.y);
        }
        
        const currentTime = Date.now();
        const gesture = data.gesture;
        
        // Track gesture hold time
        if (gesture === this.lastGesture) {
            this.gestureHoldTime += 16;
        } else {
            this.lastGesture = gesture;
            this.gestureHoldTime = 0;
        }
        
        // Update active gesture in UI
        this.setActiveGesture(gesture);
        
        // Apply gesture effects
        switch (gesture) {
            case 'fist':
                this.particleSystem.setExpansion(0.2);
                this.updateStatus('✊ COMPRESSING FIELD', true);
                break;
                
            case 'palm':
                this.particleSystem.setExpansion(1.8);
                this.updateStatus('🖐️ EXPANDING FIELD', true);
                break;
                
            case 'point':
                // Change color after holding
                if (this.gestureHoldTime > this.gestureThreshold && 
                    currentTime - this.colorChangeDebounce > 1200) {
                    const newColor = this.particleSystem.nextColor();
                    this.updateButtonState('[data-color]', newColor);
                    this.updateStatus(`☝️ THEME: ${newColor.toUpperCase()}`, true);
                    this.colorChangeDebounce = currentTime;
                    this.showGestureEffect('🎨', 'COLOR SHIFT');
                } else {
                    this.updateStatus('☝️ HOLD TO CHANGE COLOR', true);
                }
                break;
                
            case 'peace':
                // Change shape after holding
                if (this.gestureHoldTime > this.gestureThreshold && 
                    currentTime - this.shapeChangeDebounce > 1200) {
                    const newShape = this.particleSystem.nextShape();
                    this.updateButtonState('[data-shape]', newShape);
                    this.updateStatus(`✌️ SHAPE: ${newShape.toUpperCase()}`, true);
                    this.shapeChangeDebounce = currentTime;
                } else {
                    this.updateStatus('✌️ HOLD TO MORPH', true);
                }
                break;
                
            case 'thumbsup':
                // Trigger burst
                if (this.gestureHoldTime > 200 && 
                    currentTime - this.burstDebounce > 1500) {
                    this.particleSystem.triggerBurst();
                    this.updateStatus('👍 PARTICLE EXPLOSION!', true);
                    this.showGestureEffect('💥', 'BURST');
                    this.burstDebounce = currentTime;
                } else {
                    this.updateStatus('👍 THUMBS UP DETECTED', true);
                }
                break;
                
            case 'thumbsdown':
                this.particleSystem.setExpansion(0.5);
                this.updateStatus('👎 REDUCING FIELD', true);
                break;
                
            case 'rock':
                // Chaos mode
                if (this.gestureHoldTime > 300) {
                    this.particleSystem.triggerChaos();
                    this.updateStatus('🤘 CHAOS MODE ACTIVE!', true);
                    this.showGestureEffect('🤘', 'CHAOS');
                }
                break;
                
            case 'spiderman':
                // Web effect
                if (this.gestureHoldTime > 300) {
                    this.particleSystem.triggerWeb();
                    this.updateStatus('🕷️ WEB EFFECT!', true);
                    this.showGestureEffect('🕸️', 'WEB');
                }
                break;
                
            case 'ok':
                this.particleSystem.setExpansion(1.0);
                this.updateStatus('👌 FIELD STABILIZED', true);
                break;
                
            default:
                this.particleSystem.setExpansion(1);
                this.updateStatus('TRACKING ACTIVE', true);
                break;
        }
        
        // Update hand openness for rotation speed
        if (data.landmarks) {
            const openness = this.handTracker.getHandOpenness(data.landmarks);
            this.particleSystem.rotationSpeed = 0.001 + openness * 0.008;
        }
    }
    
    setActiveGesture(gesture) {
        if (this.currentActiveGesture !== gesture) {
            // Remove previous active class
            document.querySelectorAll('.gesture-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to current gesture
            const activeItem = document.querySelector(`.gesture-item[data-gesture="${gesture}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
            
            this.currentActiveGesture = gesture;
        }
    }
    
    clearActiveGesture() {
        document.querySelectorAll('.gesture-item').forEach(item => {
            item.classList.remove('active');
        });
        this.currentActiveGesture = null;
    }
    
    showGestureEffect(emoji, text) {
        const gestureEl = document.getElementById('current-gesture');
        const labelEl = document.getElementById('gesture-label');
        
        gestureEl.textContent = emoji;
        labelEl.textContent = text;
        gestureEl.classList.add('show');
        labelEl.classList.add('show');
        
        setTimeout(() => {
            gestureEl.classList.remove('show');
            labelEl.classList.remove('show');
        }, 1000);
    }
    
    updateButtonState(selector, value) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.shape === value || btn.dataset.color === value) {
                btn.classList.add('active');
            }
        });
    }
    
    updateStatus(message, isActive) {
        const statusEl = document.getElementById('status');
        const indicatorEl = document.getElementById('status-indicator');
        
        statusEl.textContent = message;
        
        if (isActive) {
            indicatorEl.classList.remove('warning');
        } else {
            indicatorEl.classList.add('warning');
        }
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
