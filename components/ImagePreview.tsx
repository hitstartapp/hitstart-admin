'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X, Download } from 'lucide-react';

interface ImagePreviewProps {
  imageName: string;
  baseUrl: string;
}

export default function ImagePreview({ imageName, baseUrl }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageName) return null;

  // Clean trailing/leading slashes to form a clean URL
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanImageName = imageName.startsWith('/') ? imageName.slice(1) : imageName;
  const fullImageUrl = `${cleanBaseUrl}${cleanImageName}`;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 px-2 py-1 rounded-md transition-all shadow-sm font-medium"
      >
        <ImageIcon size={12} />
        <span className="truncate max-w-[150px]">{imageName}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => handleClose(e)}
        >
          <div
            className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] overflow-hidden relative flex items-center justify-center transform transition-all scale-100 duration-300 ease-out border border-slate-800"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Close Button: Circular top-right */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md rounded-full text-white hover:text-slate-200 transition-colors shadow-lg border border-white/10"
            >
              <X size={20} />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullImageUrl}
              alt={imageName}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Failed+to+load+image';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
