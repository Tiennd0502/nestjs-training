import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoryService } from './services/category.service.js';
import { CategoryController } from './controllers/category.controller.js';
import { Category } from './entities/category.entity.js';
import { CATEGORY_REPOSITORY } from './repositories/category-repository.interface.js';
import { MikroOrmCategoryRepository } from './repositories/mikro-orm-category.repository.js';

@Module({
  imports: [MikroOrmModule.forFeature([Category])],
  providers: [
    CategoryService,
    { provide: CATEGORY_REPOSITORY, useClass: MikroOrmCategoryRepository },
  ],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
