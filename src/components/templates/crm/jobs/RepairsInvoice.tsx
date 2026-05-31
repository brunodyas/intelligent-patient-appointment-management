import React from 'react';
import { Button, Title } from '@/components/atomics'; // Assuming Title is properly styled
import { InvoiceInterface } from '@/interface/jobs';
import { INVOICE_TABLE_STATUS_CHOICES } from '@/constants/enums/invoice';
import { cancelInvoice, sendQuote } from '@/services/jobs';

type Props = {
  finalPayment: InvoiceInterface;
  canGenerateFinalPayment: boolean;
  handleInvoiceForRepairs: () => void;
  configNotChosen: boolean;
  jobId: string;
  fetchJobData: () => void;
}

const COLUMNS = ["Invoice ID", "Payment Type", "Amount", "Status", "Actions"];

const RepairsInvoice = ({ jobId, finalPayment, handleInvoiceForRepairs,fetchJobData, canGenerateFinalPayment, configNotChosen }: Props) => {

  const statusColor = (status: string) => {
    const { NOT_STARTED, PENDING, COMPLETE } = INVOICE_TABLE_STATUS_CHOICES

    let style;

    switch (status) {
      case NOT_STARTED:
        style = "bg-[#f4d8e5] text-black"
        break;
      case PENDING:
        style = "bg-[#fcf7e8] text-[#e18f05]"
        break;
      case COMPLETE:
        style = "bg-[#e4f2e9] text-[#1ea177]"
        break;
      default:
        style = "bg-[#f4d8e5] text-black"
        break;
    }

    return style
  }


  return (
    <div className="container mx-auto p-4">
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-neutral-500">
          <thead className="text-xs text-neutral-700 uppercase bg-gray-50">
            <tr>
              {COLUMNS.map((column, index) => (
                <th key={index} className="py-3 px-6">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>

              <tr className="bg-white border-b text-xs">
                <td className="py-4 px-6">{finalPayment.id}</td>
                <td className="py-4 px-6">
                  <span className="text-primary-main font-semibold bg-primary-surface px-2.5 py-1.5 rounded-full">
                    Full Payment
                  </span>
                </td>
                <td className="py-4 px-6">{finalPayment.amount}</td>
                <td className="py-4 px-6">
                  <span
                    className={`${statusColor(finalPayment.status)} inline-flex items-center px-2.5 py-1.5 rounded-full font-medium`}
                  >
                    {finalPayment.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                {!finalPayment.id && (
                  <Button
                    size="sm"
                    variant="primary-bg"
                    className="!h-10"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      sendQuote(jobId);
                    }}
                  >
                    Send Quote
                  </Button>
                )}
                 {finalPayment.status != "Not Started" && (
                    <Button
                      variant="primary-bg"
                      size="sm"
                      className="!h-10"
                      onClick={async(e: any) => {
                        e.stopPropagation();
                        if(typeof finalPayment.id === "string"){
                          await cancelInvoice(finalPayment.id);
                          fetchJobData();
                        }
                      }}
                    >
                      Cancel Invoice
                    </Button>
                  )}
                  <Button
                    className="!h-10"
                    variant="primary-bg"
                    size="sm"
                    onClick={handleInvoiceForRepairs}
                    disabled={!canGenerateFinalPayment || configNotChosen}
                  >
                    Generate Invoice
                  </Button>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepairsInvoice;
