import { Product } from '../entities/product.entity';
import { RoastLevel, ProductStatus } from '../enums/product.enum';
import { ResponseProductImageDto } from '../../product-image/dto/response-product-image.dto';
import { ResponseProductVariantDto } from '../../product-variant/dto/response-product-variant.dto';

export class ResponseProductDto {
  id!: string;
  categoryId!: string;
  name!: string;
  slug!: string;
  description: string | null = null;
  roastLevel: RoastLevel | null = null;
  isOrganic!: boolean;
  isFairTrade!: boolean;
  status!: ProductStatus;
  tastingNotes: string | null = null;
  origin: string | null = null;
  processingMethod: string | null = null;
  createdAt!: Date;
  images!: ResponseProductImageDto[];
  variants!: ResponseProductVariantDto[];

  static fromEntity(product: Product): ResponseProductDto {
    const dto = new ResponseProductDto();
    dto.id = product.id;
    dto.categoryId = product.category.id;
    dto.name = product.name;
    dto.slug = product.slug;
    dto.description = product.description;
    dto.roastLevel = product.roastLevel;
    dto.isOrganic = product.isOrganic;
    dto.isFairTrade = product.isFairTrade;
    dto.status = product.status;
    dto.tastingNotes = product.tastingNotes;
    dto.origin = product.origin;
    dto.processingMethod = product.processingMethod;
    dto.createdAt = product.createdAt;
    dto.images = product.images
      .getItems()
      .map((image) => ResponseProductImageDto.fromEntity(image));
    dto.variants = product.variants
      .getItems()
      .map((variant) => ResponseProductVariantDto.fromEntity(variant));
    return dto;
  }
}
