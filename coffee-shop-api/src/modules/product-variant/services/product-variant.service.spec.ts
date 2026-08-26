import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { ProductVariant } from '../entities/product-variant.entity';
import { PRODUCT_VARIANT_REPOSITORY } from '../repositories/product-variant-repository.interface';
import { ProductUnit } from '../enums/product-variant.enum';

describe('ProductVariantService', () => {
  let service: ProductVariantService;
  let productVariantRepository: {
    findById: jest.Mock;
    findBySku: jest.Mock;
    findAllByProduct: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const buildVariant = (
    overrides: Partial<ProductVariant> = {},
  ): ProductVariant =>
    ({
      id: 'variant-id-1',
      sku: 'SKU-1',
      weight: '250.000',
      unit: ProductUnit.G,
      name: '250g - Whole Bean',
      price: '10.00',
      discountType: null,
      discountValue: null,
      quantity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    }) as ProductVariant;

  beforeEach(async () => {
    productVariantRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAllByProduct: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantService,
        {
          provide: PRODUCT_VARIANT_REPOSITORY,
          useValue: productVariantRepository,
        },
      ],
    }).compile();

    service = module.get(ProductVariantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createData = {
    productId: 'product-id-1',
    sku: 'SKU-1',
    weight: '250.000',
    unit: ProductUnit.G,
    price: '10.00',
  };

  describe('create', () => {
    it('creates and returns a variant on a unique SKU, deriving name from weight + unit', async () => {
      productVariantRepository.findBySku.mockResolvedValue(null);
      const created = buildVariant();
      productVariantRepository.create.mockResolvedValue(created);

      const result = await service.create(createData);

      expect(productVariantRepository.findBySku).toHaveBeenCalledWith('SKU-1');
      expect(productVariantRepository.create).toHaveBeenCalledWith({
        ...createData,
        name: '250.000G',
      });
      expect(result).toBe(created);
    });

    it('throws ConflictException on a duplicate SKU', async () => {
      productVariantRepository.findBySku.mockResolvedValue(buildVariant());

      await expect(service.create(createData)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(productVariantRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByProduct', () => {
    it('forwards the product id and returns the repository result unmodified', async () => {
      const variants = [buildVariant()];
      productVariantRepository.findAllByProduct.mockResolvedValue(variants);

      const result = await service.findAllByProduct('product-id-1');

      expect(productVariantRepository.findAllByProduct).toHaveBeenCalledWith(
        'product-id-1',
      );
      expect(result).toBe(variants);
    });
  });

  describe('findOne', () => {
    it('returns an existing variant', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);

      const result = await service.findOne('variant-id-1');

      expect(result).toBe(variant);
    });

    it('throws NotFoundException when the repository has no match', async () => {
      productVariantRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('re-checks SKU uniqueness only when the SKU changes', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);

      await service.update('variant-id-1', { quantity: 5 });

      expect(productVariantRepository.findBySku).not.toHaveBeenCalled();
      expect(productVariantRepository.save).toHaveBeenCalledWith(variant);
    });

    it('recomputes name from weight + unit when weight changes', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);

      const result = await service.update('variant-id-1', {
        weight: '500.000',
      });

      expect(result.name).toBe('500.000G');
      expect(productVariantRepository.save).toHaveBeenCalledWith(variant);
    });

    it('recomputes name from weight + unit when unit changes', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);

      const result = await service.update('variant-id-1', {
        unit: ProductUnit.KG,
      });

      expect(result.name).toBe('250.000KG');
      expect(productVariantRepository.save).toHaveBeenCalledWith(variant);
    });

    it('throws ConflictException when the new SKU collides with another variant', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);
      productVariantRepository.findBySku.mockResolvedValue(
        buildVariant({ id: 'other-variant-id', sku: 'SKU-2' }),
      );

      await expect(
        service.update('variant-id-1', { sku: 'SKU-2' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(productVariantRepository.save).not.toHaveBeenCalled();
    });

    it('does not throw when the colliding row is the variant being updated itself', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);
      productVariantRepository.findBySku.mockResolvedValue(variant);

      const result = await service.update('variant-id-1', { sku: 'SKU-1' });

      expect(result).toBe(variant);
      expect(productVariantRepository.save).toHaveBeenCalledWith(variant);
    });

    it('throws NotFoundException for a missing id', async () => {
      productVariantRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { quantity: 5 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(productVariantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('sets deletedAt and saves the variant', async () => {
      const variant = buildVariant();
      productVariantRepository.findById.mockResolvedValue(variant);

      await service.remove('variant-id-1');

      expect(variant.deletedAt).toBeInstanceOf(Date);
      expect(productVariantRepository.save).toHaveBeenCalledWith(variant);
    });

    it('throws NotFoundException for a missing id', async () => {
      productVariantRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(productVariantRepository.save).not.toHaveBeenCalled();
    });
  });
});
