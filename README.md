# Cyberpunk Neural Face Analyzer

A high-performance, real-time 3D facial analysis dashboard built with React and Google MediaPipe. This application runs entirely on the client-side utilizing WebAssembly to deliver lightning-fast tracking without sending any webcam data to an external server.

## Features

- **3D Face Mesh**: Tracks 468 facial landmarks in real-time.
- **Biometric Sensors**: Analyzes 52 facial blendshapes to instantly detect micro-expressions (Smiles, Blinks, Jaw movement, Brow raises).
- **Head Pose Telemetry**: Calculates exact Yaw, Pitch, and Roll rotation angles in 3D space using vector mathematics.
- **Dynamic Gaze Tracking**: Predicts eye gaze direction (Center, Up, Down, Left, Right) based on facial pitch and yaw.
- **Cyberpunk AR Filters**: Includes interactive, math-driven digital overlays such as the "Tech Visor" that scales and tilts synchronously with head movements.
- **Performance Optimized**: Built using Vite and React, heavily optimized to throttle UI renders and prevent main-thread blocking, keeping the canvas graphics running smoothly.

## Tech Stack

- **Framework**: React.js, Vite
- **Machine Learning**: Google MediaPipe (Tasks-Vision API)
- **Styling**: Custom CSS with glassmorphism, neon glow effects, and scanline animations
- **Icons**: Lucide React

## Getting Started

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/2k33cse992574/face-detection.git
   cd face-detection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the provided `localhost` link in your browser and grant webcam permissions.

## Privacy Note

This application computes everything locally in your browser using the WebAssembly AI inference engine. No images, video, or data are ever transmitted to any external servers.
