import { Category } from '../entities/category.entity.js';

export class ResponseCategoryDto {
  id!: string;
  name!: string;
  slug!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  static fromEntity(category: Category): ResponseCategoryDto {
    const dto = new ResponseCategoryDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    dto.deletedAt = category.deletedAt;
    return dto;
  }
}
