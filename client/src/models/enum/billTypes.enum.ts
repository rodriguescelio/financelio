export enum BillType {
  SINGLE = 'single',
  RECURRENCE = 'recurrence',
  INSTALLMENTS = 'installments',
}

export const billTypes = [
  { label: 'Cobrança única', value: BillType.SINGLE },
  { label: 'Recorrência', value: BillType.RECURRENCE },
  { label: 'Parcelado', value: BillType.INSTALLMENTS },
];
