"use client";

import Image from "next/image";
import { useState } from "react";
import { FiImage } from "react-icons/fi";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  className = "",
  sizes,
  fill = false,
  width,
  height,
  priority = false,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <div
        className={`${fill ? "absolute inset-0" : "size-11 shrink-0"} bg-paper text-muted grid place-items-center overflow-hidden rounded-xl p-1 text-center`}
        role="img"
        aria-label={`${alt || "Product"} image unavailable. Check Google Drive sharing access.`}
      >
        <span className="flex flex-col items-center gap-1 text-[9px] leading-tight">
          <FiImage aria-hidden="true" className="text-base" />
          Check image access
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      unoptimized
      onError={() => setFailedSrc(src)}
    />
  );
}
