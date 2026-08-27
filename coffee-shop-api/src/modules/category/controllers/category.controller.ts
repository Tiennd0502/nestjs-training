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
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ResponseCategoryDto } from '../dto/response-category.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthUser } from '../../../common/decorators/auth-user.decorator';
import {
  ApiDataResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from '../../../common/decorators/api-response.decorator';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';
import { User } from '../../user/entities/user.entity';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';

const isActiveAdmin = (user?: User): boolean =>
  user?.role === UserRole.ADMIN &&
  (user.status as UserStatus) === UserStatus.ACTIVE;

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiPaginatedResponse(ResponseCategoryDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  async findAll(
    @Query() query: PaginationQueryDto,
    @AuthUser() user?: User,
  ): Promise<PaginatedResult<ResponseCategoryDto>> {
    const result = await this.categoryService.findAll(query, {
      includeDeleted: isActiveAdmin(user),
    });

    return {
      data: result.data.map((category) =>
        ResponseCategoryDto.fromEntity(category),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiDataResponse(HttpStatus.OK, ResponseCategoryDto)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY.NOT_FOUND)
  async findOne(
    @Param('id') id: string,
    @AuthUser() user?: User,
  ): Promise<ResponseCategoryDto> {
    const category = await this.categoryService.findOne(id, {
      includeDeleted: isActiveAdmin(user),
    });

    return ResponseCategoryDto.fromEntity(category);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (admin only)' })
  @ApiDataResponse(HttpStatus.CREATED, ResponseCategoryDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.CONFLICT, ERROR_MESSAGES.CATEGORY.NAME_EXISTS)
  async create(@Body() dto: CreateCategoryDto): Promise<ResponseCategoryDto> {
    const category = await this.categoryService.create(dto);
    return ResponseCategoryDto.fromEntity(category);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiDataResponse(HttpStatus.OK, ResponseCategoryDto)
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
  @ApiErrorResponse(HttpStatus.CONFLICT, ERROR_MESSAGES.CATEGORY.NAME_EXISTS)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ResponseCategoryDto> {
    const category = await this.categoryService.update(id, dto);
    return ResponseCategoryDto.fromEntity(category);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiNoContentResponse({ description: 'Category deleted' })
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.CATEGORY.NOT_FOUND)
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}
