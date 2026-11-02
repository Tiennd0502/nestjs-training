import { uploadImageToImgBB } from '@/services/image'
import { uploadProductImages } from '@/utils/product-images'

jest.mock('@/services/image', () => ({
  uploadImageToImgBB: jest.fn(),
}))

type UploadResult = Awaited<ReturnType<typeof uploadImageToImgBB>>

const image = (name: string) => new File(['x'], name, { type: 'image/png' })

const resultsByName = (results: Record<string, UploadResult>) =>
  jest
    .mocked(uploadImageToImgBB)
    .mockImplementation(async (file: File) => results[file.name])

describe('uploadProductImages', () => {
  beforeEach(() => {
    jest.mocked(uploadImageToImgBB).mockReset()
  })

  it('starts the primary and gallery uploads together', async () => {
    const pending = new Map<string, (result: UploadResult) => void>()
    jest.mocked(uploadImageToImgBB).mockImplementation(
      (file: File) =>
        new Promise<UploadResult>((resolve) => {
          pending.set(file.name, resolve)
        }),
    )

    const upload = uploadProductImages({
      primaryFile: image('p.png'),
      galleryFiles: [image('g1.png'), image('g2.png')],
    })

    expect(uploadImageToImgBB).toHaveBeenCalledTimes(3)
    pending.get('g2.png')?.({ ok: true, url: 'g2' })
    pending.get('p.png')?.({ ok: true, url: 'p' })
    pending.get('g1.png')?.({ ok: true, url: 'g1' })
    await expect(upload).resolves.toEqual({
      ok: true,
      primaryUrl: 'p',
      galleryUrls: ['g1', 'g2'],
    })
  })

  it('returns the gallery error when both uploads fail', async () => {
    resultsByName({
      'p.png': { ok: false, error: 'primary failed' },
      'g.png': { ok: false, error: 'gallery failed' },
    })

    await expect(
      uploadProductImages({
        primaryFile: image('p.png'),
        galleryFiles: [image('g.png')],
      }),
    ).resolves.toEqual({ ok: false, error: 'gallery failed' })
  })

  it('returns the primary error when only the primary upload fails', async () => {
    resultsByName({
      'p.png': { ok: false, error: 'primary failed' },
      'g.png': { ok: true, url: 'g' },
    })

    await expect(
      uploadProductImages({
        primaryFile: image('p.png'),
        galleryFiles: [image('g.png')],
      }),
    ).resolves.toEqual({ ok: false, error: 'primary failed' })
  })

  it('uploads only gallery files when there is no new primary image', async () => {
    resultsByName({
      'g1.png': { ok: true, url: 'g1' },
      'g2.png': { ok: true, url: 'g2' },
    })

    await expect(
      uploadProductImages({
        primaryFile: null,
        galleryFiles: [image('g1.png'), image('g2.png')],
      }),
    ).resolves.toEqual({
      ok: true,
      primaryUrl: null,
      galleryUrls: ['g1', 'g2'],
    })
    expect(uploadImageToImgBB).toHaveBeenCalledTimes(2)
  })
})
