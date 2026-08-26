import { ProductVariant } from '../entities/product-variant.entity';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

export class ResponseProductVariantDto {
  id!: string;
  sku!: string;
  weight!: number;
  unit!: ProductUnit;
  name!: string;
  price!: number;
  discountType: DiscountType | null = null;
  discountValue: number | null = null;
  quantity!: number;

  static fromEntity(variant: ProductVariant): ResponseProductVariantDto {
    const dto = new ResponseProductVariantDto();
    dto.id = variant.id;
    dto.sku = variant.sku;
    dto.weight = Number(variant.weight);
    dto.unit = variant.unit;
    dto.name = variant.name;
    dto.price = Number(variant.price);
    dto.discountType = variant.discountType;
    dto.discountValue =
      variant.discountValue === null ? null : Number(variant.discountValue);
    dto.quantity = variant.quantity;
    return dto;
  }
}
