import React, { useMemo, useRef } from 'react';
import { Platform, requireNativeComponent, UIManager, View, Text, StyleSheet } from 'react-native';
import type { NativeScannerProps, ScanProgressEvent, ScanResult } from '../../types';
import { PhotoCaptureGuided } from './PhotoCaptureGuided';

export type NativeScannerViewProps = NativeScannerProps & {
  style?: any;
};

// Lazy holder for the native component; avoid requiring at module scope to prevent crashes in Expo Go
let CachedNativeComponent: any | null | undefined = undefined;

function getNativeComponentSafely() {
  if (CachedNativeComponent !== undefined) return CachedNativeComponent;
  // Default to null (not available)
  CachedNativeComponent = null;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return CachedNativeComponent;

  try {
    // Check whether the view manager exists before requiring it
    const hasConfig =
      typeof (UIManager as any).getViewManagerConfig === 'function'
        ? !!(UIManager as any).getViewManagerConfig('ARObjectScannerView')
        : typeof (UIManager as any).hasViewManagerConfig === 'function'
          ? !!(UIManager as any).hasViewManagerConfig('ARObjectScannerView')
          : false;

    if (hasConfig) {
      CachedNativeComponent = requireNativeComponent('ARObjectScannerView');
    } else {
      CachedNativeComponent = null;
    }
  } catch (e) {
    // If requiring fails (e.g., Expo Go without native module), stay in JS fallback mode
    CachedNativeComponent = null;
  }
  return CachedNativeComponent;
}

export const NativeScannerView: React.FC<NativeScannerViewProps> = (props) => {
  const { onProgress, onError, onCompleted, style, ...rest } = props;

  const nativeProps = useMemo(() => ({
    ...rest,
    onNativeProgress: (e: any) => onProgress?.(e.nativeEvent as ScanProgressEvent),
    onNativeError: (e: any) => onError?.(new Error(e.nativeEvent?.message || 'Unknown error')),
    onNativeCompleted: (e: any) => onCompleted?.(e.nativeEvent as ScanResult),
  }), [onProgress, onError, onCompleted, rest]);

  const RCTARObjectScannerView = getNativeComponentSafely();

  if (!RCTARObjectScannerView) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.title}>AR Scanner not linked</Text>
        <Text style={styles.text}>Native AR module not found. Using photo-capture guidance instead.</Text>
        <PhotoCaptureGuided onProgress={onProgress} onError={onError} onCompleted={onCompleted} />
      </View>
    );
  }

  return <RCTARObjectScannerView style={style} {...nativeProps} />;
};

const styles = StyleSheet.create({
  fallbackContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  text: { textAlign: 'center', color: '#444', marginBottom: 12 },
});
