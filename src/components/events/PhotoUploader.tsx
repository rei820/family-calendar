"use client";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export interface PhotoPreview {
  id: string;
  url: string;
  file: File;
}

interface Props {
  photos: PhotoPreview[];
  onChange: (photos: PhotoPreview[]) => void;
}

export default function PhotoUploader({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: PhotoPreview[] = Array.from(files).map((file) => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));
    onChange([...photos, ...newPhotos]);
  };

  const remove = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(photo.id)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-warm-300 hover:text-warm-400 transition-colors w-full justify-center"
      >
        <ImagePlus size={20} />
        <span className="text-sm font-medium">写真を選択{photos.length > 0 ? "（追加）" : ""}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
