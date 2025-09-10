export type MeshFormat = 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';

export interface ScanProgressEvent {
  progress: number; // 0..1
  stage?: 'initializing' | 'scanning' | 'reconstructing' | 'exporting' | 'completed' | 'error';
  message?: string;
}

export interface ScanResultFile {
  uri: string; // file://, content://, or https://
  format: MeshFormat;
}

export interface ScanResult {
  files: ScanResultFile[];
  previewImageUri?: string;
  estimatedQuality?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface ScannerCommonProps {
  onProgress?: (e: ScanProgressEvent) => void;
  onError?: (error: Error) => void;
  onCompleted?: (result: ScanResult) => void;
}

export interface NativeScannerProps extends ScannerCommonProps {
  quality?: 'low' | 'medium' | 'high';
  outputFormats?: MeshFormat[];
  enableTexturedMesh?: boolean;
  // iOS-specific toggles
  ios?: {
    enableLiDAR?: boolean; // default true if available
    enableRoomPlanFallback?: boolean; // for room scanning fallback if needed
  };
  // Android-specific toggles
  android?: {
    enableDepthAPI?: boolean; // default true if available
  };
}

export interface WebScannerProps extends ScannerCommonProps {
  // If true, attempt WebXR Depth Sensing; otherwise fall back to photo capture
  enableWebXRDepth?: boolean;
  // Called when user captured enough photos in fallback mode
  onPhotosReady?: (photos: Blob[]) => void;
  // Target number of photos for photogrammetry fallback
  targetPhotoCount?: number; // default 40
  // Size of captured frames
  captureWidth?: number; // default 1280
  captureHeight?: number; // default 720
}
