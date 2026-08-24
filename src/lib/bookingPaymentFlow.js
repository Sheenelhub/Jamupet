export function normalizePaymentStage(stage) {
  return stage === "final" ? "final" : "reservation";
}

export function getCompletedPaymentStatus(stage) {
  return normalizePaymentStage(stage) === "final" ? "paid" : "reservation_paid";
}

export function getPendingPaymentStatus(stage) {
  return normalizePaymentStage(stage) === "final" ? "final_pending" : "reservation_pending";
}

export function hasPaidReservation(status) {
  return status === "reservation_paid" || status === "paid";
}

export function isPendingPaymentStatus(status) {
  return status === "reservation_pending" || status === "final_pending";
}
