import { BillType } from "../models/enum/billTypes.enum";

export const getBillDescription = (bill: any) => {
  let description = bill.description;

  if (bill.type === BillType.INSTALLMENTS) {
    description += ` (${bill.installmentIndex}/${bill.installments})`;
  }

  return description;
};
