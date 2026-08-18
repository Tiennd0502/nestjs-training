import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { DEFAULT_PORT } from '@/shared/constants';

export default defineConfig({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : DEFAULT_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,

  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],

  discovery: { warnWhenNoEntities: false },

  debug: process.env.NODE_ENV !== 'production',

  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },

  seeder: {
    path: './dist/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
});
