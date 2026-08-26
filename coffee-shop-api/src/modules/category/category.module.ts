import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { Category } from './entities/category.entity';
import { CATEGORY_REPOSITORY } from './repositories/category-repository.interface';
import { MikroOrmCategoryRepository } from './repositories/mikro-orm-category.repository';

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
