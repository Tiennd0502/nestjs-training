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
import { ProductService } from '../services/product.service.js';
import {
  createProductSchema,
  type CreateProductInput,
  updateProductSchema,
  type UpdateProductInput,
  productQuerySchema,
  type ProductQueryInput,
} from '../dto/product.schema.js';
import { ResponseProductDto } from '../dto/response-product.dto.js';
import { PaginatedResult } from '../../../common/dto/pagination.dto.js';
import {
  idParamSchema,
  type IdParam,
} from '../../../common/dto/id-param.schema.js';
import { AuthGuard } from '../../../common/guards/auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { AuthUser } from '../../../common/decorators/auth-user.decorator.js';
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from '../../../common/decorators/api-response.decorator.js';
import { UserRole, UserStatus } from '../../../common/enums/user.enum.js';
import { User } from '../../user/entities/user.entity.js';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant.js';

const isActiveAdmin = (user?: User): boolean =>
  user?.role === UserRole.ADMIN &&
  (user.status as UserStatus) === UserStatus.ACTIVE;

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
    @Query({ schema: productQuerySchema }) query: ProductQueryInput,
    @AuthUser() user?: User,
  ): Promise<PaginatedResult<ResponseProductDto>> {
    const { page, limit, search, ...filters } = query;
    const result = await this.productService.findAll(
      { page, limit, search },
      filters,
      { includeDeleted: isActiveAdmin(user) },
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
  async findOne(
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @AuthUser() user?: User,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.findOne(id, {
      includeDeleted: isActiveAdmin(user),
    });
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
  async create(
    @Body({ schema: createProductSchema }) dto: CreateProductInput,
  ): Promise<ResponseProductDto> {
    const product = await this.productService.create(dto);
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
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @Body({ schema: updateProductSchema }) dto: UpdateProductInput,
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
  async remove(
    @Param({ schema: idParamSchema }) { id }: IdParam,
  ): Promise<void> {
    await this.productService.remove(id);
  }
}
