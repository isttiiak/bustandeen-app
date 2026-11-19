import { defineConfig } from 'drizzle-kit';

// `npm run db:generate` writes the SQL for each schema change into src/db/migrations and then
// bundles it as TypeScript (scripts/build-migrations.mjs), so Metro needs no .sql loader.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
});
