import { useState, useCallback } from "react";
import { Camera, CameraType, useCameraPermissions } from "expo-camera";

export const useAutoVision = () => {
  // --- FORM LOGIC ---
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Adapted for React Native onChangeText which directly provides the string value
  const handleInputChange = (eventOrText: any, nameOverride?: string) => {
    // If it's a simulated web event { target: { name, value } }
    if (eventOrText && eventOrText.target && eventOrText.target.name) {
      const { name, value } = eventOrText.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } 
    // If it's pure text from React Native
    else if (typeof eventOrText === 'string' && nameOverride) {
      setFormData((prev) => ({ ...prev, [nameOverride]: eventOrText }));
    }
  };

  const resetForm = () => setFormData({});

  // --- CAMERA LOGIC ---
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (deviceId: string | null = null) => {
    try {
      if (!permission?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          setError("Camera Access Denied");
          return false;
        }
      }
      return true; // Return true indicating camera is ready
    } catch (err) {
      setError("Camera Initialization Error");
      console.error(err);
      return false;
    }
  }, [permission, requestPermission]);

  return {
    formData,
    handleInputChange,
    resetForm,
    error,
    startCamera,
    hasCameraPermission: permission?.granted ?? false,
  };
};
