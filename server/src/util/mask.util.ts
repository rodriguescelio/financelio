import * as moment from 'moment';
import StringMask from 'string-mask';

export const BR_DATE_FORMAT = 'DD/MM/YYYY';
export const PLAIN_DATE_FORMAT = 'DDMMYYYY';

export const formatMoney = (value: number) =>
  new StringMask('#.##0,00', { reverse: true }).apply(
    value.toFixed(2).replace('.', ''),
  );

export const formatDate = (value: string) =>
  moment(value).format(BR_DATE_FORMAT);

export const formatRef = (value: string) =>
  `${value.substring(0, 2)}/${value.substring(2)}`;
