export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  serviceName: string;
  amount: number;
  companyName: string;
  currencySymbol?: string;
}

export function generateInvoiceSummary(data: InvoiceData) {
  const symbol = data.currencySymbol || "£";
  return `
    INVOICE: ${data.invoiceNumber}
    DATE: ${data.date}
    -------------------------
    CLIENT: ${data.clientName}
    SERVICE: ${data.serviceName}
    TOTAL: ${symbol}${data.amount.toFixed(2)}
    -------------------------
    Thank you for choosing ${data.companyName}!
  `;
}
