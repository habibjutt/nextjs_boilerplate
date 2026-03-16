import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { EmailService } from "./email-service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log('🔐 [Auth] sendResetPassword called', { email: user.email, url });
      const emailService = new EmailService();
      
      try {
        console.log('📧 [Auth] Sending password reset email to:', user.email);
        await emailService.sendEmail({
          recipients: [user.email],
          type: 'reset_password',
          data: {
            recipientEmail: user.email,
            recipientName: user.name || user.email.split('@')[0],
            resetToken: url.split('token=')[1] || '',
            resetUrl: url,
            expiryHours: 1,
          },
        });
        console.log('✅ [Auth] Password reset email sent successfully');
      } catch (error) {
        console.error('❌ [Auth] Error sending password reset email:', error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      isAdmin: {
        type: 'boolean',
        required: false,
        input: false,
      },
      roleId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        console.log('🔐 [Auth] sendVerificationOTP called', { email, otp, type });
        const emailService = new EmailService();
        
        try {
          if (type === 'email-verification') {
            console.log('📧 [Auth] Sending email verification OTP to:', email);
            await emailService.sendEmail({
              recipients: [email],
              type: 'otp',
              data: {
                recipientEmail: email,
                recipientName: email.split('@')[0],
                otp: otp,
                expiryMinutes: 5,
              },
            });
            console.log('✅ [Auth] Email verification OTP sent successfully');
          } else if (type === 'sign-in') {
            console.log('📧 [Auth] Sending sign-in OTP to:', email);
            await emailService.sendEmail({
              recipients: [email],
              type: 'otp',
              data: {
                recipientEmail: email,
                recipientName: email.split('@')[0],
                otp: otp,
                expiryMinutes: 5,
              },
            });
            console.log('✅ [Auth] Sign-in OTP sent successfully');
          } else {
            // for password reset
            console.log('📧 [Auth] Sending password reset OTP to:', email);
            await emailService.sendEmail({
              recipients: [email],
              type: 'otp',
              data: {
                recipientEmail: email,
                recipientName: email.split('@')[0],
                otp: otp,
                expiryMinutes: 10,
              },
            });
            console.log('✅ [Auth] Password reset OTP sent successfully');
          }
        } catch (error) {
          console.error('❌ [Auth] Error sending OTP email:', error);
          throw error;
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
      disableSignUp: false,
    }),
  ],
});
