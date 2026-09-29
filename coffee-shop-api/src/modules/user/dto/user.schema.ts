import { z } from 'zod';
import {
  paginationQuerySchema,
  type PaginationQueryInput,
} from '../../../common/dto/pagination.schema.js';
import { VALIDATION_RULES } from '../../../common/constants/validation.constant.js';
import { UserRole, UserStatus } from '../../../common/enums/user.enum.js';

export const createUserSchema = z.object({
  clerkId: z.string(),
  email: z.email(),
  firstName: z.string().min(VALIDATION_RULES.NAME.MIN_LENGTH),
  lastName: z.string().min(VALIDATION_RULES.NAME.MIN_LENGTH),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.enum(UserRole).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .omit({ clerkId: true, email: true })
  .partial()
  .extend({ status: z.enum(UserStatus).optional() });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = paginationQuerySchema.extend({
  role: z.enum(UserRole).optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;

export type UserFilters = Omit<UserQueryInput, keyof PaginationQueryInput>;
