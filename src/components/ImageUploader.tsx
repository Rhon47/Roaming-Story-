import React, { useRef } from 'react';
import { Upload, Camera, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string, file: File) => void;
  label?: string; // Default to "Upload image"
  captureLabel?: string; // Default to "Take Photo"
  className?: string; // Optional class overriding
  compact?: boolean; // Toggle simpler visual styling
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  label = "Upload image",
  captureLabel = "Take Photo",
  className = "",
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRearInputRef = useRef<HTMLInputElement>(null);
  const cameraFrontInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      onImageSelected(dataUrl, file);
    };
    reader.readAsDataURL(file);

    // Reset the input value so that the exact same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Hidden Native HTML File Inputs */}
      {/* 1. Desktop & Mobile File Selector (Guaranteed file navigator - never forces camera) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 2. Rear Camera Capture (Forced environment camera prompt on mobile) */}
      <input
        type="file"
        ref={cameraRearInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 3. Front Camera Capture / Selfie Option (Forced user camera prompt on mobile) */}
      <input
        type="file"
        ref={cameraFrontInputRef}
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Button 1: File Upload (Select existing image) */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={
          compact
            ? "py-1 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[9px] font-mono rounded-lg border border-purple-200 flex items-center gap-1 cursor-pointer transition font-bold"
            : "py-1.5 px-3 bg-purple-750 hover:bg-purple-800 text-white text-[9px] font-mono rounded-lg flex items-center gap-1.5 cursor-pointer transition uppercase font-bold text-center border border-purple-650"
        }
        title="Select an existing image file from your device directory or gallery"
      >
        <Upload className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>{label}</span>
      </button>

      {/* Button 2: Native Rear Camera Capture (Take Photo) */}
      <button
        type="button"
        onClick={() => cameraRearInputRef.current?.click()}
        className={
          compact
            ? "py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition font-bold"
            : "py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-mono rounded-lg flex items-center gap-1.5 cursor-pointer transition uppercase font-bold text-center border border-emerald-650"
        }
        title="Snapshot a landmark with your rear mobile camera"
      >
        <Camera className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>{captureLabel}</span>
      </button>

      {/* Button 3: Native Front Camera Capture / Selfie (only loaded for full sizes) */}
      {!compact && (
        <button
          type="button"
          onClick={() => cameraFrontInputRef.current?.click()}
          className="py-1.5 px-2 bg-stone-800 hover:bg-stone-850 text-stone-300 border border-stone-750 text-[9px] font-mono rounded-lg flex items-center gap-1.5 cursor-pointer transition uppercase font-bold text-center"
          title="Take a quick co-pilot selfie with your front camera"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Selfie</span>
        </button>
      )}
    </div>
  );
};
