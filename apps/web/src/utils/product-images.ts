import { uploadImageToImgBB } from '@/services/image'

export type UploadProductImagesResult =
  | { ok: true; primaryUrl: string | null; galleryUrls: string[] }
  | { ok: false; error: string }

/**
 * Uploads a newly picked primary image and new gallery files in parallel.
 * Only new files are uploaded; callers add the URLs they keep. When several
 * uploads fail, a gallery error is reported before the primary one.
 */
export async function uploadProductImages({
  primaryFile,
  galleryFiles,
}: {
  primaryFile: File | null
  galleryFiles: File[]
}): Promise<UploadProductImagesResult> {
  const [primaryUpload, galleryUploads] = await Promise.all([
    primaryFile ? uploadImageToImgBB(primaryFile) : null,
    Promise.all(galleryFiles.map((file) => uploadImageToImgBB(file))),
  ])

  const galleryUrls: string[] = []
  for (const upload of galleryUploads) {
    if (!upload.ok) return { ok: false, error: upload.error }
    galleryUrls.push(upload.url)
  }

  if (primaryUpload && !primaryUpload.ok) {
    return { ok: false, error: primaryUpload.error }
  }

  return { ok: true, primaryUrl: primaryUpload?.url ?? null, galleryUrls }
}
