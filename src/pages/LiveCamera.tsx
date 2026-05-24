import { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { detectionAPI } from "../service/api";

const COLORS: Record<string, string> = {
  bicycle:    "#00FFFF",
  bus:        "#0066FF",
  car:        "#00FF00",
  jeepney:    "#FF00FF",
  motorcycle: "#FFFF00",
  tricycle:   "#FF6600",
  truck:      "#FF0000",
  van:        "#FF69B4",
};

interface LiveCameraProps {
  deviceId?: string | null;
  label?: string;
  updateDetections?: (detections: any[]) => void;
}

export default function LiveCamera({ deviceId, label, updateDetections }: LiveCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<"front" | "back">(deviceId === "front" ? "front" : "back");
  const cameraRef = useRef<CameraView>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  const [status, setStatus] = useState("Starting camera...");

  const updateDetectionsRef = useRef(updateDetections);
  useEffect(() => {
    updateDetectionsRef.current = updateDetections;
  }, [updateDetections]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const captureFrame = async () => {
      if (!cameraRef.current || !layout) {
        timer = setTimeout(captureFrame, 1000);
        return;
      }

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.2,
          skipProcessing: true,
        });

        if (!photo || !isMounted) return;

        const formData = new FormData();
        formData.append("file", {
          uri: Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
          type: "image/jpeg",
          name: "frame.jpg",
        } as any);

        const response = await detectionAPI.detect(formData);

        if (isMounted && response.data?.detections) {
          const rawDets = response.data.detections as any[];

          const mappedDets = rawDets.map((det) => ({
            ...det,
            photoWidth: photo.width,
            photoHeight: photo.height,
          }));

          setDetections(mappedDets);
          setStatus(`Detecting... ${rawDets.length} vehicle(s) found`);

          if (updateDetectionsRef.current) {
            updateDetectionsRef.current(rawDets);
          }
        }
      } catch (err) {
        console.warn("Frame capture/detection failed:", err);
        setStatus("API connection failed");
        setDetections([]);
      } finally {
        if (isMounted) {
          timer = setTimeout(captureFrame, 1000);
        }
      }
    };

    if (permission?.granted) {
      setStatus("Camera ready — detecting...");
      timer = setTimeout(captureFrame, 1000);
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [permission, layout]);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 rounded-lg">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 rounded-lg p-4">
        <Text className="text-white text-center">We need your permission to show the camera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {/* Camera view */}
      <View style={{ flex: 1, backgroundColor: "black", position: "relative" }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setLayout({ width, height });
          }}
        />

        {/* Bounding box overlays */}
        {layout && detections.map((det, index) => {
          const scaleX = layout.width / det.photoWidth;
          const scaleY = layout.height / det.photoHeight;
          const left = det.bbox[0] * scaleX;
          const top = det.bbox[1] * scaleY;
          const width = (det.bbox[2] - det.bbox[0]) * scaleX;
          const height = (det.bbox[3] - det.bbox[1]) * scaleY;
          const color = COLORS[det.class?.toLowerCase()] || "#10b981";
          const badgeBgColor = color + "d9";

          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                borderColor: color,
                borderWidth: 2,
                borderRadius: 4,
              }}
              pointerEvents="none"
            >
              <View style={{
                position: "absolute",
                top: -22,
                left: -2,
                backgroundColor: badgeBgColor,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 2,
              }}>
                <Text style={{ color: "#000", fontSize: 10, fontWeight: "bold" }}>
                  {det.class.toUpperCase()} ({Math.round(det.confidence * 100)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Status bar and legend — only in standalone mode (not in MultiCamera tiles) */}
      {!label && (
        <>
          <View style={{
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: "#1a1a2e",
            borderRadius: 4,
          }}>
            <Text style={{ color: "#fff", fontSize: 13 }}>{status}</Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {Object.entries(COLORS).map(([vehicle, color]) => (
              <View key={vehicle} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }} />
                <Text style={{ fontSize: 11, textTransform: "capitalize", color: "#555" }}>{vehicle}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
