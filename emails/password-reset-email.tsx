import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export const PasswordResetEmail = ({
  resetUrl,
  userName,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your RoomAI account password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            {userName ? `Hi ${userName},` : "Hi there,"}
          </Text>
          <Text style={text}>
            We received a request to reset your password for your RoomAI account.
            Click the button below to create a new password.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into your
            browser:
          </Text>
          <Text style={link}>{resetUrl}</Text>
          <Text style={text}>
            This link will expire in 1 hour. If you didn't request a password reset,
            you can safely ignore this email. Your password will remain unchanged.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 20px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#7c3aed",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
  margin: "0 0 16px",
};

