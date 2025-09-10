import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { ScannerCommonProps, ScanResult } from '../../types';

export type PhotoCaptureGuidedProps = ScannerCommonProps & {
  minPhotos?: number;
};

export const PhotoCaptureGuided: React.FC<PhotoCaptureGuidedProps> = ({
  onProgress,
  onError,
  onCompleted,
  minPhotos = 30,
}) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  const progress = useMemo(() => Math.min(1, count / minPhotos), [count, minPhotos]);

  const emitProgress = (p: number, stage: any, message?: string) => {
    onProgress?.({ progress: p, stage, message });
  };

  const handleStart = () => {
    setStarted(true);
    emitProgress(0, 'initializing', 'Follow the guide and capture photos around the object');
  };

  const handleCaptureMarker = () => {
    // This is a placeholder to mark a capture. Integrate with your camera to actually take photos.
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

  return (
    <View style={styles.container}>
      {!started ? (
        <View style={styles.center}>
          <Text style={styles.title}>Photogrammetry Guidance</Text>
          <Text style={styles.subtitle}>You can capture a series of photos around the object and process them into a 3D mesh on a server or desktop tool.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
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
            <TouchableOpacity style={styles.secondaryButton} onPress={handleCaptureMarker}>
              <Text style={styles.secondaryButtonText}>Mark Photo Captured</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>Integrate your camera to take actual photos and upload them to your pipeline.</Text>
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
});
