import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { WebScannerProps, ScanProgressEvent, ScanResult } from '../types';

export const WebScanner: React.FC<WebScannerProps> = ({
  onProgress,
  onCompleted,
  onError,
  enableWebXRDepth = true,
  onPhotosReady,
  targetPhotoCount = 40,
  captureWidth = 1280,
  captureHeight = 720,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<Blob[]>([]);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const checkXR = async () => {
      try {
        // Detect WebXR and depth-sensing support
        const xr = (navigator as any).xr;
        if (!xr) {
          setXrSupported(false);
          return;
        }
        const supported = await xr.isSessionSupported?.('immersive-ar');
        setXrSupported(!!supported);
      } catch (e) {
        setXrSupported(false);
      }
    };
    checkXR();

    const start = async () => {
      try {
        onProgress?.({ progress: 0, stage: 'initializing', message: 'Starting camera' });
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: captureWidth }, height: { ideal: captureHeight } }, audio: false });
        if (!active) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
        onProgress?.({ progress: 0.05, stage: 'scanning', message: 'Camera ready. Capture frames around the object.' });
      } catch (err: any) {
        onError?.(err);
      }
    };

    start();
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(async () => {
    try {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      canvas.width = captureWidth;
      canvas.height = captureHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, captureWidth, captureHeight);
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92));
      setPhotos((prev) => {
        const next = [...prev, blob];
        onProgress?.({ progress: Math.min(0.95, next.length / targetPhotoCount), stage: 'scanning', message: `Captured ${next.length}/${targetPhotoCount}` });
        if (onPhotosReady && next.length >= targetPhotoCount) {
          onPhotosReady(next);
        }
        return next;
      });
    } catch (e: any) {
      onError?.(e);
    }
  }, [captureWidth, captureHeight, targetPhotoCount, onPhotosReady, onProgress]);

  const finish = useCallback(() => {
    if (photos.length === 0) {
      onError?.(new Error('No photos captured. Capture some frames first.'));
      return;
    }
    const result: ScanResult = {
      files: [],
      metadata: { photosCaptured: photos.length, mode: 'web-photogrammetry' },
      estimatedQuality: photos.length >= targetPhotoCount ? 'medium' : 'low',
    };
    onProgress?.({ progress: 1, stage: 'completed', message: 'Photos ready for upload to photogrammetry pipeline.' });
    onCompleted?.(result);
  }, [photos, targetPhotoCount, onCompleted, onProgress, onError]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {enableWebXRDepth && (
        <div style={{ fontSize: 12, color: '#374151' }}>
          WebXR depth support: {xrSupported === null ? 'checking…' : xrSupported ? 'available (depth implementation TBD)' : 'not available'}
        </div>
      )}
      <video ref={videoRef} playsInline muted style={{ width: '100%', maxWidth: 640, borderRadius: 8, background: '#000' }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={capture} style={btn}>Capture Frame</button>
        <button onClick={finish} style={primaryBtn}>Finish</button>
        <div style={{ alignSelf: 'center', color: '#111827' }}>{photos.length} / {targetPhotoCount}</div>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>Tip: Move around the object and capture from many angles. Good, even lighting helps.</div>
    </div>
  );
};

const btn: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontWeight: 600 };
const primaryBtn: React.CSSProperties = { ...btn, background: '#4f46e5', borderColor: '#4338ca', color: 'white' };
