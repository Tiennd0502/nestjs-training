import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entities/product.entity';
import {
  CreateProductData,
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../repositories/product-repository.interface';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';
import { slugFrom } from '../../../common/utils/slug.util';
import { CategoryService } from '../../category/services/category.service';
import { ProductImageService } from '../../product-image/services/product-image.service';
import { CreateProductImageData } from '../../product-image/repositories/product-image-repository.interface';
import { ProductVariantService } from '../../product-variant/services/product-variant.service';
import { CreateProductVariantData } from '../../product-variant/repositories/product-variant-repository.interface';

export interface CreateProductWithCatalogData extends Omit<
  CreateProductData,
  'slug'
> {
  images?: Omit<CreateProductImageData, 'productId'>[];
  variants?: Omit<CreateProductVariantData, 'productId' | 'name'>[];
}

export interface UpdateProductData {
  categoryId?: string;
  name?: string;
  description?: string | null;
  roastLevel?: CreateProductData['roastLevel'];
  isOrganic?: boolean;
  isFairTrade?: boolean;
  status?: CreateProductData['status'];
  tastingNotes?: string | null;
  origin?: string | null;
  processingMethod?: string | null;
}

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
    private readonly productImageService: ProductImageService,
    private readonly productVariantService: ProductVariantService,
  ) {}

  async create(data: CreateProductWithCatalogData): Promise<Product> {
    const { images = [], variants = [], ...productData } = data;

    const existing = await this.productRepository.findByName(productData.name);
    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.PRODUCT.NAME_EXISTS);
    }

    await this.categoryService.findOne(productData.categoryId);

    const product = await this.productRepository.create({
      ...productData,
      slug: slugFrom(productData.name),
    });

    for (const image of images) {
      await this.productImageService.create({
        ...image,
        productId: product.id,
      });
    }

    for (const variant of variants) {
      await this.productVariantService.create({
        ...variant,
        productId: product.id,
      });
    }

    return images.length === 0 && variants.length === 0
      ? product
      : this.findOne(product.id);
  }

  findAll(query: QueryParams): Promise<PaginatedResult<Product>> {
    return this.productRepository.findAll(query);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    }

    return product;
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const product = await this.findOne(id);

    if (data.name !== undefined && data.name !== product.name) {
      const existing = await this.productRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(ERROR_MESSAGES.PRODUCT.NAME_EXISTS);
      }
    }

    const { categoryId, ...rest } = data;

    if (categoryId !== undefined && categoryId !== product.category.id) {
      await this.categoryService.findOne(categoryId);
      product.category = categoryId as unknown as Product['category'];
    }

    Object.assign(
      product,
      Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined),
      ),
    );
    if (rest.name !== undefined) {
      product.slug = slugFrom(rest.name);
    }

    await this.productRepository.save(product);

    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.productRepository.save(product);
  }
}
