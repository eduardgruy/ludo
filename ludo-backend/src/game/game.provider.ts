import { Connection } from 'mongoose';
import { SessionSchema } from './schemas/session.schema';
import { GameSchema } from './schemas/game.schema';

export const gameProvider = [
  {
    provide: 'GAME_MODEL',
    useFactory: (connection: Connection) => connection.model('Game', GameSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'SESSION_MODEL',
    useFactory: (connection: Connection) => connection.model('Session', SessionSchema),
    inject: ['DATABASE_CONNECTION'],
  },

];