"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

interface ProductImageDialogProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImageDialog({ src, alt, className }: ProductImageDialogProps) {
  if (!src) {
    return (
      <div className="size-10 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
        Sem foto
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="outline-none rounded-md overflow-hidden hover:opacity-80 active:scale-95 transition-all duration-200 block">
          <Image
            src={src}
            alt={alt}
            width={40}
            height={40}
            className={`rounded-md object-cover size-10 ${className || ""}`}
            unoptimized
          />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-1 overflow-hidden border-none flex items-center justify-center backdrop-blur-sm shadow-none sm:rounded-lg">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">{alt}</DialogDescription>
        <div className="relative w-full aspect-square max-h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
