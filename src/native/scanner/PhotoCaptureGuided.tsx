import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import type { ScannerCommonProps, ScanResult } from '../../types';

export type PhotoCaptureGuidedProps = ScannerCommonProps & {
  minPhotos?: number;
};

// Attempt a lazy require of expo-camera if present
function getExpoCamera() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-camera');
    return mod;
  } catch (e) {
    return null;
  }
}

export const PhotoCaptureGuided: React.FC<PhotoCaptureGuidedProps> = ({
  onProgress,
  onError,
  onCompleted,
  minPhotos = 30,
}) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const cameraRef = useRef<any>(null);

  const CameraMod: any = useMemo(() => getExpoCamera(), []);
  const Camera = CameraMod?.Camera;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!CameraMod?.Camera || !CameraMod?.Camera?.requestCameraPermissionsAsync) {
        setHasPermission(false);
        return;
      }
      try {
        const res = await CameraMod.Camera.requestCameraPermissionsAsync();
        if (!cancelled) setHasPermission(res.status === 'granted');
      } catch (e) {
        if (!cancelled) setHasPermission(false);
      }
    })();
    return () => { cancelled = true; };
  }, [CameraMod]);

  const progress = useMemo(() => Math.min(1, count / minPhotos), [count, minPhotos]);

  const emitProgress = (p: number, stage: any, message?: string) => {
    onProgress?.({ progress: p, stage, message });
  };

  const handleStart = () => {
    setStarted(true);
    emitProgress(0, 'initializing', 'Follow the guide and capture photos around the object');
  };

  const captureFrame = async (): Promise<void> => {
    if (Camera && cameraRef.current?.takePictureAsync) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
        // In a real pipeline, push photo.uri for upload/processing
      } catch (e) {
        onError?.(new Error('Failed to capture photo'));
      }
    }
  };

  const handleCaptureMarker = async () => {
    // Take an actual photo if possible
    await captureFrame();
    const next = count + 1;
    setCount(next);
    emitProgress(Math.min(0.9, next / minPhotos), 'scanning', `Captured ${next} / ${minPhotos} photos`);
  };

  const handleFinish = () => {
    if (count < minPhotos) {
      onError?.(new Error(`Please capture at least ${minPhotos} photos before finishing.`));
      return;
    }
    emitProgress(1, 'completed', 'Photos ready for photogrammetry');
    const result: ScanResult = {
      files: [],
      metadata: { photosCaptured: count, mode: 'photogrammetry-guided' },
      estimatedQuality: count >= minPhotos ? 'medium' : 'low',
    };
    onCompleted?.(result);
  };

  const renderCamera = () => {
    if (!Camera) return null;
    if (hasPermission === null) {
      return <Text style={styles.helper}>Requesting camera permission…</Text>;
    }
    if (hasPermission === false) {
      return <Text style={styles.helper}>Camera permission denied or not available. Grant permission in settings.</Text>;
    }
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          ratio={Platform.OS === 'android' ? '16:9' : undefined}
          onCameraReady={() => setCameraReady(true)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!started ? (
        <View style={styles.center}>
          <Text style={styles.title}>Photogrammetry Guidance</Text>
          <Text style={styles.subtitle}>You can capture a series of photos around the object and process them into a 3D mesh on a server or desktop tool.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
          {Camera ? (
            <Text style={[styles.helper, { marginTop: 12 }]}>A live camera preview will appear after you start (requires expo-camera).</Text>
          ) : (
            <Text style={[styles.helper, { marginTop: 12 }]}>Install expo-camera to enable live preview and photo capture in fallback.</Text>
          )}
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
          {renderCamera()}
          <ScrollView style={styles.instructions}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.bullet}>• Place the object on a feature-rich surface with good lighting.</Text>
            <Text style={styles.bullet}>• Walk around the object and take overlapping photos every ~10°.</Text>
            <Text style={styles.bullet}>• Capture top angles and low angles as well.</Text>
            <Text style={styles.bullet}>• Aim for at least {minPhotos} photos.</Text>
          </ScrollView>
          <View style={styles.progressRow}>
            <Text style={styles.counter}>{count} / {minPhotos}</Text>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleCaptureMarker} disabled={Camera ? !cameraReady : false}>
              <Text style={styles.secondaryButtonText}>{Camera ? 'Capture Photo' : 'Mark Photo Captured'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>{Camera ? 'Photos are captured locally; wire into your photogrammetry pipeline.' : 'Integrate your camera to take actual photos and upload them to your pipeline.'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 12 },
  instructions: { flex: 1, width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  bullet: { fontSize: 14, color: '#222', marginBottom: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  progressBar: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4f46e5' },
  counter: { fontVariant: ['tabular-nums'], minWidth: 60, textAlign: 'right' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { backgroundColor: '#4f46e5', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  primaryButtonText: { color: 'white', fontWeight: '600' },
  secondaryButton: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  secondaryButtonText: { color: '#111827', fontWeight: '600' },
  helper: { color: '#6b7280', marginTop: 8, textAlign: 'center' },
  cameraContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  camera: { flex: 1 },
});
