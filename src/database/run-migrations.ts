import 'dotenv/config';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { sequelize } from './index';

const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const migrationsPath = join(__dirname, 'migrations');
    const files = await readdir(migrationsPath);
    const migrationFiles = files
      .filter((f) => f.endsWith('.ts'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration(s)`);

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = await import(join(migrationsPath, file));
      const migrationModule = migration.default || migration;

      if (typeof migrationModule.up === 'function') {
        await migrationModule.up(sequelize.getQueryInterface());
        console.log(`✓ Completed: ${file}`);
      } else {
        console.warn(`⚠ Skipped ${file}: no 'up' function found`);
      }
    }

    console.log('All migrations completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

runMigrations();

