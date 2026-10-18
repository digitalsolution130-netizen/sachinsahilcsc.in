import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, showToast }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCameraError('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('इस ब्राउज़र में कैमरा सपोर्ट उपलब्ध नहीं है।');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('कैमरा एक्सेस की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में कैमरा परमिशन चेक करें।');
      if (showToast) showToast('कैमरा एक्सेस की अनुमति नहीं मिली।', 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture({
      name: `camera_snapshot_${Date.now()}.jpg`,
      size: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB`,
      dataUrl,
      type: 'image/jpeg'
    });
    stopCamera();
    onClose();
    if (showToast) showToast('फोटो सफलतापूर्वक कैप्चर हो गई!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="camera-box">
        <div className="camera-header">
          <div className="camera-header-title">
            <Camera size={18} />
            <span>📷 Live Camera Capture</span>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="video-container">
          {cameraError ? (
            <div className="camera-error-view">
              <p>{cameraError}</p>
              <button type="button" className="track-btn" onClick={startCamera}>
                <RefreshCw size={15} /> Retry Camera
              </button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted id="webcamVideo" />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="camera-controls">
          <button 
            type="button" 
            className="btn-capture"
            onClick={handleCaptureSnapshot}
            disabled={Boolean(cameraError)}
          >
            📸 Snap Photo (फोटो लें)
          </button>
        </div>
      </div>
    </div>
  );
}

