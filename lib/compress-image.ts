/**
 * Reduce una foto de celular a un tamaño razonable para adjuntar por correo,
 * en el propio navegador — nunca sube el archivo original de 8-15 MB que
 * entrega una cámara moderna. Mismo criterio de "no ampliar más allá de lo
 * necesario" que ya usa el servidor (ver Lightbox.tsx, MAX_PHOTO_PX), pero
 * aquí corre en el cliente porque el archivo nace ahí.
 *
 * Si el archivo ya es pequeño (por debajo de `skipBelowBytes`), se devuelve
 * tal cual: comprimir una foto que ya pesa poco solo gasta batería sin
 * ahorrar nada.
 */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 900 * 1024; // 900 KB

export async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_BELOW_BYTES) return file;
  if (typeof window === "undefined" || typeof document === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Formato que el navegador no puede decodificar (HEIC en algunos
    // navegadores de escritorio, por ejemplo): se envía el original y que
    // lo valide el servidor — mejor que bloquear el envío por completo.
    return file;
  }
}
