import { prisma } from "./prisma";
import { sendSms, isTwilioConfigured } from "./twilio";

export type ToneLevel = "polite" | "firm" | "fuck_you" | "nuclear";

const DUNNING_TEMPLATES: Record<ToneLevel, { day0: string; day1: string; day2: string; day3: string; day4: string }> = {
  polite: {
    day0: "Hi {client}, invoice #{number} for ${amount} is due on {due}. Pay here: {link}. Thanks!",
    day1: "Hi {client}, just a nudge — invoice #{number} for ${amount} was due {due}. Still waiting. {link}",
    day2: "{client}, reminder: invoice #{number} for ${amount} is now {days} days overdue. Please pay at your earliest convenience. {link}",
    day3: "{client}, this is your final reminder for invoice #{number} (${amount}, {days} days overdue). If we don't receive payment by {deadline}, this will be escalated. {link}",
    day4: "{client}, invoice #{number} for ${amount} is {days} days overdue. Per our process, this will now be handled by our collections team. {link}",
  },
  firm: {
    day0: "Hi {client}, invoice #{number} for ${amount} is due {due}. Pay here: {link}.",
    day1: "{client}, invoice #{number} for ${amount} was due {due}. You're late. {link}",
    day2: "{client}, you owe ${amount} (invoice #{number}). It's been {days} days. I expect payment by {deadline}. {link}",
    day3: "{client}. ${amount}. {days} days overdue. This is your final notice. Pay by {deadline} or I'll escalate. {link}",
    day4: "{client}. Final notice: ${amount} + late fees. If unpaid by {deadline}, legal action will commence. {link}",
  },
  fuck_you: {
    day0: "Hi {client}, invoice #{number} for ${amount} is due {due}. Pay here: {link}. Thanks!",
    day1: "Hi {client}, just a nudge — invoice #{number} for ${amount} was due {due}. Still waiting. {link}",
    day2: "{client}, you owe me ${amount}. It's been {days} days. This is getting awkward. Pay now: {link}",
    day3: "{client}. ${amount}. {days} days overdue. I'm done being polite. Pay by {deadline} or I'm escalating. {link}",
    day4: "{client}. Final notice. ${amount} + late fees. If I don't receive payment by {deadline}, I will file a claim and report this. This is not a threat. It's a process. {link}",
  },
  nuclear: {
    day0: "Hi {client}, invoice #{number} for ${amount} is due {due}. Pay here: {link}.",
    day1: "{client}. Invoice #{number} (${amount}) past due. Pay now: {link}",
    day2: "{client}, you're ${amount} behind on invoice #{number}. I have the paperwork started. Pay by {deadline} or I file. {link}",
    day3: "{client}. ${amount}. {days} days. I've drafted the small claims filing. One more day and it's filed. {link}",
    day4: "{client}. This is your final notice. ${amount} + {lateFee} late fees. If I don't see payment by EOD {deadline}, I file in {jurisdiction} small claims court AND report to credit agencies. {link}",
  },
};

// SMS-specific templates (shorter, for SMS character limits)
const SMS_TEMPLATES: Record<ToneLevel, string[]> = {
  polite: [
    "Hi {client}, invoice #{number} for ${amount} is due {due}. Pay: {link}",
    "Reminder: invoice #{number} for ${amount} is overdue. Pay here: {link}",
    "Overdue: invoice #{number} (${amount}, {days} days). Please pay: {link}",
    "Final notice: invoice #{number} (${amount}). Pay by {deadline} or we escalate. {link}",
    "Collections: invoice #{number} for ${amount} has been sent to our team. {link}",
  ],
  firm: [
    "Invoice #{number} for ${amount} due {due}. Pay: {link}",
    "Overdue: ${amount} - invoice #{number}. Pay now: {link}",
    "You owe ${amount} (invoice #{number}). {days} days late. Pay: {link}",
    "FINAL: ${amount} overdue. Pay by {deadline} or we escalate. {link}",
    "LEGAL: ${amount} + fees. Pay by {deadline} or court action. {link}",
  ],
  fuck_you: [
    "Invoice #{number} for ${amount} due {due}. Pay: {link}",
    "Hey, you owe ${amount}. Pay: {link}",
    "This is awkward. You owe ${amount}. {days} days. Pay: {link}",
    "Done being polite. ${amount}. {days} days. Pay by {deadline}. {link}",
    "FINAL: ${amount}+fees. Legal filing incoming. Pay: {link}",
  ],
  nuclear: [
    "Invoice #{number} for ${amount}. Pay: {link}",
    "${amount} overdue. Pay now: {link}",
    "Paperwork started. ${amount}. Pay: {link}",
    "ONE DAY: ${amount}. File tomorrow. {link}",
    "COURT: ${amount}+fees. Pay or we file. {link}",
  ],
};
export function getDunningLevel(user: any, invoice: any): ToneLevel {
  const level = invoice.dunningLevel || user?.escalationMaxLevel || "fuck_you";
  return level as ToneLevel;
}

