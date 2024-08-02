import moment from "moment";
import StringMask from "string-mask";

export const BR_DATE_FORMAT = "DD/MM/YYYY";
export const PLAIN_DATE_FORMAT = "DDMMYYYY";
export const MONTH_STR_DATE_FORMAT = "DD MMM. YYYY";

export const MONEY_MASK = new StringMask("#.##0,00", { reverse: true });

export const formatMoney = (value: number) =>
  MONEY_MASK.apply(value.toFixed(2).replace(".", ""));

export const formatDate = (value: string | moment.Moment) =>
  (typeof value === "string" ? moment(value) : value).format(BR_DATE_FORMAT);

export const dateToPlain = (date: Date) =>
  moment(date).format(PLAIN_DATE_FORMAT);
