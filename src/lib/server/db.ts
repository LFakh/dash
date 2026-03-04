import pg from 'pg';
import { env } from '$env/dynamic/private';

const pool = new pg.Pool({
  host: env.PG_HOST,
  port: parseInt(env.PG_PORT || '5432', 10),
  database: env.PG_DATABASE,
  user: env.PG_USER,
  password: env.PG_PASSWORD,
});

export default pool;