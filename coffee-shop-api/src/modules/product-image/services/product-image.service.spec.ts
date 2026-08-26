import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImage } from '../entities/product-image.entity';
import { PRODUCT_IMAGE_REPOSITORY } from '../repositories/product-image-repository.interface';

describe('ProductImageService', () => {
  let service: ProductImageService;
  let productImageRepository: {
    findById: jest.Mock;
    findAllByProduct: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const buildImage = (overrides: Partial<ProductImage> = {}): ProductImage =>
    ({
      id: 'image-id-1',
      url: 'https://example.com/image.jpg',
      isPrimary: false,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as ProductImage;

  beforeEach(async () => {
    productImageRepository = {
      findById: jest.fn(),
      findAllByProduct: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductImageService,
        { provide: PRODUCT_IMAGE_REPOSITORY, useValue: productImageRepository },
      ],
    }).compile();

    service = module.get(ProductImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns an image', async () => {
      const created = buildImage();
      productImageRepository.create.mockResolvedValue(created);

      const data = {
        productId: 'product-id-1',
        url: 'https://example.com/image.jpg',
      };
      const result = await service.create(data);

      expect(productImageRepository.create).toHaveBeenCalledWith(data);
      expect(result).toBe(created);
    });
  });

  describe('findAllByProduct', () => {
    it('forwards the product id to the repository and returns its result, unmodified', async () => {
      const images = [buildImage()];
      productImageRepository.findAllByProduct.mockResolvedValue(images);

      const result = await service.findAllByProduct('product-id-1');

      expect(productImageRepository.findAllByProduct).toHaveBeenCalledWith(
        'product-id-1',
      );
      expect(result).toBe(images);
    });
  });

  describe('findOne', () => {
    it('returns an existing image', async () => {
      const image = buildImage();
      productImageRepository.findById.mockResolvedValue(image);

      const result = await service.findOne('image-id-1');

      expect(productImageRepository.findById).toHaveBeenCalledWith(
        'image-id-1',
      );
      expect(result).toBe(image);
    });

    it('throws NotFoundException when the repository has no match', async () => {
      productImageRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('sets deletedAt and saves the image', async () => {
      const image = buildImage();
      productImageRepository.findById.mockResolvedValue(image);

      await service.remove('image-id-1');

      expect(image.deletedAt).toBeInstanceOf(Date);
      expect(productImageRepository.save).toHaveBeenCalledWith(image);
    });

    it('throws NotFoundException for a missing id, without calling save', async () => {
      productImageRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(productImageRepository.save).not.toHaveBeenCalled();
    });
  });
});
