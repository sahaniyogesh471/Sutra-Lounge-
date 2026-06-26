import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Loader2, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64Url: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onClear,
  label,
  className = '',
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and compress image client-side before saving as base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Downscale the image to a maximum dimension of 1024px to reduce Base64 size while retaining high visual quality
          const maxDimension = 1024;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to create canvas 2D context');
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.82 quality factor for excellent size-to-quality ratio
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          
          onChange(compressedDataUrl);
          setIsProcessing(false);
        } catch (e: any) {
          setError('Failed to process image. Try a smaller or different file.');
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setError('Failed to load image file. It might be corrupted.');
        setIsProcessing(false);
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      setError('Failed to read file from your device.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
          {label}
        </span>
      )}

      {value ? (
        // Preview State
        <div className="relative group rounded-xl overflow-hidden border border-gray-250 bg-gray-50 aspect-video w-full transition-all shadow-xs hover:border-[#fd761a] overflow-hidden">
          <img
            src={value}
            alt="Uploaded asset preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-3">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#fd761a]" />
              <span>Change Photo</span>
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Quick Indicator Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-[#fd761a] text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm opacity-90">
            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
            <span>Ready</span>
          </div>
        </div>
      ) : (
        // Dropzone Input State
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all cursor-pointer aspect-video w-full ${
            isDragActive
              ? 'border-[#fd761a] bg-[#fd761a]/5 scale-[0.99]'
              : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          {isProcessing ? (
            <div className="space-y-2.5 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#fd761a] animate-spin" />
              <div>
                <p className="text-xs font-bold text-gray-700">Compressing & optimizing image...</p>
                <p className="text-[10px] text-gray-400 font-mono">Ensuring maximum local storage speed</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 flex flex-col items-center max-w-[280px]">
              <div className="p-3 bg-white border border-gray-150 rounded-2xl shadow-xs text-[#fd761a]">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800">
                  Upload directly from files or phone
                </p>
                <p className="text-[10px] text-gray-400 leading-normal font-medium">
                  Tap to use phone camera or library. Supports JPG, PNG, WebP up to 10MB.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-red-500 bg-red-50/90 border border-red-100 rounded-lg p-1.5 leading-tight text-center">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
