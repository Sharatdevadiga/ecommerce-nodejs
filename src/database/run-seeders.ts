import 'dotenv/config';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { sequelize } from './index';

const runSeeders = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const seedersPath = join(__dirname, 'seeders');
    let files: string[];
    
    try {
      files = await readdir(seedersPath);
    } catch (error) {
      console.log('No seeders directory found or empty. Skipping seeders.');
      await sequelize.close();
      process.exit(0);
    }

    const seederFiles = files
      .filter((f) => f.endsWith('.ts'))
      .sort();

    if (seederFiles.length === 0) {
      console.log('No seeders found. Skipping.');
      await sequelize.close();
      process.exit(0);
    }

    console.log(`Found ${seederFiles.length} seeder(s)`);

    for (const file of seederFiles) {
      console.log(`Running seeder: ${file}`);
      const seeder = await import(join(seedersPath, file));
      const seederModule = seeder.default || seeder;

      if (typeof seederModule.up === 'function') {
        await seederModule.up();
        console.log(`✓ Completed: ${file}`);
      } else {
        console.warn(`⚠ Skipped ${file}: no 'up' function found`);
      }
    }

    console.log('All seeders completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

runSeeders();

