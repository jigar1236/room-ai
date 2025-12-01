"use server";

import { compareSync } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { signIn } from "@/lib/auth-config";
import {
  ERROR,
  FAILED_TO_SIGN_IN,
  INVALID_EMAIL_OR_PASSWORD,
  LOGIN_SUCCESSFUL,
  SOMETHING_WENT_WRONG,
  SUCCESS,
  VALIDATION_FAILED,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { SignInSchema } from "@/lib/validate";
import { convertFormDataToObject } from "@/lib/utils";
import { logger } from "@/lib/logger";

export interface State {
  status: string;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
}

export async function actionHandleLogin(
  prevState: State | null,
  data: FormData,
): Promise<State> {
  try {
    const input = convertFormDataToObject(data) as {
      email: string;
      password: string;
    };

    const response = SignInSchema.safeParse(input);

    if (!response?.success) {
      return {
        status: ERROR,
        message: response?.error?.errors?.[0]?.message || VALIDATION_FAILED,
      };
    }

    const { email, password } = response?.data;

    const userDetails = await prisma.user.findUnique({
      where: { email },
    });

    if (!userDetails || !userDetails.password) {
      return {
        status: ERROR,
        message: INVALID_EMAIL_OR_PASSWORD,
      };
    }

    const isPasswordValid = compareSync(
      password,
      userDetails?.password || "",
    );

    if (!isPasswordValid) {
      return {
        status: ERROR,
        message: INVALID_EMAIL_OR_PASSWORD,
      };
    }

    // Check if email is verified
    if (!userDetails.emailVerified) {
      return {
        status: ERROR,
        message: "Please verify your email before signing in. Check your inbox for the verification link.",
      };
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      revalidatePath("/dashboard");
      return {
        status: SUCCESS,
        message: LOGIN_SUCCESSFUL,
      };
    } catch (error) {
      logger.error("Failed to sign in", error);
      return {
        status: ERROR,
        message: FAILED_TO_SIGN_IN,
      };
    }
  } catch (error) {
    logger.error("Login action error", error);
    const { message = SOMETHING_WENT_WRONG } = (error as Error) || {};
    return {
      status: ERROR,
      message,
    };
  }
}

export async function actionHandleGoogleSignIn() {
  await signIn("google", { callbackUrl: "/dashboard" });
}
