export const withCustomEvents = (
  inputProps: any,
  onBlur?: any,
  onFocus?: any
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
