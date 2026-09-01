export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BIC_fake-vapid-public-key-for-development-only";
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; message: string; link?: string }
): Promise<boolean> {
  console.log("[Push Mock] Would send notification:", payload.title, payload.message);
  return true;
}