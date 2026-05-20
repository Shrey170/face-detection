import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Header from './components/Header';
import SidebarControls from './components/SidebarControls';
import BiometricsPanel from './components/BiometricsPanel';
import TelemetryPanel from './components/TelemetryPanel';
import SystemLogs from './components/SystemLogs';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [fps, setFps] = useState(0);
  const lastVideoTime = useRef(-1);
  const framesRef = useRef(0);
  const lastFpsTime = useRef(performance.now());
  const lastStateUpdateTime = useRef(0);
  const requestRef = useRef();

  const [options, setOptions] = useState({
    showMesh: true,
    showIris: true,
    showBox: true,
    activeFilter: 'cyber_hud'
  });
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  const landmarkerRef = useRef(null);

  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), msg: 'SYSTEM INITIALIZING...', type: 'info' }]);
  const [blendshapes, setBlendshapes] = useState(null);
  const [rotation, setRotation] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [gaze, setGaze] = useState('CENTER');
  const [isLoaded, setIsLoaded] = useState(false);

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev.slice(-49), { time: new Date().toLocaleTimeString(), msg, type }]);
  }, []);

  useEffect(() => {
    async function setupLandmarker() {
      try {
        addLog('Loading MediaPipe WebAssembly...', 'info');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        addLog('Wasm loaded. Fetching AI Model...', 'info');
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        setFaceLandmarker(landmarker);
        landmarkerRef.current = landmarker;
        setIsLoaded(true);
        addLog('Face Landmarker READY.', 'info');
        startCamera();
      } catch (err) {
        addLog(`Error loading model: ${err.message}`, 'error');
      }
    }
    setupLandmarker();
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      addLog('Camera API not supported', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", () => {
          setIsWebcamActive(true);
          addLog('Camera streaming active.', 'info');
          predictWebcam();
        });
      }
    } catch (err) {
      addLog(`Camera error: ${err.message}`, 'error');
    }
  };

  const calculateRotation = (landmarks) => {
    // MediaPipe uses 3D coordinates. 
    // nose: 4, leftEye: 33, rightEye: 263, chin: 152
    const nose = landmarks[4];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    // Roll (Z-axis rotation)
    const dX = rightEye.x - leftEye.x;
    const dY = rightEye.y - leftEye.y;
    const roll = Math.atan2(dY, dX) * 180 / Math.PI;

    // Yaw (Y-axis) - simple approximation based on distance from nose to eyes in X plane
    const leftDist = Math.abs(nose.x - leftEye.x);
    const rightDist = Math.abs(nose.x - rightEye.x);
    // mapped to degrees approximately
    const yaw = ((leftDist - rightDist) / (leftDist + rightDist)) * -90; 

    // Pitch (X-axis) - using depth (z) of nose relative to eyes
    const eyeZ = (leftEye.z + rightEye.z) / 2;
    const pitch = (nose.z - eyeZ) * -500; // scaling factor for viz

    return { pitch, yaw, roll };
  };

  const calculateGaze = (rotation) => {
    if (rotation.yaw < -15) return 'RIGHT';
    if (rotation.yaw > 15) return 'LEFT';
    if (rotation.pitch < -10) return 'UP';
    if (rotation.pitch > 10) return 'DOWN';
    return 'CENTER';
  };

  const drawMesh = (ctx, landmarks, w, h) => {
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
    ctx.lineWidth = 1;
    // Draw all points
    for (let p of landmarks) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 1, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
      ctx.fill();
    }
  };

  const drawIris = (ctx, landmarks, w, h) => {
    const leftIris = [474,475,476,477];
    const rightIris = [469,470,471,472];
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    [leftIris, rightIris].forEach(iris => {
      ctx.beginPath();
      const first = landmarks[iris[0]];
      ctx.moveTo(first.x * w, first.y * h);
      for(let i=1; i<iris.length; i++) {
        const p = landmarks[iris[i]];
        ctx.lineTo(p.x * w, p.y * h);
      }
      ctx.closePath();
      ctx.stroke();
    });
  };

  const drawBoundingBox = (ctx, landmarks, w, h) => {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    
    const x = minX * w;
    const y = minY * h;
    const width = (maxX - minX) * w;
    const height = (maxY - minY) * h;
    const pad = 20;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    // Corners
    const size = 30;
    ctx.beginPath();
    // Top Left
    ctx.moveTo(x-pad, y-pad+size); ctx.lineTo(x-pad, y-pad); ctx.lineTo(x-pad+size, y-pad);
    // Top Right
    ctx.moveTo(x+width+pad-size, y-pad); ctx.lineTo(x+width+pad, y-pad); ctx.lineTo(x+width+pad, y-pad+size);
    // Bottom Left
    ctx.moveTo(x-pad, y+height+pad-size); ctx.lineTo(x-pad, y+height+pad); ctx.lineTo(x-pad+size, y+height+pad);
    // Bottom Right
    ctx.moveTo(x+width+pad, y+height+pad-size); ctx.lineTo(x+width+pad, y+height+pad); ctx.lineTo(x+width+pad-size, y+height+pad);
    ctx.stroke();

    // Text ID
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px "Share Tech Mono"';
    ctx.fillText(`TARGET LOCKED // ID: 01`, x-pad, y-pad-10);
  };

  const lastProcessingTime = useRef(0);

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !landmarkerRef.current) return;

    try {
      let startTimeMs = performance.now();
      // MediaPipe requires strictly increasing timestamps
      if (startTimeMs <= lastProcessingTime.current) {
        startTimeMs = lastProcessingTime.current + 1;
      }
      lastProcessingTime.current = startTimeMs;

      if (lastVideoTime.current !== videoRef.current.currentTime) {
        lastVideoTime.current = videoRef.current.currentTime;
      
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Mirror canvas to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        if (optionsRef.current.showMesh) drawMesh(ctx, landmarks, canvas.width, canvas.height);
        if (optionsRef.current.showIris) drawIris(ctx, landmarks, canvas.width, canvas.height);
        if (optionsRef.current.showBox) drawBoundingBox(ctx, landmarks, canvas.width, canvas.height);

        // Update state logic (Throttled to avoid freezing browser)
        if (startTimeMs - lastStateUpdateTime.current > 100) {
          setBlendshapes(results.faceBlendshapes);
          const rot = calculateRotation(landmarks);
          setRotation(rot);
          setGaze(calculateGaze(rot));
          lastStateUpdateTime.current = startTimeMs;
        }
        
        // Filter effects (Optional AR)
        if (optionsRef.current.activeFilter === 'cyber_hud') {
          // Draw targeting circles on eyes
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          ctx.beginPath();
          ctx.arc(leftEye.x * canvas.width, leftEye.y * canvas.height, 40, 0, 2*Math.PI);
          ctx.arc(rightEye.x * canvas.width, rightEye.y * canvas.height, 40, 0, 2*Math.PI);
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (optionsRef.current.activeFilter === 'tech_visor') {
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          const nose = landmarks[4];
          
          const centerX = nose.x * canvas.width;
          const centerY = ((leftEye.y + rightEye.y) / 2) * canvas.height;
          
          const dX = (rightEye.x - leftEye.x) * canvas.width;
          const dY = (rightEye.y - leftEye.y) * canvas.height;
          const angle = Math.atan2(dY, dX);
          const eyeDist = Math.sqrt(dX*dX + dY*dY);
          const visorWidth = eyeDist * 2.2;
          const visorHeight = eyeDist * 0.6;
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          
          // Draw the visor base
          ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-visorWidth/2, -visorHeight/2, visorWidth, visorHeight, 10);
          } else {
            ctx.rect(-visorWidth/2, -visorHeight/2, visorWidth, visorHeight);
          }
          ctx.fill();
          
          // Draw the glowing neon strip
          ctx.fillStyle = 'rgba(0, 243, 255, 1)';
          ctx.shadowColor = 'rgba(0, 243, 255, 1)';
          ctx.shadowBlur = 20;
          ctx.fillRect(-visorWidth/2 + 5, -visorHeight/4, visorWidth - 10, visorHeight/2);
          
          // Draw pink accent lines
          ctx.fillStyle = 'rgba(255, 0, 255, 1)';
          ctx.shadowColor = 'rgba(255, 0, 255, 1)';
          ctx.shadowBlur = 10;
          ctx.fillRect(-visorWidth/2 + 10, -visorHeight/2 + 2, visorWidth/4, 2);
          ctx.fillRect(visorWidth/4 - 10, -visorHeight/2 + 2, visorWidth/4, 2);
          
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // FPS Counter
    if (framesRef.current !== -1) {
      framesRef.current += 1;
      if (performance.now() - lastFpsTime.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastFpsTime.current = performance.now();
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
    
    } catch (err) {
      console.error(err);
      if (framesRef.current !== -1) {
        addLog(`AI Crash: ${err.message}`, 'error');
        framesRef.current = -1; // Stop loop and log only once
      }
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleCapture = () => {
    // Simple screenshot capture merging video + canvas
    addLog('Capturing HUD screenshot...', 'info');
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(videoRef.current, 0, 0);
    ctx.restore();
    
    ctx.drawImage(canvasRef.current, 0, 0);

    const link = document.createElement('a');
    link.download = `neural-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    addLog('Capture saved to disk.', 'info');
  };

  return (
    <div className="app-container">
      {!isLoaded && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div>INITIALIZING NEURAL NET...</div>
        </div>
      )}
      
      <Header fps={fps} />
      
      <div className="main-content">
        <SidebarControls options={options} setOptions={setOptions} handleCapture={handleCapture} />
        
        <div className="viewport-container">
          <video ref={videoRef} autoPlay playsInline muted></video>
          <canvas ref={canvasRef}></canvas>
          <div className="scanline"></div>
        </div>

        <div style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
          <TelemetryPanel rotation={rotation} gaze={gaze} />
          <BiometricsPanel blendshapes={blendshapes} />
          <SystemLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;
