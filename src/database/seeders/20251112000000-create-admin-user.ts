import { hashPassword } from '../../utils/password';
import { models } from '../../database';

export default {
  up: async () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin123!';

    const existingAdmin = await models.User.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);
    const admin = await models.User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✓ Admin user created successfully!');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: admin`);
  },
  down: async () => {
    await models.User.destroy({
      where: { email: 'admin@example.com' },
    });
    console.log('Admin user removed');
  },
};

