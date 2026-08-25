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
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseUserDto } from '../dto/response-user.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.userService.create(dto);
    return ResponseUserDto.fromEntity(user);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<ResponseUserDto>> {
    const result = await this.userService.findAll(query);
    return {
      data: result.data.map((user) => ResponseUserDto.fromEntity(user)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    const user = await this.userService.findOne(id);
    return ResponseUserDto.fromEntity(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.update(id, dto);
    return ResponseUserDto.fromEntity(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.softDelete(id);
  }
}
