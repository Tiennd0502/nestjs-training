import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { AuthUser } from '@/decorators/auth-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './user.entity';

type AuthenticatedUser = { userId: number; email: string };

function toResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertSelf(id: number, currentUser: AuthenticatedUser): void {
  if (id !== currentUser.userId) {
    throw new ForbiddenException('Cannot act on another user');
  }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse()
  async findMe(@AuthUser() currentUser: AuthenticatedUser) {
    const user = await this.userService.getById(currentUser.userId);
    return toResponse(user);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Cannot act on another user' })
  @ApiNotFoundResponse()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: AuthenticatedUser,
  ) {
    assertSelf(id, currentUser);
    const user = await this.userService.getById(id);
    return toResponse(user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiForbiddenResponse({ description: 'Cannot act on another user' })
  @ApiNotFoundResponse()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    assertSelf(id, currentUser);
    const user = await this.userService.update(id, dto);
    return toResponse(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'Cannot act on another user' })
  @ApiNotFoundResponse()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: AuthenticatedUser,
  ) {
    assertSelf(id, currentUser);
    await this.userService.delete(id);
  }
}
