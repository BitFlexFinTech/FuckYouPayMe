const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

interface NowPaymentsConfig {
  apiKey: string;
  ipnSecret: string;
}

let config: NowPaymentsConfig | null = null;

export function initNowPayments(): boolean {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (apiKey && ipnSecret) {
    config = { apiKey, ipnSecret };
    return true;
  }
  return false;
}

export function isNowPaymentsConfigured(): boolean {
  return !!config || (!process.env.NOWPAYMENTS_API_KEY && !process.env.NOWPAYMENTS_IPN_SECRET);
}

export async function createNowPaymentsPayment(params: {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ paymentUrl?: string; paymentId?: string; address?: string; qrCode?: string; expectedAmount?: number } | null> {
  // Mock mode when not configured
  if (!config) {
    return {
      paymentUrl: params.successUrl,
      paymentId: "np-mock-" + Date.now(),
      address: "0x742d35Cc6634C0532925a3b844Bc45429a5b844Bc",
      qrCode: "",
      expectedAmount: params.priceAmount,
    };
  }

  try {
    const response = await fetch(NOWPAYMENTS_API_URL + "/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        pay_currency: params.payCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        is_fixed_rate: true,
        is_fee_fixed_by_platform: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("NOWPayments API error:", error);
      return null;
    }

    const data = await response.json();
    return {
      paymentUrl: data.payment_url,
      paymentId: data.payment_id,
      address: data.pay_address,
      qrCode: data.qr_code,
      expectedAmount: parseFloat(data.pay_amount),
    };
  } catch (error) {
    console.error("NOWPayments request failed:", error);
    return null;
  }
}

export function verifyNowPaymentsIpnSignature(body: string, signature: string): boolean {
  if (!config) {
    return true; // Accept all in mock mode
  }
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha512", config.ipnSecret);
  hmac.update(body);
  const expected = hmac.digest("hex");
  return expected === signature;
}

export async function getNowPaymentsRate(
  priceCurrency: string,
  payCurrency: string,
  amount: number
): Promise<number | null> {
  try {
    const url = NOWPAYMENTS_API_URL + "/rate?" + new URLSearchParams({
      price_currency: priceCurrency,
      pay_currency: payCurrency,
      price_amount: String(amount),
    });
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return parseFloat(data.pay_amount);
  } catch {
    return null;
  }
}