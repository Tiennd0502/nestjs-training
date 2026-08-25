import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { MikroOrmUserRepository } from './repositories/mikro-orm-user.repository';

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
