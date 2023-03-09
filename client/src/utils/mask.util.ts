import moment from 'moment';
import StringMask from 'string-mask';

export const MONEY_MASK = new StringMask('#.##0,00', { reverse: true });

export const formatMoney = (value: number) =>
  MONEY_MASK.apply(value.toFixed(2).replace('.', ''));

export const formatDate = (value: string) => moment(value).format('DD/MM/YYYY');
