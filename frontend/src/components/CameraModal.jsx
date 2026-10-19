import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, FlipHorizontal, SwitchCamera } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, showToast }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // Default to Back Camera for documents
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
          setHasMultipleCameras(true);
        }
      }).catch(() => {});
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const startCamera = useCallback(async (mode = facingMode) => {
    // First stop any active tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('इस ब्राउज़र में कैमरा सपोर्ट उपलब्ध नहीं है।');
        return;
      }

      setCameraError('');

      // Attempt desired facingMode with ideal fallback
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback to any available video camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('कैमरा एक्सेस की अनुमति नहीं मिली। कृपया ब्राउज़र परमिशन की जांच करें।');
      if (showToast) showToast('कैमरा शुरू करने में समस्या आई।', 'error');
    }
  }, [facingMode, stream, showToast]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const toggleFacingMode = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    // Flip horizontally if front camera for mirror effect
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCapture({
      name: `doc_camera_${facingMode}_${Date.now()}.jpg`,
      size: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB`,
      dataUrl,
      type: 'image/jpeg'
    });
    stopCamera();
    onClose();
    if (showToast) showToast('दस्तावेज़ फोटो सफलतापूर्वक कैप्चर हो गई!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="camera-box">
        <div className="camera-header">
          <div className="camera-header-title">
            <Camera size={18} />
            <span>📷 Live Camera Capture (Front & Back)</span>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="video-container" style={{ position: 'relative' }}>
          {cameraError ? (
            <div className="camera-error-view">
              <p>{cameraError}</p>
              <button type="button" className="track-btn" onClick={() => startCamera(facingMode)}>
                <RefreshCw size={15} /> Retry Camera
              </button>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              id="webcamVideo"
              style={{
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                width: '100%',
                maxHeight: '420px',
                objectFit: 'contain',
                background: '#000',
                borderRadius: '6px'
              }}
            />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Quick Camera Switcher Floating Pill */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(10, 37, 64, 0.85)',
            padding: '4px 10px',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span>Active: <strong>{facingMode === 'environment' ? 'Back Camera (दस्तावेज़)' : 'Front Camera (सेल्फी)'}</strong></span>
          </div>
        </div>

        {/* Camera Selector Tabs / Flip Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          padding: '10px 14px 4px 14px', 
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            className={`btn-action ${facingMode === 'environment' ? 'btn-approve' : ''}`}
            onClick={() => {
              setFacingMode('environment');
              startCamera('environment');
            }}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            📷 Back Camera (दस्तावेज़ स्कैनर)
          </button>

          <button
            type="button"
            className={`btn-action ${facingMode === 'user' ? 'btn-approve' : ''}`}
            onClick={() => {
              setFacingMode('user');
              startCamera('user');
            }}
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            🤳 Front Camera (सेल्फी / फ्रंट)
          </button>

          <button
            type="button"
            className="btn-action"
            onClick={toggleFacingMode}
            title="Switch / Flip Camera"
            style={{ padding: '6px 12px', fontSize: '0.82rem', background: '#0a2540', color: '#fff' }}
          >
            <SwitchCamera size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            <span>Flip</span>
          </button>
        </div>

        <div className="camera-controls">
          <button type="button" className="btn-capture" onClick={handleCaptureSnapshot} disabled={!!cameraError}>
            <Camera size={16} />
            <span>Capture Photo (फोटो लें)</span>
          </button>
          <button type="button" className="track-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
