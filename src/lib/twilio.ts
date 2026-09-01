import Twilio from "twilio";

let twilioClient: ReturnType<typeof Twilio> | null = null;

export function initTwilio(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;
  if (sid && token && phone) {
    twilioClient = Twilio(sid, token);
    return true;
  }
  return false;
}

export function isTwilioConfigured(): boolean {
  return !!twilioClient || (!process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_AUTH_TOKEN);
}

export function getTwilioPhoneNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER || "+15005550006";
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  // Mock mode
  if (!twilioClient) {
    console.log(`[Twilio Mock] Would send SMS to ${to}: ${body.substring(0, 60)}...`);
    return true;
  }

  try {
    await twilioClient.messages.create({
      from: getTwilioPhoneNumber(),
      to,
      body,
    });
    return true;
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return false;
  }
}