import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ResponseProductDto } from '../dto/response-product.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<ResponseProductDto>> {
    const result = await this.productService.findAll(query);

    return {
      data: result.data.map((product) =>
        ResponseProductDto.fromEntity(product),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseProductDto> {
    const product = await this.productService.findOne(id);
    return ResponseProductDto.fromEntity(product);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async create(@Body() dto: CreateProductDto): Promise<ResponseProductDto> {
    const product = await this.productService.create({
      ...dto,
      variants: dto.variants?.map((variant) => ({
        ...variant,
        weight: String(variant.weight),
        price: String(variant.price),
        discountValue:
          variant.discountValue === undefined || variant.discountValue === null
            ? variant.discountValue
            : String(variant.discountValue),
      })),
    });
    return ResponseProductDto.fromEntity(product);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.update(id, dto);
    return ResponseProductDto.fromEntity(product);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }
}
