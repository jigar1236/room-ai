import { Account, User } from "@prisma/client";
import { compareSync } from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { GOOGLE_PROVIDER } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { awardMonthlyCredits } from "@/lib/credits";
import { logger } from "@/lib/logger";

const authConfig = {
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
          user?.password,
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
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ account, user }) {
      try {
        if (account?.provider === GOOGLE_PROVIDER) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user?.email as string },
          });

          if (existingUser) {
            // Handle account linking
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            });

            if (!existingAccount && account) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token || null,
                  access_token: account.access_token || null,
                  expires_at: typeof account.expires_at === 'number' ? account.expires_at : null,
                  token_type: account.token_type || null,
                  scope: account.scope || null,
                  id_token: account.id_token || null,
                  session_state: typeof account.session_state === 'string' ? account.session_state : null,
                },
              });
            }

            // Update user info if missing
            const updateData: Record<string, string> = {};
            if (!existingUser?.name && user?.name) {
              updateData.name = user?.name;
            }
            if (!existingUser?.image && user?.image) {
              updateData.image = user?.image;
            }
            if (Object.keys(updateData)?.length > 0) {
              await prisma.user.update({
                where: { email: user?.email as string },
                data: updateData,
              });
            }
          }
        }

        // Award monthly credits on sign in for all providers
        if (user?.id) {
          try {
            await awardMonthlyCredits(user.id);
          } catch (creditError) {
            // Log but don't block sign-in if credit awarding fails
            logger.error("Failed to award monthly credits on sign-in", creditError, { userId: user.id });
          }
        }

        return true;
      } catch (error) {
        logger.error("Error in signIn callback", error);
        // Allow sign-in even if secondary operations fail (e.g., credit awarding)
        // Only block sign-in for critical authentication errors
        return true;
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user = { ...session?.user, ...token } as User;
        if (token?.image) {
          session.user.image = token?.image as string;
        }
        if (token?.id) {
          (session.user as any).id = token.id;
        }
      }
      return session;
    },
    async jwt({ token, account, trigger, session, user }) {
      // On initial sign-in, get user data
      if (user) {
        token.email = user.email;
        if (user.image) {
          token.image = user.image;
        }
      }

      if (!token?.email) {
        return null;
      }

      // Always fetch the correct database user ID based on email
      // This ensures we use the database ID, not OAuth provider ID
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { id: true, name: true, image: true },
      });

      if (dbUser) {
        token.id = dbUser.id; // Use database user ID
        if (dbUser.name && !token.name) {
          token.name = dbUser.name;
        }
        if (dbUser.image && !token.image) {
          token.image = dbUser.image;
        }
      }

      if (account?.provider === GOOGLE_PROVIDER && dbUser) {
        const existingUser = await prisma.user.findUnique({
          where: { email: token?.email as string },
        });

        if (existingUser && !existingUser?.emailVerified) {
          await prisma.user.update({
            where: { email: token?.email as string },
            data: { emailVerified: new Date() },
          });
        }
      }

      if (trigger === "update" && session) {
        if (session?.image) {
          token.image = session?.image;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);





