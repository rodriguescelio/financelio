import { NumberInput, NumberInputProps } from '@mantine/core';
import { FC } from 'react';
import { MONEY_MASK } from '../../../utils/mask.util';

const MoneyInput: FC<NumberInputProps> = (inputProps) => {
  return (
    <NumberInput
      {...inputProps}
      precision={2}
      parser={(value) => {
        let result = '0';
        if (value) {
          const parsed = value.replace(/[.,\sR$]/g, '');

          if (parsed.length == 1) {
            result = `0.0${parsed}`;
          } else if (parsed.length == 2) {
            result = `0.${parsed}`;
          } else {
            const int = parsed.substring(0, parsed.length - 2);
            const decimal = parsed.substring(parsed.length - 2);
            result = `${int}.${decimal}`;
          }
        }
        return result;
      }}
      formatter={(value) =>
        `R$ ${MONEY_MASK.apply(
          parseFloat(value || '0')
            .toFixed(2)
            .replace('.', '')
        )}`
      }
    />
  );
};

export default MoneyInput;
