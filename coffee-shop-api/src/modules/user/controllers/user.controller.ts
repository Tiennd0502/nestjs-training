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
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  async create(@Body() dto: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.userService.create(dto);
    return ResponseUserDto.fromEntity(user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<ResponseUserDto>> {
    const result = await this.userService.findAll(query);
    return {
      data: result.data.map((user) => ResponseUserDto.fromEntity(user)),
      meta: result.meta,
    };
  }

  // Must stay declared before the `:id` route below — Nest/Express matches routes in
  // declaration order, so `:id` would otherwise swallow `/users/me` as `id: 'me'`.
  @Get('me')
  getCurrentUser(@AuthUser() user: User): ResponseUserDto {
    return ResponseUserDto.fromEntity(user);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
  async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    const user = await this.userService.findOne(id);
    return ResponseUserDto.fromEntity(user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([UserRole.ADMIN])
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
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.softDelete(id);
  }
}
