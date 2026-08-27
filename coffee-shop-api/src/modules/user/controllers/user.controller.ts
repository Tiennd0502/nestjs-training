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
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseUserDto } from '../dto/response-user.dto';
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
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../entities/user.entity';
import { ERROR_MESSAGES } from '../../../common/constants/message.constant';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a user (admin only)' })
  @ApiDataResponse(HttpStatus.CREATED, ResponseUserDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(
    HttpStatus.CONFLICT,
    `${ERROR_MESSAGES.USER.EMAIL_EXISTS} / ${ERROR_MESSAGES.USER.CLERK_ID_EXISTS}`,
  )
  async create(@Body() dto: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.userService.create(dto);
    return ResponseUserDto.fromEntity(user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'List users (admin only)' })
  @ApiPaginatedResponse(ResponseUserDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.USER.PAGE_OUT_OF_RANGE,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<ResponseUserDto>> {
    const result = await this.userService.findAll(query);
    return {
      data: result.data.map((user) => ResponseUserDto.fromEntity(user)),
      meta: result.meta,
    };
  }

  @Get('me')
  @ApiOperation({
    summary:
      'Get the currently authenticated user (any authenticated user, not just admin)',
  })
  @ApiDataResponse(HttpStatus.OK, ResponseUserDto)
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  getCurrentUser(@AuthUser() user: User): ResponseUserDto {
    return ResponseUserDto.fromEntity(user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Get a user by id (admin only)' })
  @ApiDataResponse(HttpStatus.OK, ResponseUserDto)
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER.NOT_FOUND)
  async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    const user = await this.userService.findOne(id);
    return ResponseUserDto.fromEntity(user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update a user (admin only)' })
  @ApiDataResponse(HttpStatus.OK, ResponseUserDto)
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    ERROR_MESSAGES.EXCEPTION.VALIDATION_FAILED,
  )
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER.NOT_FOUND)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.update(id, dto);
    return ResponseUserDto.fromEntity(user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user (admin only)' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    ERROR_MESSAGES.AUTH.UNAUTHENTICATED,
  )
  @ApiErrorResponse(HttpStatus.FORBIDDEN, ERROR_MESSAGES.AUTH.FORBIDDEN)
  @ApiErrorResponse(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER.NOT_FOUND)
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.softDelete(id);
  }
}
