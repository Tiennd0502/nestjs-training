import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    const user = this.userRepository.create(data);
    await this.em.persistAndFlush(user);
    return user;
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email });
  }

  async getById(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already registered');
      }
      user.email = dto.email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    await this.em.flush();
    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.getById(id);
    await this.em.removeAndFlush(user);
  }
}
