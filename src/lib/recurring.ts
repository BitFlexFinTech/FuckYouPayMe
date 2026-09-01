import { addWeeks, addMonths, addDays } from "date-fns";

export function computeNextRecurringDate(
  frequency: string,
  fromDate: Date = new Date()
): Date | null {
  switch (frequency) {
    case "weekly":
      return addWeeks(fromDate, 1);
    case "biweekly":
      return addWeeks(fromDate, 2);
    case "monthly":
      return addMonths(fromDate, 1);
    case "quarterly":
      return addMonths(fromDate, 3);
    default:
      return null;
  }
}

export function computeNextDueDate(
  frequency: string,
  currentDueDate: Date,
  paymentTerms: string = "NET30"
): Date {
  const intervalDays = paymentTerms === "NET7" ? 7 : paymentTerms === "NET14" ? 14 : 30;
  const nextDue = addDays(currentDueDate, intervalDays);

  // For recurring, the due date moves forward by the frequency
  switch (frequency) {
    case "weekly":
      return addWeeks(nextDue, 1);
    case "biweekly":
      return addWeeks(nextDue, 2);
    case "monthly":
      return addMonths(nextDue, 1);
    case "quarterly":
      return addMonths(nextDue, 3);
    default:
      return addDays(currentDueDate, intervalDays);
  }
}