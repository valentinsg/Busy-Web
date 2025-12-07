'use client';

import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  label: string;
  description?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  required?: boolean;
}

export function ImageUpload({
  value: _value,
  onChange,
  label,
  description,
  maxSizeMB = 5,
  className,
  disabled = false,
  aspectRatio = 'square',
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`La imagen debe pesar menos de ${maxSizeMB}MB`);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getRecommendedSize = () => {
    switch (aspectRatio) {
      case 'square':
        return '800x800px sin fondo (PNG)';
      case 'landscape':
        return '1200x675px sin fondo (PNG)';
      case 'portrait':
        return '600x800px sin fondo (PNG)';
      default:
        return '800x800px';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white font-body">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {description && (
          <span className="text-xs text-white/60 font-body">{description}</span>
        )}
      </div>

      <div
        className={cn(
          'relative rounded-lg border transition-all overflow-hidden',
          isDragging
            ? 'border-red-400/60 bg-red-400/5'
            : 'border-white/10 bg-black/20',
          disabled && 'opacity-50 cursor-not-allowed',
          preview ? 'w-32 h-32' : 'h-32'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors z-10 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <ImagePlus className="h-6 w-6 text-red-400 mb-2" />
            <p className="text-xs text-white/70 text-center mb-1 font-body">
              <span className="font-medium text-red-400">Subir imagen</span>
            </p>
            <p className="text-[10px] text-white/50 text-center leading-tight font-body">
              {getRecommendedSize()}<br/>
              Máx. {maxSizeMB}MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 font-body">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
