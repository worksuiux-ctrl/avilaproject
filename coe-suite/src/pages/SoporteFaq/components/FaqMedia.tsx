interface FaqMediaProps {
  tipo: "imagen" | "video" | null;
  src?: string;
  alt?: string;
  poster?: string;
}

export function FaqMedia({ tipo, src, alt, poster }: FaqMediaProps) {
  if (!tipo || !src) return null;

  if (tipo === "imagen") {
    return (
      <div className="mt-4 rounded-corner-m overflow-hidden border border-[var(--color-neutro-200)]">
        <img src={src} alt={alt || "Imagen ilustrativa"} className="w-full h-auto" />
      </div>
    );
  }

  if (tipo === "video") {
    return (
      <div className="mt-4 rounded-corner-m overflow-hidden border border-[var(--color-neutro-200)]">
        <video
          src={src}
          poster={poster}
          controls
          className="w-full"
          title={alt || "Video explicativo"}
        />
      </div>
    );
  }

  return null;
}