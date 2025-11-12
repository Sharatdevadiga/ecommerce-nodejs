import 'dotenv/config';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { sequelize } from './index';

const undoMigrations = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const migrationsPath = join(__dirname, 'migrations');
    const files = await readdir(migrationsPath);
    const migrationFiles = files
      .filter((f) => f.endsWith('.ts'))
      .sort()
      .reverse(); // Run in reverse order

    console.log(`Found ${migrationFiles.length} migration(s) to undo`);

    for (const file of migrationFiles) {
      console.log(`Undoing migration: ${file}`);
      const migration = await import(join(migrationsPath, file));
      const migrationModule = migration.default || migration;

      if (typeof migrationModule.down === 'function') {
        await migrationModule.down(sequelize.getQueryInterface());
        console.log(`✓ Undone: ${file}`);
      } else {
        console.warn(`⚠ Skipped ${file}: no 'down' function found`);
      }
    }

    console.log('All migrations undone successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Undoing migrations failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

undoMigrations();

