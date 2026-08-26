import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
  type FindOptions,
} from '../repositories/category-repository.interface';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';
import {
  PaginatedResult,
  QueryParams,
} from '../../../common/interfaces/pagination.interface';
import { slugFrom } from '../../../common/utils/slug.util';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findByName(dto.name, {
      includeDeleted: true,
    });
    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY.NAME_EXISTS);
    }

    return this.categoryRepository.create({
      name: dto.name,
      slug: slugFrom(dto.name),
    });
  }

  findAll(
    query: QueryParams,
    options?: FindOptions,
  ): Promise<PaginatedResult<Category>> {
    return this.categoryRepository.findAll(query, options);
  }

  async findOne(id: string, options?: FindOptions): Promise<Category> {
    const category = await this.categoryRepository.findById(id, options);
    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name !== undefined && dto.name !== category.name) {
      const existing = await this.categoryRepository.findByName(dto.name, {
        includeDeleted: true,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(ERROR_MESSAGES.CATEGORY.NAME_EXISTS);
      }

      category.name = dto.name;
      category.slug = slugFrom(dto.name);
    }

    await this.categoryRepository.save(category);

    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
  }
}
