import { INVOICE_TABLE_STATUS_CHOICES } from "@/constants/enums/invoice";
import { CRMJob } from "@/interface/jobs";

export const paymentStatus = (job: CRMJob) => {
  const { NOT_STARTED, PENDING, COMPLETE, UNKNOWN  } = INVOICE_TABLE_STATUS_CHOICES
  
  let downPaymentStatus;
  let finalPaymentStatus;

  if (job.invoice_steps_not_started) {
    downPaymentStatus = NOT_STARTED;
    finalPaymentStatus = NOT_STARTED;
  } else if (job.first_invoice_id && !job.first_invoice_paid) {
    downPaymentStatus = PENDING;
    finalPaymentStatus = NOT_STARTED;
  } else if (job.can_generate_final_payment && !job.second_invoice_id) {
    downPaymentStatus = COMPLETE;
    finalPaymentStatus = NOT_STARTED;
  } else if (job.second_invoice_id && !job.second_invoice_paid) {
    downPaymentStatus = COMPLETE;
    finalPaymentStatus = PENDING;
  } else if (job.second_invoice_paid) {
    downPaymentStatus = COMPLETE;
    finalPaymentStatus = COMPLETE;
  } else {
    downPaymentStatus = UNKNOWN;
    finalPaymentStatus = UNKNOWN;
  }

  return {downPaymentStatus, finalPaymentStatus}
}