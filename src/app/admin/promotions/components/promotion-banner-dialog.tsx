"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface PromotionBannerDialogProps {
  src: string;
  alt: string;
  className?: string;
}

export function PromotionBannerDialog({
  src,
  alt,
  className,
}: PromotionBannerDialogProps) {
  if (!src) {
    return (
      <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
        Sem imagem
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
            width={64}
            height={48}
            className={`rounded-md object-cover w-16 h-12 ${className || ""}`}
            unoptimized
          />
        </button>
      </DialogTrigger>
      <DialogContent className="min-w-[50vw] p-1 overflow-hidden border-none flex items-center justify-center backdrop-blur-sm shadow-none sm:rounded-lg">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">{alt}</DialogDescription>
        <div className="relative w-full aspect-video max-h-[80vh]">
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
