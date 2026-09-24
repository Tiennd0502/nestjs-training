// Must stay first: loads .env.test before the MikroORM config reads process.env
import './setup-env';
import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from '../src/configs/mikro-orm.config';

async function main(): Promise<void> {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getSchemaGenerator().clearDatabase();
  await orm.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
