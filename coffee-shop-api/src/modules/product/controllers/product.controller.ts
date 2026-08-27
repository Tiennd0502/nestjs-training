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
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ResponseProductDto } from '../dto/response-product.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from '../../../common/decorators/api-response.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiPaginatedResponse(ResponseProductDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedResult<ResponseProductDto>> {
    const {
      page,
      limit,
      search,
      categoryId,
      status,
      roastLevel,
      minPrice,
      maxPrice,
      sortBy,
    } = query;
    const result = await this.productService.findAll(
      { page, limit, search },
      {
        categoryId,
        status,
        roastLevels: roastLevel,
        minPrice,
        maxPrice,
        sortBy,
      },
    );

    return {
      data: result.data.map((product) =>
        ResponseProductDto.fromEntity(product),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiDataResponse(HttpStatus.OK, ResponseProductDto)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT.NOT_FOUND)
  async findOne(@Param('id') id: string): Promise<ResponseProductDto> {
    const product = await this.productService.findOne(id);
    return ResponseProductDto.fromEntity(product);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (admin only)' })
  @ApiDataResponse(HttpStatus.CREATED, ResponseProductDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY.NOT_FOUND)
  @ApiErrorResponse(HttpStatus.CONFLICT, ERROR_MESSAGES.PRODUCT.NAME_EXISTS)
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiDataResponse(HttpStatus.OK, ResponseProductDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT.NOT_FOUND)
  @ApiErrorResponse(HttpStatus.CONFLICT, ERROR_MESSAGES.PRODUCT.NAME_EXISTS)
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiNoContentResponse({ description: 'Product deleted' })
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT.NOT_FOUND)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.remove(id);
  }
}
