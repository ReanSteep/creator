import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      email: 'test@example.com'
    }
  })

  const users = await prisma.user.findMany()
  console.log(users)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())