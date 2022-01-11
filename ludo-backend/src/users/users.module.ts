import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from './user.provider'
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
  controllers: [UsersController],
  imports: [DatabaseModule]
})
export class UsersModule { }
