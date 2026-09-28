import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { Product } from '../entities/product.entity.js';
import { PRODUCT_REPOSITORY } from '../repositories/product-repository.interface.js';
import { CategoryService } from '../../category/services/category.service.js';
import { ProductImageService } from '../../product-image/services/product-image.service.js';
import { ProductVariantService } from '../../product-variant/services/product-variant.service.js';
import { ProductUnit } from '../../product-variant/enums/product-variant.enum.js';
import { ProductStatus } from '../enums/product.enum.js';

import type { Mock } from 'vitest';
describe('ProductService', () => {
  let service: ProductService;
  let productRepository: {
    findById: Mock;
    findByName: Mock;
    findAll: Mock;
    create: Mock;
    save: Mock;
  };
  let categoryService: { findOne: Mock };
  let productImageService: { create: Mock };
  let productVariantService: { create: Mock };

  const buildProduct = (overrides: Partial<Product> = {}): Product =>
    ({
      id: 'product-id-1',
      category: { id: 'category-id-1' },
      name: 'Espresso Blend',
      slug: 'espresso-blend',
      description: null,
      roastLevel: null,
      isOrganic: false,
      isFairTrade: false,
      status: 'DRAFT',
      tastingNotes: null,
      origin: null,
      processingMethod: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as Product;

  beforeEach(async () => {
    productRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };
    categoryService = { findOne: vi.fn() };
    productImageService = { create: vi.fn() };
    productVariantService = { create: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
        { provide: CategoryService, useValue: categoryService },
        { provide: ProductImageService, useValue: productImageService },
        { provide: ProductVariantService, useValue: productVariantService },
      ],
    }).compile();

    service = module.get(ProductService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createData = {
    categoryId: 'category-id-1',
    name: 'Espresso Blend',
  };

  describe('create', () => {
    it('creates and returns a product with a slug derived from the name', async () => {
      productRepository.findByName.mockResolvedValue(null);
      categoryService.findOne.mockResolvedValue({ id: 'category-id-1' });
      const created = buildProduct();
      productRepository.create.mockResolvedValue(created);

      const result = await service.create(createData);

      expect(categoryService.findOne).toHaveBeenCalledWith('category-id-1');
      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Espresso Blend',
          slug: 'espresso-blend',
        }),
      );
      expect(result).toBe(created);
    });

    it('creates the supplied images and variants against the new product id, then re-fetches the populated product', async () => {
      productRepository.findByName.mockResolvedValue(null);
      categoryService.findOne.mockResolvedValue({ id: 'category-id-1' });
      const created = buildProduct();
      const refetched = buildProduct();
      productRepository.create.mockResolvedValue(created);
      productRepository.findById.mockResolvedValue(refetched);

      const result = await service.create({
        ...createData,
        images: [{ url: 'https://example.com/a.jpg' }],
        variants: [
          {
            sku: 'SKU-1',
            weight: '250.000',
            unit: ProductUnit.G,
            price: '10.00',
          },
        ],
      });

      expect(productImageService.create).toHaveBeenCalledWith({
        productId: 'product-id-1',
        url: 'https://example.com/a.jpg',
      });
      expect(productVariantService.create).toHaveBeenCalledWith({
        productId: 'product-id-1',
        sku: 'SKU-1',
        weight: '250.000',
        unit: ProductUnit.G,
        price: '10.00',
      });
      expect(productRepository.findById).toHaveBeenCalledWith(
        'product-id-1',
        undefined,
      );
      expect(result).toBe(refetched);
    });

    it('does not re-fetch the product when no images or variants are supplied', async () => {
      productRepository.findByName.mockResolvedValue(null);
      categoryService.findOne.mockResolvedValue({ id: 'category-id-1' });
      const created = buildProduct();
      productRepository.create.mockResolvedValue(created);

      const result = await service.create(createData);

      expect(productRepository.findById).not.toHaveBeenCalled();
      expect(result).toBe(created);
    });

    it('throws ConflictException on a duplicate name, without persisting or calling image/variant services', async () => {
      productRepository.findByName.mockResolvedValue(buildProduct());

      await expect(service.create(createData)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(productRepository.create).not.toHaveBeenCalled();
      expect(productImageService.create).not.toHaveBeenCalled();
      expect(productVariantService.create).not.toHaveBeenCalled();
    });

    it('propagates a NotFoundException from CategoryService.findOne for an invalid category, without persisting', async () => {
      productRepository.findByName.mockResolvedValue(null);
      categoryService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createData)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('forwards the query to the repository and returns its result, unmodified', async () => {
      const paginated = {
        data: [buildProduct()],
        meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 1 },
      };
      productRepository.findAll.mockResolvedValue(paginated);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(productRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        {},
        undefined,
      );
      expect(result).toBe(paginated);
    });

    it('forwards supplied filters to the repository', async () => {
      const paginated = {
        data: [buildProduct()],
        meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 1 },
      };
      productRepository.findAll.mockResolvedValue(paginated);
      const filters = { categoryId: 'category-id-1' };

      await service.findAll({ page: 1, limit: 10 }, filters);

      expect(productRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        filters,
        undefined,
      );
    });

    it('forwards includeDeleted options to the repository', async () => {
      const paginated = {
        data: [buildProduct()],
        meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 1 },
      };
      productRepository.findAll.mockResolvedValue(paginated);

      await service.findAll(
        { page: 1, limit: 10 },
        {},
        { includeDeleted: true },
      );

      expect(productRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        {},
        { includeDeleted: true },
      );
    });
  });

  describe('findOne', () => {
    it('returns an existing product', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);

      const result = await service.findOne('product-id-1');

      expect(result).toBe(product);
    });

    it('throws NotFoundException when the repository has no match', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('does not re-check name uniqueness or re-validate the category when those fields are unchanged', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);

      await service.update('product-id-1', { description: 'Updated' });

      expect(productRepository.findByName).not.toHaveBeenCalled();
      expect(categoryService.findOne).not.toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(product);
    });

    it('throws ConflictException when the new name collides with another product', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);
      productRepository.findByName.mockResolvedValue(
        buildProduct({ id: 'other-product-id', name: 'Other' }),
      );

      await expect(
        service.update('product-id-1', { name: 'Other' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('does not throw when the colliding row is the product being updated itself', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);
      productRepository.findByName.mockResolvedValue(product);

      const result = await service.update('product-id-1', {
        name: 'Espresso Blend',
      });

      expect(result).toBe(product);
      expect(productRepository.save).toHaveBeenCalledWith(product);
    });

    it('re-validates the category via CategoryService.findOne when categoryId changes', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);
      categoryService.findOne.mockResolvedValue({ id: 'category-id-2' });

      await service.update('product-id-1', { categoryId: 'category-id-2' });

      expect(categoryService.findOne).toHaveBeenCalledWith('category-id-2');
    });

    it('throws NotFoundException for a missing id', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { description: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('sets deletedAt, archives the status, saves the product, and does not call image/variant services', async () => {
      const product = buildProduct();
      productRepository.findById.mockResolvedValue(product);

      await service.remove('product-id-1');

      expect(product.deletedAt).toBeInstanceOf(Date);
      expect(product.status).toBe(ProductStatus.ARCHIVED);
      expect(productRepository.save).toHaveBeenCalledWith(product);
      expect(productImageService.create).not.toHaveBeenCalled();
      expect(productVariantService.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a missing id', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });
});
