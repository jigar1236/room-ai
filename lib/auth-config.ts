import { GOOGLE_PROVIDER } from "@/lib/constants";
import { awardMonthlyCredits } from "@/lib/credits";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { CreditTransactionType, User } from "@prisma/client";
import { compareSync } from "bcryptjs";
import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user?.password) {
          return null;
        }

        const isPasswordValid = compareSync(
          credentials.password as string,
          user?.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
    Google({
      clientId: process.env.NEXTAUTH_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ account, user }) {
      try {
        // PrismaAdapter will automatically create the user and account
        // This callback just handles additional logic
        if (account?.provider === GOOGLE_PROVIDER && user?.email) {
          // Use user.id if available (from adapter), otherwise fetch by email
          let dbUser = user.id
            ? await prisma.user.findUnique({ where: { id: user.id } })
            : await prisma.user.findUnique({ where: { email: user.email } });

          // Retry once if user not found (adapter might still be committing)
          if (!dbUser) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
            dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
          }

          if (dbUser) {
            // Update user info if missing
            const updateData: Record<string, string> = {};
            if (!dbUser.name && user.name) {
              updateData.name = user.name;
            }
            if (!dbUser.image && user.image) {
              updateData.image = user.image;
            }
            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { email: user.email },
                data: updateData,
              });
            }

            // Check if this is a new user (no credit transactions exist)
            const existingTransaction =
              await prisma.creditTransaction.findFirst({
                where: { userId: dbUser.id },
              });

            if (!existingTransaction) {
              try {
                const creditTransaction = await prisma.creditTransaction.create(
                  {
                    data: {
                      userId: dbUser.id,
                      type: CreditTransactionType.EARNED,
                      amount: 0,
                      description: "Initial account setup",
                    },
                  }
                );
                logger.info("Initial credit transaction created for new user", {
                  userId: dbUser.id,
                  email: dbUser.email,
                  transactionId: creditTransaction.id,
                });
              } catch (creditError) {
                logger.error(
                  "Failed to create initial credit transaction",
                  creditError,
                  {
                    userId: dbUser.id,
                    email: dbUser.email,
                    error:
                      creditError instanceof Error
                        ? creditError.message
                        : String(creditError),
                    stack:
                      creditError instanceof Error
                        ? creditError.stack
                        : undefined,
                  }
                );
                // Don't block sign-in if this fails
              }
            } else {
              logger.info(
                "User already has credit transactions, skipping initial transaction",
                {
                  userId: dbUser.id,
                  email: dbUser.email,
                }
              );
            }
          } else {
            logger.warn("User not found in database during signIn callback", {
              email: user.email,
              userId: user.id,
            });
          }
        }

        return true;
      } catch (error) {
        logger.error("Error in signIn callback", error);
        // Allow sign-in even if secondary operations fail
        return true;
      }
    },
    async jwt({ token, account, trigger, session, user }) {
      // On initial sign-in, get user data
      if (user) {
        token.email = user.email;
        if (user.image) {
          token.image = user.image;
        }
        if (user.id) {
          token.id = user.id;
        }
      }

      if (!token?.email) {
        return null;
      }

      // Always fetch the correct database user ID based on email
      // This ensures we use the database ID, not OAuth provider ID
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { id: true, name: true, image: true, emailVerified: true },
      });

      if (dbUser) {
        token.id = dbUser.id; // Use database user ID
        if (dbUser.name && !token.name) {
          token.name = dbUser.name;
        }
        if (dbUser.image && !token.image) {
          token.image = dbUser.image;
        }

        // Mark email as verified for Google OAuth users
        if (account?.provider === GOOGLE_PROVIDER && !dbUser.emailVerified) {
          await prisma.user.update({
            where: { email: token.email as string },
            data: { emailVerified: new Date() },
          });
        }

        // Award monthly credits on first sign-in (when user object is present)
        if (user && account?.provider === GOOGLE_PROVIDER) {
          try {
            await awardMonthlyCredits(dbUser.id);
          } catch (creditError) {
            // Log but don't block sign-in if credit awarding fails
            logger.error(
              "Failed to award monthly credits on sign-in",
              creditError,
              { userId: dbUser.id }
            );
          }
        }
      }

      if (trigger === "update" && session) {
        if (session?.image) {
          token.image = session?.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = { ...session.user, ...token } as User;
        if (token.image) {
          session.user.image = token.image as string;
        }
        if (token.id) {
          (session.user as any).id = token.id;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
