import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "Mayank@Mobile";
  const password = "Testingit2341";

  console.log(`Creating admin user: ${username}...`);

  await prisma.admin.upsert({
    where: { username },
    update: { password },
    create: { username, password },
  });

  console.log("Admin user created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
