import { Input, NumberInputProps } from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import { MONEY_MASK } from '../../../utils/mask.util';

const MoneyInput: FC<NumberInputProps> = ({
  onChange,
  value,
  label,
  withAsterisk,
  error,
  ...inputProps
}) => {
  const [fmtValue, setFmtValue] = useState<string>('');

  useEffect(
    () => {
      setFmtValue(`R$ ${MONEY_MASK.apply((value || 0).toFixed(2).replace('.', ''))}`);
    },
    [value]
  );

  const onChangeFmt = (event) => {
    const unformattedValue = parseInt(event.target.value.replace(/\D/g, '')).toString();

    let finalValue;

    if (unformattedValue.length === 1) {
      finalValue = `0.0${unformattedValue}`;
    } else if (unformattedValue.length === 2) {
      finalValue = `0.${unformattedValue}`;
    } else {
      const decSep = unformattedValue.length - 2;
      const int = unformattedValue.substring(0, decSep);
      const dec = unformattedValue.substring(decSep);
      finalValue = `${int}.${dec}`;
    }

    if (onChange) {
      onChange(parseFloat(finalValue));
    }
  };

  return (
    <>
      <Input.Wrapper label={label} withAsterisk={withAsterisk} error={error}>
        <Input {...inputProps} value={fmtValue} onChange={onChangeFmt} />
      </Input.Wrapper>
    </>
  );
};

export default MoneyInput;
