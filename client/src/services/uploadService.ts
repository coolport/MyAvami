import { BASE_URL } from "./api";

export interface UploadedImage {
  filename: string;
  originalName: string;
  size: number;
  url: string;
}

/** Uploads an image file and returns its server URL. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result = await res.json().catch(() => null);

  if (!res.ok || !result?.success) {
    throw new Error(result?.message ?? "Failed to upload image");
  }

  return result.data as UploadedImage;
}
