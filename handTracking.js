/**
 * Advanced Hand Tracking System using MediaPipe Hands
 * Enhanced gesture detection with improved accuracy
 * @author Shiva Ganesh
 */

class HandTracker {
    constructor(videoElement, canvasElement, onResults) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.onResultsCallback = onResults;
        this.hands = null;
        this.camera = null;
        this.lastGesture = null;
        this.gestureDebounce = 0;
        this.handDetected = false;
        this.gestureHistory = [];
        this.historyLength = 5;
        
        this.init();
    }
    
    async init() {
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
        
        this.hands.onResults((results) => this.processResults(results));
        
        // Start camera
        await this.startCamera();
    }
    
    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.detectFrame();
            };
            
            return true;
        } catch (error) {
            console.error('Camera access denied:', error);
            return false;
        }
    }
    
    async detectFrame() {
        if (this.video.readyState >= 2) {
            await this.hands.send({ image: this.video });
        }
        requestAnimationFrame(() => this.detectFrame());
    }
    
    processResults(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.handDetected = true;
            
            for (const landmarks of results.multiHandLandmarks) {
                // Draw hand landmarks
                this.drawHand(landmarks);
                
                // Detect gesture
                const gesture = this.detectGesture(landmarks);
                
                // Get palm center for position tracking
                const palmCenter = this.getPalmCenter(landmarks);
                
                // Call callback with gesture and position data
                if (this.onResultsCallback) {
                    this.onResultsCallback({
                        gesture: gesture,
                        position: palmCenter,
                        landmarks: landmarks,
                        handDetected: true
                    });
                }
            }
        } else {
            this.handDetected = false;
            if (this.onResultsCallback) {
                this.onResultsCallback({
                    gesture: null,
                    position: null,
                    landmarks: null,
                    handDetected: false
                });
            }
        }
    }
    
    drawHand(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],     // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17]           // Palm
        ];
        
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        this.ctx.lineWidth = 3;
        
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.x * this.canvas.width, startPoint.y * this.canvas.height);
            this.ctx.lineTo(endPoint.x * this.canvas.width, endPoint.y * this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw landmarks
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = i === 0 ? '#ff6b6b' : '#667eea';
            this.ctx.fill();
            
            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    getPalmCenter(landmarks) {
        // Calculate center of palm using wrist and base of fingers
        const wrist = landmarks[0];
        const indexBase = landmarks[5];
        const pinkyBase = landmarks[17];
        
        const centerX = (wrist.x + indexBase.x + pinkyBase.x) / 3;
        const centerY = (wrist.y + indexBase.y + pinkyBase.y) / 3;
        const centerZ = (wrist.z + indexBase.z + pinkyBase.z) / 3;
        
        return { x: centerX, y: centerY, z: centerZ };
    }
    
    detectGesture(landmarks) {
        // Get enhanced finger states with landmark data
        const fingerData = this.getFingerStates(landmarks);
        
        // Detect gestures in order of specificity (most specific first)
        if (this.isThumbsUp(fingerData)) {
            return this.smoothGesture('thumbsup');
        }
        
        if (this.isThumbsDown(fingerData)) {
            return this.smoothGesture('thumbsdown');
        }
        
        if (this.isSpiderMan(fingerData)) {
            return this.smoothGesture('spiderman');
        }
        
        if (this.isRockSign(fingerData)) {
            return this.smoothGesture('rock');
        }
        
        if (this.isOkSign(fingerData)) {
            return this.smoothGesture('ok');
        }
        
        if (this.isPeaceSign(fingerData)) {
            return this.smoothGesture('peace');
        }
        
        if (this.isPointingUp(fingerData)) {
            return this.smoothGesture('point');
        }
        
        if (this.isClosedFist(fingerData)) {
            return this.smoothGesture('fist');
        }
        
        if (this.isOpenPalm(fingerData)) {
            return this.smoothGesture('palm');
        }
        
        return this.smoothGesture('unknown');
    }
    
    getFingerStates(landmarks) {
        // Enhanced finger state detection with better accuracy
        const fingers = {
            thumb: false,
            index: false,
            middle: false,
            ring: false,
            pinky: false
        };
        
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const thumbMCP = landmarks[2];
        const indexTip = landmarks[8];
        const indexPIP = landmarks[6];
        const indexMCP = landmarks[5];
        
        // Determine hand orientation (left or right hand)
        const palmBase = landmarks[0];
        const indexBase = landmarks[5];
        const pinkyBase = landmarks[17];
        
        // Calculate palm direction
        const palmDirection = indexBase.x - pinkyBase.x;
        const isRightHand = palmDirection < 0;
        
        // THUMB: More accurate detection
        // Check thumb extension relative to palm
        const thumbToWristDist = this.distance3D(thumbTip, wrist);
        const thumbIPToWrist = this.distance3D(thumbIP, wrist);
        const thumbExtended = thumbToWristDist > thumbIPToWrist * 1.1;
        
        // Also check if thumb is away from palm
        const thumbToPalm = this.distance3D(thumbTip, indexMCP);
        fingers.thumb = thumbExtended && thumbToPalm > 0.08;
        
        // INDEX: Check if fingertip is above PIP joint (extended)
        const indexExtended = indexTip.y < indexPIP.y - 0.02;
        fingers.index = indexExtended;
        
        // MIDDLE
        const middleTip = landmarks[12];
        const middlePIP = landmarks[10];
        fingers.middle = middleTip.y < middlePIP.y - 0.02;
        
        // RING
        const ringTip = landmarks[16];
        const ringPIP = landmarks[14];
        fingers.ring = ringTip.y < ringPIP.y - 0.02;
        
        // PINKY
        const pinkyTip = landmarks[20];
        const pinkyPIP = landmarks[18];
        fingers.pinky = pinkyTip.y < pinkyPIP.y - 0.02;
        
        return { fingers, isRightHand, landmarks };
    }
    
    distance3D(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    isClosedFist(fingerData) {
        const { fingers } = fingerData;
        // All fingers must be closed including thumb
        return !fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
    }
    
    isOpenPalm(fingerData) {
        const { fingers } = fingerData;
        // All fingers extended
        return fingers.thumb && fingers.index && fingers.middle && fingers.ring && fingers.pinky;
    }
    
    isPointingUp(fingerData) {
        const { fingers } = fingerData;
        // Only index finger up
        return fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
    }
    
    isPeaceSign(fingerData) {
        const { fingers } = fingerData;
        // Index and middle up, others down
        return fingers.index && fingers.middle && !fingers.ring && !fingers.pinky;
    }
    
    isThumbsUp(fingerData) {
        const { fingers, landmarks } = fingerData;
        
        // Thumb must be extended and pointing upward
        const thumbTip = landmarks[4];
        const thumbMCP = landmarks[2];
        const wrist = landmarks[0];
        
        // Check thumb is pointing up (tip is higher than base)
        const thumbPointingUp = thumbTip.y < thumbMCP.y - 0.05;
        
        // Check thumb is extended away from palm
        const thumbExtended = fingers.thumb;
        
        // All other fingers should be curled
        const othersCurled = !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
        
        return thumbPointingUp && thumbExtended && othersCurled;
    }
    
    isThumbsDown(fingerData) {
        const { fingers, landmarks } = fingerData;
        
        const thumbTip = landmarks[4];
        const thumbMCP = landmarks[2];
        
        // Thumb pointing down
        const thumbPointingDown = thumbTip.y > thumbMCP.y + 0.05;
        const thumbExtended = fingers.thumb;
        const othersCurled = !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
        
        return thumbPointingDown && thumbExtended && othersCurled;
    }
    
    isRockSign(fingerData) {
        const { fingers } = fingerData;
        // Index and pinky up, others down (rock/metal sign)
        return fingers.index && !fingers.middle && !fingers.ring && fingers.pinky;
    }
    
    isOkSign(fingerData) {
        const { fingers, landmarks } = fingerData;
        
        // Thumb and index form a circle, other fingers extended
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const distance = this.distance3D(thumbTip, indexTip);
        const touching = distance < 0.06;
        
        return touching && fingers.middle && fingers.ring && fingers.pinky;
    }
    
    isSpiderMan(fingerData) {
        const { fingers } = fingerData;
        // Thumb, index, and pinky extended (Spider-Man web)
        return fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && fingers.pinky;
    }
    
    smoothGesture(gesture) {
        // Add to history
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.historyLength) {
            this.gestureHistory.shift();
        }
        
        // Find most common gesture in history
        const counts = {};
        for (const g of this.gestureHistory) {
            counts[g] = (counts[g] || 0) + 1;
        }
        
        let maxCount = 0;
        let smoothedGesture = gesture;
        for (const [g, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                smoothedGesture = g;
            }
        }
        
        return smoothedGesture;
    }
    
    getHandOpenness(landmarks) {
        // Calculate how open the hand is (0 = closed fist, 1 = fully open)
        const wrist = landmarks[0];
        
        let totalDistance = 0;
        const fingerTips = [4, 8, 12, 16, 20];
        
        for (const tipIdx of fingerTips) {
            const tip = landmarks[tipIdx];
            const dx = tip.x - wrist.x;
            const dy = tip.y - wrist.y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        
        // Normalize (these values are approximate)
        const minDistance = 0.3;
        const maxDistance = 1.0;
        const openness = (totalDistance - minDistance) / (maxDistance - minDistance);
        
        return Math.max(0, Math.min(1, openness));
    }
}
