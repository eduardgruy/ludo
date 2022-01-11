import * as mongoose from 'mongoose';


//TODO remove passwords
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://root:example@mongo:27017/'),
  },
];