'use client';

import { cn } from '@/lib/utils';
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export type UploadDropzoneProps = {
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number; // padrão: 5 MB
  accept?: string;
  disabled?: boolean;
  className?: string;
  initialPreviewUrl?: string;
};

export function UploadDropzone({
  files: controlledFiles,
  onFilesChange,
  maxFiles = 4,
  maxFileSizeMB = 5,
  accept = 'image/*',
  disabled = false,
  className,
  initialPreviewUrl,
}: UploadDropzoneProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledFiles !== undefined;
  const currentFiles = isControlled ? controlledFiles : internalFiles;

  const updateFiles = (nextFiles: File[]) => {
    if (!isControlled) {
      setInternalFiles(nextFiles);
    }
    onFilesChange?.(nextFiles);
  };

  const validateAndAddFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const validImages: File[] = [];

    for (const file of list) {
      // Valida tipo
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" não é uma imagem válida.`);
        continue;
      }

      // Valida tamanho
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" excede o tamanho máximo de ${maxFileSizeMB}MB.`);
        continue;
      }

      validImages.push(file);
    }

    if (validImages.length === 0) return;

    const availableSlots = Math.max(0, maxFiles - currentFiles.length);
    if (availableSlots <= 0) {
      toast.warning(`Limite de ${maxFiles} imagem(ns) já atingido.`);
      return;
    }

    const toAdd = validImages.slice(0, availableSlots);
    if (validImages.length > availableSlots) {
      toast.info(`Apenas ${availableSlots} arquivo(s) foram adicionados devido ao limite.`);
    }

    updateFiles([...currentFiles, ...toAdd]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const next = currentFiles.filter((_, idx) => idx !== indexToRemove);
    updateFiles(next);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reseta o input para permitir selecionar o mesmo arquivo novamente se desejar
    e.target.value = '';
  };

  const openFilePicker = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const remainingSlots = maxFiles - currentFiles.length;

  return (
    <div className={cn('w-full min-w-0 max-w-full space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ESTADO 1: Nenhuma imagem selecionada ainda */}
      {currentFiles.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={cn(
            'group relative flex min-h-52 w-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/20 p-6 text-center transition-all',
            'hover:border-primary/80 hover:bg-muted/40',
            {
              'border-primary bg-primary/10 ring-2 ring-primary/20': isDragging,
              'cursor-not-allowed opacity-60 pointer-events-none': disabled,
            }
          )}
        >
          {initialPreviewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative size-24 overflow-hidden rounded-lg border border-border shadow-xs">
                <img
                  src={initialPreviewUrl}
                  alt="Imagem atual"
                  className="size-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Imagem atual cadastrada. Clique ou arraste para substituir.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Upload className="size-7" />
              </div>

              <p className="text-sm font-semibold text-foreground">
                Arraste imagens aqui ou clique para selecionar
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, WEBP ou GIF (até {maxFileSizeMB}MB)
              </p>

              {maxFiles > 1 && (
                <span className="mt-2 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  Você pode selecionar até {maxFiles} imagens
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ESTADO 2: Preview das imagens selecionadas */
        <div className="w-full min-w-0 space-y-3">
          {/* Se for apenas 1 arquivo: Exibe preview ampliado com destaque */}
          {maxFiles === 1 ? (
            <SingleImagePreview
              file={currentFiles[0]}
              onRemove={() => handleRemoveFile(0)}
              onChangeImage={openFilePicker}
              formatBytes={formatBytes}
              disabled={disabled}
            />
          ) : (
            /* Se for múltiplas imagens: Exibe grid de miniaturas */
            <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
              {currentFiles.map((file, idx) => (
                <MultiImagePreviewItem
                  key={`${file.name}-${file.size}-${idx}`}
                  file={file}
                  onRemove={() => handleRemoveFile(idx)}
                  formatBytes={formatBytes}
                  disabled={disabled}
                />
              ))}

              {/* Botão de adicionar mais se ainda houver slots */}
              {remainingSlots > 0 && !disabled && (
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-3 text-center transition-colors hover:border-primary/80 hover:bg-accent/40"
                >
                  <Plus className="mb-1 size-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Adicionar mais</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({currentFiles.length}/{maxFiles})
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Subcomponente de preview ampliado para quando maxFiles === 1
function SingleImagePreview({
  file,
  onRemove,
  onChangeImage,
  formatBytes,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  onChangeImage: () => void;
  formatBytes: (bytes: number) => string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-xs">
      <div className="relative flex h-64 w-full max-w-full items-center justify-center overflow-hidden bg-black/10 p-2 dark:bg-black/40">
        {url ? (
          <img
            src={url}
            alt={file.name}
            className="max-h-full max-w-full rounded-md object-contain"
          />
        ) : (
          <ImageIcon className="size-10 text-muted-foreground" />
        )}

        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110 focus:outline-none"
            title="Remover imagem"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <div className="flex w-full min-w-0 items-center justify-between border-t border-border bg-card p-3">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-xs font-semibold text-foreground">
            {file.name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatBytes(file.size)}
          </p>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={onChangeImage}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Trocar imagem
          </button>
        )}
      </div>
    </div>
  );
}

// Subcomponente para cada item do grid quando há múltiplas imagens
function MultiImagePreviewItem({
  file,
  onRemove,
  formatBytes,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  formatBytes: (bytes: number) => string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/40 shadow-xs transition-all hover:border-primary/50">
      {url ? (
        <img
          src={url}
          alt={file.name}
          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 transition-opacity group-hover:opacity-90" />

      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-transform hover:scale-110"
          title="Remover"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 text-left">
        <p className="truncate text-xs font-medium text-white drop-shadow-sm">
          {file.name}
        </p>
        <p className="text-[10px] text-white/80 drop-shadow-sm">
          {formatBytes(file.size)}
        </p>
      </div>
    </div>
  );
}
