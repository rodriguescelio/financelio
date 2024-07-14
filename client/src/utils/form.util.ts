export const withCustomEvents = (
  inputProps: any,
  onBlur?: any,
  onFocus?: any,
) => ({
  ...inputProps,
  onBlur: onBlur
    ? (e: any) => {
        inputProps.onBlur(e);
        onBlur(e);
      }
    : inputProps.onBlur,
  onFocus: onFocus
    ? (e: any) => {
        inputProps.onFocus(e);
        onFocus(e);
      }
    : inputProps.onFocus,
});

export const toSelect = (list: any[], label = "label", value = "id") =>
  list.map((it) => ({
    label: it[label],
    value: it[value],
  }));
