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

  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      this.cleanupExpiredOTPs();

      const existing = this.otpStore.get(phone);
      if (existing && existing.expiresAt > new Date()) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting a new one.'
        };
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      this.otpStore.set(phone, {
        phone,
        otp,
        expiresAt,
        attempts: 0
      });

     
      console.log(`📱 OTP for ${phone}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);

      await this.sendSMSMessage(phone, otp);

      return {
        success: true,
        message: `OTP sent to ${phone}`
      };
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

    if (record.otp !== otp) {
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

  private async sendSMSMessage(phone: string, otp: string): Promise<void> {
    try {
      if (process.env.TWOFACTOR_API_KEY) {
        const response = await fetch(`https://2factor.in/API/V1/0a21cf3b-9716-11f0-a562-0200cd936042/SMS/${phone}/AUTOGEN/BookLoopOTP`, {
          method: 'GET'
        });

        const result = await response.json();
        if (result.Status === 'Success') {
          console.log(`📱 SMS sent via 2Factor to ${phone}: ${result.Details}`);
        } else {
          throw new Error(`2Factor API error: ${result.Details}`);
        }
        return;
      }

   
      console.log(`📱 SMS to ${phone}: Your BookLoop verification code is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`);
      console.log('⚠️  No SMS service configured. Add SMS API credentials to environment variables.');
      
    } catch (error) {
      console.error('Failed to send SMS:', error);

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