import { Injectable } from '@nestjs/common';
import { Category } from '../entities/category.entity.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../dto/category.schema.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import type { FindOptions } from '../../../common/interfaces/repository-options.interface.js';
import {
  ERROR_MESSAGES,
  ERROR_DESCRIPTIONS,
} from '../../../common/constants/message.constant.js';
import { ERROR_CODES } from '../../../common/constants/error-code.constant.js';
import { PaginatedResult } from '../../../common/dto/pagination.dto.js';
import { QueryParams } from '../../../common/dto/query-params.dto.js';
import { slugFrom } from '../../../common/utils/slug.util.js';
import {
  DuplicateResourceException,
  ItemNotFoundException,
} from '../../../common/exceptions/base.exception.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findByName(dto.name, {
      includeDeleted: true,
    });
    if (existing) {
      throw new DuplicateResourceException({
        errCode: ERROR_CODES.CATEGORY.NAME_EXISTS,
        field: 'name',
        message: ERROR_MESSAGES.CATEGORY.NAME_EXISTS,
        description: ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS,
      });
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
      throw new ItemNotFoundException({
        errCode: ERROR_CODES.CATEGORY.NOT_FOUND,
        field: 'id',
        message: ERROR_MESSAGES.CATEGORY.NOT_FOUND,
        description: ERROR_DESCRIPTIONS.CATEGORY.NOT_FOUND,
      });
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryInput): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name !== undefined && dto.name !== category.name) {
      const existing = await this.categoryRepository.findByName(dto.name, {
        includeDeleted: true,
      });
      if (existing && existing.id !== id) {
        throw new DuplicateResourceException({
          errCode: ERROR_CODES.CATEGORY.NAME_EXISTS,
          field: 'name',
          message: ERROR_MESSAGES.CATEGORY.NAME_EXISTS,
          description: ERROR_DESCRIPTIONS.CATEGORY.NAME_EXISTS,
        });
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
