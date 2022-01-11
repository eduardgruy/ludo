import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { gameProvider } from './game.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    providers: [GameGateway, GameService, ...gameProvider],
    controllers: [],
    imports: [DatabaseModule, AuthModule, UsersModule]

})
export class GameModule { }
