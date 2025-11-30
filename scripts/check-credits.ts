import { PrismaClient, CreditTransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check both user IDs
  const userIds = [
    "cmiit9l6200067sc2b4mrn9x0",
    "5b204a7b-c8db-4a2b-83f6-09c52908698c"
  ];
  
  for (const userId of userIds) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (user) {
      console.log(`\n✓ User found: ${user.email} (ID: ${userId})`);
      
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId },
      });
      
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      console.log(`  Credits: ${total}`);
      console.log(`  Transactions: ${transactions.length}`);
    } else {
      console.log(`\n✗ User not found: ${userId}`);
    }
  }
  
  // Add credits to the session user if needed
  const sessionUserId = "5b204a7b-c8db-4a2b-83f6-09c52908698c";
  const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
  
  if (user) {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: sessionUserId },
    });
    const currentBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (currentBalance < 50) {
      await prisma.creditTransaction.create({
        data: {
          userId: sessionUserId,
          type: CreditTransactionType.EARNED,
          amount: 100,
          description: "Initial credits - Welcome bonus",
        },
      });
      console.log(`\n✅ Added 100 credits to ${user.email}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
