# 🌌 NEXUS - Interactive 3D Particle Universe

> Real-time 3D particle visualization controlled by your hand gestures

![NEXUS Demo](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-r128-green?style=for-the-badge)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

## 🎥 Demo

Control thousands of particles with just your hands! Wave, point, make a fist - watch the particles respond in real-time.

## ✨ Features

- **🎨 3000+ Particles** - Smooth, GPU-accelerated particle rendering
- **✋ Hand Gesture Control** - 7 different gestures recognized in real-time
- **🌀 8 Unique Shapes** - Hearts, Galaxy, DNA Helix, Saturn, and more
- **🌈 6 Color Themes** - Cyberpunk, Matrix, Aurora, Sunset, Lava, Ice
- **⚡ 60 FPS** - Optimized for silky smooth performance
- **📱 Responsive** - Works on desktop and tablet

## 🖐️ Gesture Controls

| Gesture | Action |
|---------|--------|
| ✊ Closed Fist | Compress particles |
| 🖐️ Open Palm | Expand particles |
| ☝️ Point Up | Cycle color themes |
| ✌️ Peace Sign | Switch to next shape |
| 👍 Thumbs Up | Particle explosion |
| 🤘 Rock Sign | Chaos mode |
| 🕷️ Spider-Man | Web effect |

## 🚀 Quick Start

### Option 1: Python Server (Recommended)

```bash
# Clone the repo
git clone https://github.com/shiva/nexus-particles.git
cd nexus-particles

# Start local server
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

### Option 2: Node.js

```bash
npx http-server -p 8000
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

## 📁 Project Structure

```
nexus-particles/
├── index.html        # Main app with futuristic UI
├── tutorial.html     # How-to-build guide for students
├── particles.js      # 3D particle engine
├── handTracking.js   # MediaPipe hand tracking
├── main.js          # Application controller
└── README.md        # You are here!
```

## 🎮 Particle Shapes

| Shape | Description |
|-------|-------------|
| ❤️ Hearts | Classic 3D heart using parametric equations |
| 🌸 Flowers | 6-petal flower pattern |
| 🪐 Saturn | Planet with dynamic ring system |
| 🎆 Fireworks | Multiple starburst explosions |
| 🌀 Galaxy | 4-arm spiral galaxy |
| 🧬 DNA | Double helix with base pairs |
| 📦 Tesseract | 4D hypercube projection |
| 🌪️ Vortex | Tornado spiral pattern |

## 🛠️ Technology Stack

- **[Three.js](https://threejs.org/)** - 3D graphics and WebGL rendering
- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)** - ML-powered hand tracking
- **Custom GLSL Shaders** - For that beautiful glow effect
- **Vanilla JavaScript** - No frameworks, just pure code

## 📚 Learn to Build This

Check out the [Tutorial Page](tutorial.html) for a complete step-by-step guide on how I built this project. Great for students and beginners!

Topics covered:
- Three.js scene setup
- Creating particle systems
- Mathematical shape generation
- Hand tracking integration
- Gesture recognition algorithms

## 💡 How It Works

1. **Camera Capture** - Your webcam feed is processed in real-time
2. **Hand Detection** - MediaPipe identifies 21 hand landmarks
3. **Gesture Recognition** - Finger positions are analyzed to detect gestures
4. **Particle Response** - The particle system reacts based on detected gestures
5. **GPU Rendering** - Three.js renders 3000 particles at 60fps

## 🤔 Requirements

- Modern web browser (Chrome, Firefox, Edge)
- Webcam
- Camera permissions enabled
- Decent GPU for smooth performance

## 🐛 Troubleshooting

**Camera not working?**
- Allow camera permissions when prompted
- Make sure no other app is using the camera

**Hand not detected?**
- Ensure good lighting
- Keep hand fully in frame
- Try moving closer/further from camera

**Laggy performance?**
- Close other browser tabs
- Try a smaller window size
- Check if hardware acceleration is enabled

## 📝 License

MIT License - feel free to use, modify, and share!

## 🙏 Credits

Created with ❤️ by [Shiva](https://github.com/shiva)

Special thanks to:
- Three.js team for the amazing 3D library
- Google MediaPipe for hand tracking solution
- The open source community

---

⭐ Star this repo if you found it useful!
