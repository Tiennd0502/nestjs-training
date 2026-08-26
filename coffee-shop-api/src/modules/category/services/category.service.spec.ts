import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
import { CATEGORY_REPOSITORY } from '../repositories/category-repository.interface';
import {
  DuplicateResourceException,
  ItemNotFoundException,
} from '../../../common/exceptions/base.exception';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: {
    findById: jest.Mock;
    findByName: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const buildCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'category-id-1',
    name: 'Espresso',
    slug: 'espresso',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    categoryRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    service = module.get(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns a category with a slug derived from the name', async () => {
      categoryRepository.findByName.mockResolvedValue(null);
      const created = buildCategory();
      categoryRepository.create.mockResolvedValue(created);

      const result = await service.create({ name: 'Espresso' });

      expect(categoryRepository.findByName).toHaveBeenCalledWith('Espresso', {
        includeDeleted: true,
      });
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Espresso',
        slug: 'espresso',
      });
      expect(result).toBe(created);
    });

    it('throws DuplicateResourceException when the name already exists, including soft-deleted rows', async () => {
      categoryRepository.findByName.mockResolvedValue(buildCategory());

      await expect(service.create({ name: 'Espresso' })).rejects.toBeInstanceOf(
        DuplicateResourceException,
      );
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('forwards the query and options to the repository and returns its result, unmodified', async () => {
      const paginated = {
        data: [buildCategory()],
        meta: { limit: 10, currentPage: 1, pageCount: 1, totalCount: 1 },
      };
      categoryRepository.findAll.mockResolvedValue(paginated);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        { includeDeleted: true },
      );

      expect(categoryRepository.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        { includeDeleted: true },
      );
      expect(result).toBe(paginated);
    });
  });

  describe('findOne', () => {
    it('returns an existing category', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);

      const result = await service.findOne('category-id-1');

      expect(categoryRepository.findById).toHaveBeenCalledWith(
        'category-id-1',
        undefined,
      );
      expect(result).toBe(category);
    });

    it('throws ItemNotFoundException when the repository has no match', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
        ItemNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('regenerates the slug and re-checks uniqueness when the name changes', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);
      categoryRepository.findByName.mockResolvedValue(null);

      const result = await service.update('category-id-1', {
        name: 'Cold Brew',
      });

      expect(categoryRepository.findByName).toHaveBeenCalledWith('Cold Brew', {
        includeDeleted: true,
      });
      expect(category.name).toBe('Cold Brew');
      expect(category.slug).toBe('cold-brew');
      expect(categoryRepository.save).toHaveBeenCalledWith(category);
      expect(result).toBe(category);
    });

    it('does not touch the slug or re-check uniqueness when the name is unchanged', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);

      await service.update('category-id-1', { name: 'Espresso' });

      expect(categoryRepository.findByName).not.toHaveBeenCalled();
      expect(category.slug).toBe('espresso');
    });

    it('throws DuplicateResourceException when the new name collides with another category', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);
      categoryRepository.findByName.mockResolvedValue(
        buildCategory({ id: 'other-category-id', name: 'Cold Brew' }),
      );

      await expect(
        service.update('category-id-1', { name: 'Cold Brew' }),
      ).rejects.toBeInstanceOf(DuplicateResourceException);
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });

    it('does not throw when the colliding row is the category being updated itself', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);
      categoryRepository.findByName.mockResolvedValue(category);

      const result = await service.update('category-id-1', {
        name: 'Espresso Doppio',
      });

      expect(result).toBe(category);
      expect(categoryRepository.save).toHaveBeenCalledWith(category);
    });

    it('throws ItemNotFoundException for a missing id', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { name: 'Cold Brew' }),
      ).rejects.toBeInstanceOf(ItemNotFoundException);
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('sets deletedAt and saves the category', async () => {
      const category = buildCategory();
      categoryRepository.findById.mockResolvedValue(category);

      await service.remove('category-id-1');

      expect(category.deletedAt).toBeInstanceOf(Date);
      expect(categoryRepository.save).toHaveBeenCalledWith(category);
    });

    it('throws ItemNotFoundException for a missing id', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
        ItemNotFoundException,
      );
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });
  });
});
