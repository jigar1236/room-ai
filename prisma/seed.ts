import { PrismaClient, CreditTransactionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Add credits to specific user
  const userId = "cmiit9l6200067sc2b4mrn9x0";

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.log(`❌ User with ID ${userId} not found`);
    return;
  }

  console.log(`✓ Found user: ${user.email}`);

  // Check current credit balance
  const currentTransactions = await prisma.creditTransaction.findMany({
    where: { userId },
    select: { amount: true },
  });

  const currentBalance = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
  console.log(`✓ Current credit balance: ${currentBalance}`);

  // Add initial credits if balance is low
  const creditsToAdd = 100;

  if (currentBalance < 50) {
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.EARNED,
        amount: creditsToAdd,
        description: "Initial credits - Welcome bonus",
      },
    });

    console.log(`✓ Added ${creditsToAdd} credits to user ${user.email}`);
    console.log(`✓ New balance: ${currentBalance + creditsToAdd}`);
  } else {
    console.log(`✓ User already has sufficient credits (${currentBalance})`);
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

