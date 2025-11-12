import 'dotenv/config';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { sequelize } from './index';

const undoSeeders = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const seedersPath = join(__dirname, 'seeders');
    let files: string[];
    
    try {
      files = await readdir(seedersPath);
    } catch (error) {
      console.log('No seeders directory found. Nothing to undo.');
      await sequelize.close();
      process.exit(0);
    }

    const seederFiles = files
      .filter((f) => f.endsWith('.ts'))
      .sort()
      .reverse(); // Run in reverse order

    if (seederFiles.length === 0) {
      console.log('No seeders found. Nothing to undo.');
      await sequelize.close();
      process.exit(0);
    }

    console.log(`Found ${seederFiles.length} seeder(s) to undo`);

    for (const file of seederFiles) {
      console.log(`Undoing seeder: ${file}`);
      const seeder = await import(join(seedersPath, file));
      const seederModule = seeder.default || seeder;

      if (typeof seederModule.down === 'function') {
        await seederModule.down();
        console.log(`✓ Undone: ${file}`);
      } else {
        console.warn(`⚠ Skipped ${file}: no 'down' function found`);
      }
    }

    console.log('All seeders undone successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Undoing seeders failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

undoSeeders();

