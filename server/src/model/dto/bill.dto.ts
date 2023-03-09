import { BillType } from "../enumerated/billType.enum";

export class BillDTO {
  id: string;
  category: string;
  card: string;
  type: BillType;
  date: string;
  description: string;
  amount: number;
  installments: number;
  isInstallmentAmount: boolean;
}
