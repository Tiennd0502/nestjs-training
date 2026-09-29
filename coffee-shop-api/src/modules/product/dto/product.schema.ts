import { z } from 'zod';
import {
  paginationQuerySchema,
  type PaginationQueryInput,
} from '../../../common/dto/pagination.schema.js';
import { VALIDATION_RULES } from '../../../common/constants/validation.constant.js';
import {
  ProductSortBy,
  ProductStatus,
  RoastLevel,
} from '../enums/product.enum.js';
import { createProductImageSchema } from '../../product-image/dto/product-image.schema.js';
import { createProductVariantSchema } from '../../product-variant/dto/product-variant.schema.js';

export const createProductSchema = z.object({
  categoryId: z.uuid(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  description: z.string().nullish(),
  roastLevel: z.enum(RoastLevel).nullish(),
  isOrganic: z.boolean().optional(),
  isFairTrade: z.boolean().optional(),
  status: z.enum(ProductStatus).optional(),
  tastingNotes: z.string().nullish(),
  origin: z.string().nullish(),
  processingMethod: z.string().nullish(),
  images: z
    .array(createProductImageSchema)
    .max(VALIDATION_RULES.IMAGE.MAX_COUNT)
    .optional(),
  variants: z.array(createProductVariantSchema).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema
  .omit({ images: true, variants: true })
  .partial()
  .extend({
    removeImageIds: z.array(z.uuid()).optional(),
    updateImages: z
      .array(createProductImageSchema.partial().extend({ id: z.uuid() }))
      .optional(),
    addImages: z.array(createProductImageSchema).optional(),
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// `?roastLevel=LIGHT,DARK` arrives as one comma-separated string.
const splitComma = (value: unknown): unknown =>
  typeof value === 'string' ? value.split(',') : value;

export const productQuerySchema = paginationQuerySchema.extend({
  categoryId: z.uuid().optional(),
  status: z.enum(ProductStatus).optional(),
  roastLevel: z.preprocess(splitComma, z.array(z.enum(RoastLevel))).optional(),
  minPrice: z.coerce.number().min(VALIDATION_RULES.PRICE.MIN).optional(),
  maxPrice: z.coerce.number().min(VALIDATION_RULES.PRICE.MIN).optional(),
  sortBy: z.enum(ProductSortBy).optional(),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;

export type ProductFilters = Omit<
  ProductQueryInput,
  keyof PaginationQueryInput
>;
