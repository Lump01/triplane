# triplane

Cross-platform 3D object scanning components for:
- React Native (ARKit on iOS, ARCore on Android) via a native view bridge
- Web (WebXR detection + camera-based photogrammetry capture fallback)

This is an early scaffold to help you embed a scanner UI today, with clear integration points to add real ARKit/ARCore logic and WebXR depth later.

## Status
- React Native: Native view bridge stubs are included. When the native modules are not linked or not yet implemented, a JS fallback guides users to capture photos for photogrammetry.
- Web: Functional camera preview with frame capture into Blobs for photogrammetry pipelines. WebXR depth detection is included (implementation of depth-based reconstruction TBD).

## Install
```
npm i triplane
```

Peer deps:
- react >= 17
- react-native >= 0.72 (for mobile)

## React Native usage
```tsx
import React from 'react';
import { View } from 'react-native';
import { NativeScannerView } from 'triplane';

export default function ScannerScreen() {
  return (
    <View style={{ flex: 1 }}>
      <NativeScannerView
        style={{ flex: 1 }}
        quality="high"
        outputFormats={["obj", "stl"]}
        onProgress={(e) => console.log('progress', e)}
        onError={(err) => console.warn('scanner error', err)}
        onCompleted={(result) => console.log('scan complete', result)}
      />
    </View>
  );
}
```

If the native module is not linked, the component will render a guided photogrammetry UI as a fallback. If you have expo-camera installed and grant permission, a live camera preview is shown and tapping Capture will take real photos. You can also fork the PhotoCaptureGuided component to integrate your preferred camera (e.g., react-native-vision-camera) and upload the image set to a photogrammetry service (COLMAP/OpenMVG→OpenMVS, Meshroom, RealityCapture, etc.).

### iOS linking and ARKit integration
- Autolinking (CocoaPods) discovers the podspec included with this package (`ScannerKit.podspec`) and links the native iOS sources in `ios/`.
- After installing the package, run `cd ios && pod install` in your React Native app so Xcode picks up the pod.
- Add NSCameraUsageDescription to your app’s Info.plist.
- Implement ARKit scanning inside a proper `UIView` subclass using ARMesh reconstruction (LiDAR devices) or multi-view capture. When done, emit events:
  - `onNativeProgress` → `{ progress, stage, message }`
  - `onNativeError` → `{ message }`
  - `onNativeCompleted` → `{ files: [{ uri, format }], previewImageUri?, estimatedQuality?, metadata? }`

Entry point: `ios/ARObjectScannerViewManager.m` creates the view. Replace the placeholder with an ARKit-backed view, using `ARSCNView/ARView` and file export (`.obj`, `.stl`, `.ply`, `.gltf/.glb`).

### Android linking and ARCore integration
- A minimal package and view manager are included (`android/src/main/java/com/scannerkit`).
- If autolinking doesn’t pick it up, register the package manually in your app’s `MainApplication`:

```kotlin
override fun getPackages(): List<ReactPackage> = listOf(
  MainReactPackage(),
  ARObjectScannerPackage(), // add
)
```

- Implement ARCore scanning (Depth API + meshing). Emit the same events as iOS. You can use Sceneform or write a custom renderer. Export meshes to the desired formats.

### Fallback without LiDAR/Depth
Use the guided photogrammetry mode (`PhotoCaptureGuided`) to collect photo sets and process them server-side or offline. This supports users without depth hardware.

```tsx
import { PhotoCaptureGuided } from 'triplane';

<PhotoCaptureGuided
  minPhotos={40}
  onProgress={() => {}}
  onCompleted={() => {}}
/>
```

## Web usage
```tsx
import React from 'react';
import { WebScanner } from 'triplane';

export default function WebScannerPage() {
  return (
    <div style={{ padding: 16 }}>
      <WebScanner
        enableWebXRDepth
        targetPhotoCount={40}
        onProgress={(e) => console.log(e)}
        onPhotosReady={(photos) => {
          // Upload photos (Blob[]) to your photogrammetry backend
          console.log('photos ready', photos.length);
        }}
        onCompleted={(result) => console.log('session completed', result)}
        onError={(err) => console.error(err)}
      />
    </div>
  );
}
```

Notes:
- Uses `getUserMedia` to preview camera and capture frames to JPEG Blobs.
- Detects WebXR `immersive-ar` availability; a future update can integrate the Depth Sensing Module to create point clouds on device.

## Types
Key types exported from `src/types.ts`:
- MeshFormat: 'obj' | 'stl' | 'ply' | 'gltf' | 'glb'
- ScanProgressEvent
- ScanResult, ScanResultFile
- NativeScannerProps, WebScannerProps

## Roadmap
- iOS: Implement ARKit meshing and export for LiDAR devices; photo capture guidance for non‑LiDAR.
- Android: Implement ARCore Depth + meshing; export pipelines.
- Web: Implement WebXR Depth Sensing (where supported) and live point cloud preview; in-browser photogrammetry via WebAssembly (optional).
- Add example apps (RN and Web) and CI builds.

## Examples
This repo includes example apps under examples/.

- Web (Vite + React)
  - cd examples/web
  - npm run dev

- React Native (Expo)
  - cd examples/expo
  - npm run start

The Expo example will show the JS photo-capture guidance unless native modules are linked. It still demonstrates the API shape and callbacks.

## License
MIT
