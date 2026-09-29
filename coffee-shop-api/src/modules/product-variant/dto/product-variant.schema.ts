import { z } from 'zod';
import { VALIDATION_RULES } from '../../../common/constants/validation.constant.js';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum.js';

// weight, price and discountValue are decimal columns held as strings, so the
// schema hands the service the string form of the number it validated.
const decimal = z.coerce.number().positive().transform(String);

export const createProductVariantSchema = z.object({
  sku: z
    .string()
    .min(VALIDATION_RULES.SKU.MIN_LENGTH)
    .max(VALIDATION_RULES.SKU.MAX_LENGTH),
  weight: decimal,
  unit: z.enum(ProductUnit),
  price: decimal,
  discountType: z.enum(DiscountType).nullable().optional(),
  discountValue: decimal.nullable().optional(),
  quantity: z.int().min(VALIDATION_RULES.QUANTITY.MIN).optional(),
});

export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
