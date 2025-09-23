import crypto from 'crypto';

interface OTPRecord {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

class OTPService {
  private otpStore: Map<string, OTPRecord> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(phone: string, isResend: boolean = false): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
      this.cleanupExpiredOTPs();

      const existing = this.otpStore.get(phone);
      if (existing && existing.expiresAt > new Date() && !isResend) {
        const remainingTime = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
        return {
          success: false,
          message: `OTP already sent. Please wait ${remainingTime} seconds before requesting a new one.`
        };
      }

      // If resending, clear the existing OTP
      if (isResend && existing) {
        this.otpStore.delete(phone);
      }

      const result = await this.sendSMSMessage(phone);

      if (result.success && result.sessionId) {
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

        this.otpStore.set(phone, {
          phone,
          otp: result.sessionId, // Store session ID for AUTOGEN verification
          expiresAt,
          attempts: 0
        });

        console.log(`📱 OTP sent to ${phone} with session ID: ${result.sessionId}`);

        return {
          success: true,
          message: `OTP sent to ${phone}`,
          sessionId: result.sessionId
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to send OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    const record = this.otpStore.get(phone);

    if (!record) {
      return {
        success: false,
        message: 'No OTP found for this phone number. Please request a new OTP.'
      };
    }

    if (record.expiresAt <= new Date()) {
      this.otpStore.delete(phone);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(phone);
      return {
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.'
      };
    }

    // Verify OTP using 2Factor API
    const verificationResult = await this.verify2FactorOTP(record.otp, otp);

    if (!verificationResult.success) {
      record.attempts++;
      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`
      };
    }

    this.otpStore.delete(phone);
    return {
      success: true,
      message: 'Phone number verified successfully'
    };
  }

  private async verify2FactorOTP(sessionId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Verifying OTP:', { sessionId, otp });
      
      const response = await fetch(`https://2factor.in/API/V1/0a21cf3b-9716-11f0-a562-0200cd936042/SMS/VERIFY/${sessionId}/${otp}`, {
        method: 'GET'
      });

      const result = await response.json();
      console.log('2Factor Verification Response:', result);

      if (result.Status === 'Success') {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, message: result.Details || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('Failed to verify OTP with 2Factor:', error);
      return { success: false, message: 'Error verifying OTP' };
    }
  }

  private async sendSMSMessage(phone: string): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
  
        const formattedPhone = phone.replace(/^\+91/, '').replace(/\s/g, '');

        const response = await fetch(`https://2factor.in/API/V1/0a21cf3b-9716-11f0-a562-0200cd936042/SMS/${formattedPhone}/AUTOGEN/BookLoopOTP`, {
          method: 'GET'
        });

        const result = await response.json();
        console.log('2Factor API Response:', result);

        if (result.Status === 'Success') {
          console.log(`📱 SMS sent via 2Factor to ${formattedPhone}: ${result.Details}`);
          return {
            success: true,
            message: 'OTP sent successfully',
            sessionId: result.Details // Session ID for verification
          };
        } else {
          console.error(`2Factor API error: ${result.Details}`);
          return {
            success: false,
            message: `2Factor API error: ${result.Details}`
          };
        }
      

      // Fallback for development
      const otp = this.generateOTP();
      console.log(`📱 SMS to ${phone}: Your BookLoop verification code is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`);
      console.log('⚠️  No SMS service configured. Add SMS API credentials to environment variables.');

      return {
        success: true,
        message: 'OTP sent (development mode)',
        sessionId: otp // Use generated OTP as session ID in development
      };

    } catch (error) {
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        message: 'Failed to send SMS'
      };
    }
  }

  private cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [phone, record] of this.otpStore.entries()) {
      if (record.expiresAt <= now) {
        this.otpStore.delete(phone);
      }
    }
  }

  getOTPStatus(phone: string): { hasActiveOTP: boolean; remainingTime?: number } {
    const record = this.otpStore.get(phone);
    if (!record || record.expiresAt <= new Date()) {
      return { hasActiveOTP: false };
    }

    const remainingTime = Math.ceil((record.expiresAt.getTime() - Date.now()) / 1000);
    return { hasActiveOTP: true, remainingTime };
  }
}

export const otpService = new OTPService();