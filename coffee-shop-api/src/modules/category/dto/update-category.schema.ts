import { z } from 'zod';
import { createCategorySchema } from './create-category.schema.js';

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
