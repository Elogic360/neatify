/**
 * FileUpload - File upload component with drag and drop, preview, and multi-file support
 */
import React, { useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Upload, X, File, Loader2, GripVertical, Star } from 'lucide-react';

export interface UploadedFile {
  id: string | number;
  file?: File;
  url: string;
  name: string;
  size?: number;
  isPrimary?: boolean;
  isUploading?: boolean;
  error?: string;
}

interface FileUploadProps {
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<{ id: string | number; url: string }>;
  onDelete?: (id: string | number) => Promise<void>;
  onSetPrimary?: (id: string | number) => void;
  onReorder?: (files: UploadedFile[]) => void;
  
  // Config
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
  showPrimary?: boolean;
  reorderable?: boolean;
  
  // Styles
  className?: string;
  compact?: boolean;
}

export function FileUpload({
  files = [],
  onFilesChange,
  onUpload,
  onDelete,
  onSetPrimary,
  onReorder,
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = true,
  showPrimary = true,
  reorderable = true,
  className,
  compact = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(newFiles).slice(0, remainingSlots);
    const validFiles: UploadedFile[] = [];

    for (const file of filesToProcess) {
      // Validate size
      if (file.size > maxSize) {
        console.error(`File ${file.name} exceeds max size`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const uploadedFile: UploadedFile = {
        id: tempId,
        file,
        url: preview,
        name: file.name,
        size: file.size,
        isPrimary: files.length === 0 && validFiles.length === 0,
        isUploading: !!onUpload,
      };

      validFiles.push(uploadedFile);
    }

    if (validFiles.length === 0) return;

    // Add files to state
    let updatedFiles = [...files, ...validFiles];
    onFilesChange?.(updatedFiles);

    // Upload files if handler provided
    if (onUpload) {
      for (const uploadedFile of validFiles) {
        if (!uploadedFile.file) continue;

        try {
          const result = await onUpload(uploadedFile.file);
          
          // Update file with server response
          updatedFiles = updatedFiles.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, id: result.id, url: result.url, isUploading: false }
              : f
          );
          onFilesChange?.(updatedFiles);
        } catch (error) {
          // Mark file as errored
          updatedFiles = updatedFiles.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, isUploading: false, error: 'Upload failed' }
              : f
          );
          onFilesChange?.(updatedFiles);
        }
      }
    }
  }, [files, maxFiles, maxSize, onFilesChange, onUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (id: string | number) => {
    if (onDelete) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Failed to delete file:', error);
        return;
      }
    }

    const updatedFiles = files.filter((f) => f.id !== id);
    
    // If removed file was primary, set first file as primary
    if (files.find((f) => f.id === id)?.isPrimary && updatedFiles.length > 0) {
      updatedFiles[0].isPrimary = true;
    }
    
    onFilesChange?.(updatedFiles);
  };

  const handleSetPrimary = (id: string | number) => {
    const updatedFiles = files.map((f) => ({
      ...f,
      isPrimary: f.id === id,
    }));
    onFilesChange?.(updatedFiles);
    onSetPrimary?.(id);
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedFiles = [...files];
    const [removed] = reorderedFiles.splice(draggedIndex, 1);
    reorderedFiles.splice(index, 0, removed);
    
    setDraggedIndex(index);
    onFilesChange?.(reorderedFiles);
    onReorder?.(reorderedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (name: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Drop zone */}
      {files.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition',
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50',
            compact && 'p-4'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-label="Upload file"
          />
          <Upload className={clsx('mx-auto text-slate-400', compact ? 'h-6 w-6' : 'h-10 w-10')} />
          <p className={clsx('mt-2 text-slate-300', compact && 'text-sm')}>
            <span className="font-medium text-emerald-400">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {accept.replace(/\*/g, 'all')} up to {formatFileSize(maxSize)}
            {maxFiles > 1 && ` (max ${maxFiles} files)`}
          </p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className={clsx('grid gap-3', compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}>
          {files.map((file, index) => (
            <div
              key={file.id}
              draggable={reorderable}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverItem(e, index)}
              className={clsx(
                'group relative overflow-hidden rounded-xl border bg-slate-800 transition',
                file.error
                  ? 'border-red-500/50'
                  : file.isPrimary
                  ? 'border-emerald-500'
                  : 'border-slate-700',
                draggedIndex === index && 'opacity-50'
              )}
            >
              {/* Preview */}
              <div className="aspect-square">
                {isImage(file.name) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-700">
                    <File className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {/* Top actions */}
                <div className="flex justify-between">
                  {reorderable && (
                    <div className="cursor-grab text-white">
                      <GripVertical className="h-5 w-5" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.id);
                    }}
                    className="rounded-lg bg-red-500/80 p-1 text-white hover:bg-red-500"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom info */}
                <div>
                  {showPrimary && !file.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(file.id);
                      }}
                      className="mb-2 flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
                    >
                      <Star className="h-3 w-3" />
                      Set as primary
                    </button>
                  )}
                  <p className="truncate text-xs text-white">{file.name}</p>
                  {file.size && (
                    <p className="text-xs text-slate-300">{formatFileSize(file.size)}</p>
                  )}
                </div>
              </div>

              {/* Primary badge */}
              {file.isPrimary && showPrimary && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                  <Star className="h-3 w-3" />
                  Primary
                </div>
              )}

              {/* Loading overlay */}
              {file.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}

              {/* Error overlay */}
              {file.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                  <p className="text-sm font-medium text-white">{file.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
