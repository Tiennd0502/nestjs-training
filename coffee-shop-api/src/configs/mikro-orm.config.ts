import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  discovery: {
    warnWhenNoEntities: false,
  },

  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },

  seeder: {
    path: 'dist/seeders',
    pathTs: 'src/seeders',
  },

  debug: process.env.NODE_ENV !== 'production',
});
