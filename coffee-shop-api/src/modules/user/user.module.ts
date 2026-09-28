import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from './services/user.service.js';
import { UserController } from './controllers/user.controller.js';
import { User } from './entities/user.entity.js';
import { USER_REPOSITORY } from './repositories/user-repository.interface.js';
import { MikroOrmUserRepository } from './repositories/mikro-orm-user.repository.js';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: MikroOrmUserRepository },
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
