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

  async sendOTP(phone: string): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
      this.cleanupExpiredOTPs();

      const existing = this.otpStore.get(phone);
      if (existing && existing.expiresAt > new Date()) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting a new one.'
        };
      }

      // For 2Factor AUTOGEN, we'll get the OTP from the API response
      const otp = this.generateOTP(); // Fallback OTP for development
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      this.otpStore.set(phone, {
        phone,
        otp,
        expiresAt,
        attempts: 0
      });

      console.log(`📱 Sending OTP to ${phone} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);

      await this.sendSMSMessage(phone, otp);

      return {
        success: true,
        message: `OTP sent to ${phone}. Please check your mobile.`
      };
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please check your phone number and try again.'
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
        // Clean phone number - remove any spaces, dashes, or special characters except +
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // Ensure phone number starts with country code
        const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone.substring(3) : cleanPhone.startsWith('91') ? cleanPhone.substring(2) : cleanPhone;
        
        const apiUrl = `https://2factor.in/API/V1/0a21cf3b-9716-11f0-a562-0200cd936042/SMS/${formattedPhone}/AUTOGEN/BookLoopOTP`;
        
        console.log(`🚀 Sending OTP to: ${formattedPhone} via 2Factor API`);
        console.log(`📡 API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        console.log(`📱 2Factor API Response:`, result);
        
        if (result.Status === 'Success') {
          console.log(`✅ SMS sent successfully to ${formattedPhone}: ${result.Details}`);
          console.log(`🔑 Session ID: ${result.Details}`);
        } else {
          console.error(`❌ 2Factor API error: ${result.Details}`);
          throw new Error(`2Factor API error: ${result.Details}`);
        }
        return;
      }

      // Fallback for development
      console.log(`📱 SMS to ${phone}: Your BookLoop verification code is: ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`);
      console.log('⚠️  No SMS service configured. Add TWOFACTOR_API_KEY to environment variables.');
      
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw error; // Re-throw to handle in calling function
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