export enum InvoiceStatus {
  OPEN = "open",
  CLOSED = "closed",
  PAID = "paid",
  PARTIALLY_PAID = "partially_paid",
  EMPTY = "empty",
}

export const invoiceStatus = {
  [InvoiceStatus.OPEN]: "Aberta",
  [InvoiceStatus.CLOSED]: "Fechada",
  [InvoiceStatus.PAID]: "Paga",
  [InvoiceStatus.PARTIALLY_PAID]: "Parcialmente paga",
  [InvoiceStatus.EMPTY]: "Fatura vazia",
};