export function generateDunningEmail(
  level: ToneLevel,
  stage: number,
  invoice: any,
  freelancerName: string,
  lateFeeText: string,
  jurisdiction: string
): { subject: string; body: string } {
  const templates = DUNNING_TEMPLATES[level];
  const stageKey = ("day" + Math.min(stage, 4)) as keyof typeof templates;
  const template = templates[stageKey];

  const paymentUrl = process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoice.id;
  const amount = (invoice.total / 100).toFixed(2);
  const daysOverdue = Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const deadlineStr = deadline.toLocaleDateString();

  const body = template
    .replace("{client}", invoice.clientName)
    .replace("{number}", invoice.invoiceNumber)
    .replace("{amount}", amount)
    .replace("{due}", new Date(invoice.dueDate).toLocaleDateString())
    .replace("{days}", String(Math.max(1, daysOverdue)))
    .replace("{link}", paymentUrl)
    .replace("{deadline}", deadlineStr)
    .replace("{lateFee}", lateFeeText)
    .replace("{jurisdiction}", jurisdiction);

  const subjects: Record<ToneLevel, string[]> = {
    polite: [
      "Invoice " + invoice.invoiceNumber + " is due soon",
      "Reminder: Invoice " + invoice.invoiceNumber,
      "Overdue: Invoice " + invoice.invoiceNumber,
      "Final notice: Invoice " + invoice.invoiceNumber,
      "Escalated: Invoice " + invoice.invoiceNumber,
    ],
    firm: [
      "Invoice " + invoice.invoiceNumber + " " + amount,
      "Overdue: " + amount + " " + invoice.invoiceNumber,
      "PAY NOW: Invoice " + invoice.invoiceNumber,
      "FINAL NOTICE: " + amount + " overdue",
      "LEGAL: Invoice " + invoice.invoiceNumber,
    ],
    fuck_you: [
      "Invoice " + invoice.invoiceNumber + " for $" + amount,
      "Hey, you owe $" + amount,
      "This is getting awkward. $" + amount + " overdue.",
      "I'm done being polite. $" + amount + ".",
      "FINAL NOTICE: $" + amount + " + fees. Legal incoming.",
    ],
    nuclear: [
      "Invoice " + invoice.invoiceNumber + " $" + amount,
      amount + " overdue. Pay now.",
      "Paperwork started. $" + amount + ".",
      "ONE DAY TO PAY: $" + amount,
      "COURT FILING: $" + amount + " + fees",
    ],
  };

  return { subject: subjects[level][Math.min(stage, 4)], body };
}

export function generateSmsBody(
  level: ToneLevel,
  stage: number,
  invoice: any
): string {
  const templates = SMS_TEMPLATES[level];
  const template = templates[Math.min(stage, 4)];

  const paymentUrl = process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoice.id;
  const amount = (invoice.total / 100).toFixed(2);
  const daysOverdue = Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const deadlineStr = deadline.toLocaleDateString();

  return template
    .replace("{client}", invoice.clientName)
    .replace("{number}", invoice.invoiceNumber)
    .replace("{amount}", amount)
    .replace("{due}", new Date(invoice.dueDate).toLocaleDateString())
    .replace("{days}", String(Math.max(1, daysOverdue)))
    .replace("{link}", paymentUrl)
    .replace("{deadline}", deadlineStr);
}

export async function processDunning(invoice: any, freelancer: any) {
  const level = getDunningLevel(freelancer, invoice);
  const stage = invoice.dunningStage;
  const maxStage = invoice.maxDunningStage || 4;

  if (stage > maxStage || invoice.dunningCompleted || invoice.status === "PAID" || invoice.status === "SETTLED" || invoice.status === "VOIDED") {
    return { skipped: true, reason: "completed or paid" };
  }
  if (invoice.status !== "SENT" && invoice.status !== "OVERDUE" && invoice.status !== "DUNNING_ACTIVE") {
    return { skipped: true, reason: "status is " + invoice.status };
  }

  // Check for open dispute — pause dunning if disputed
  const openDispute = await prisma.dispute.findFirst({
    where: { invoiceId: invoice.id, status: "OPEN" },
  });
  if (openDispute) {
    return { skipped: true, reason: "open dispute exists" };
  }

  const jurisdiction = freelancer.country === "US" ? "your local small claims court" : freelancer.country || "your jurisdiction";
  const lateFeeText = invoice.lateFeeEnabled ? (invoice.lateFeePercent || 1.5) + "% per week" : "0%";
  const { subject, body } = generateDunningEmail(level, stage, invoice, freelancer.name || "Your freelancer", lateFeeText, jurisdiction);

  const interval = invoice.escalationInterval || freelancer.escalationInterval || 3;
  const nextDunning = new Date();
  nextDunning.setDate(nextDunning.getDate() + interval);

  await prisma.dunningEvent.create({
    data: {
      invoiceId: invoice.id,
      stage,
      level,
      channel: "email",
      recipient: invoice.clientEmail,
      subject,
      body,
    },
  });

  // Send SMS for stages 3+ (after 2 failed email reminders)
  if (stage >= 2 && invoice.clientEmail) {
    try {
      const smsBody = generateSmsBody(level, stage, invoice);
      const smsSent = await sendSms(invoice.clientEmail, smsBody);
      if (smsSent) {
        await prisma.dunningEvent.create({
          data: {
            invoiceId: invoice.id,
            stage,
            level,
            channel: "sms",
            recipient: invoice.clientEmail,
            subject: "SMS: " + smsBody.substring(0, 50),
            body: smsBody,
          },
        });
      }
    } catch (err) {
      console.error("SMS dunning failed:", err);
    }
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      dunningStage: stage + 1,
      lastDunningDate: new Date(),
      nextDunningDate: nextDunning,
      status: "DUNNING_ACTIVE",
      dunningCompleted: stage + 1 > maxStage,
    },
  });

  return { sent: true, stage, subject, body };
}