import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const email = 'zack@sporecmms.com';
  const newPassword = 'admin123456';

  console.log(`Resetting password for ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('User not found!');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  console.log('✅ Password reset successfully.');
  console.log(`New password: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
