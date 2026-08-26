import { Category } from '../entities/category.entity';

export class ResponseCategoryDto {
  id!: string;
  name!: string;
  slug!: string;
  createdAt!: Date;

  static fromEntity(category: Category): ResponseCategoryDto {
    const dto = new ResponseCategoryDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.slug = category.slug;
    dto.createdAt = category.createdAt;
    return dto;
  }
}
