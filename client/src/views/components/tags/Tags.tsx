import { Combobox, Pill, PillsInput, useCombobox } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

const Tags: FC<any> = ({ data, value, onChange, ...inputProps }) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [search, setSearch] = useState('');

  useEffect(
    () => {
      if (!value) {
        onChange([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const innerValue: string[] = value || [];

  const select = (val: string) => {
    onChange(innerValue.includes(val) ? innerValue.filter(it => it !== val) : [...innerValue, val]);
    combobox.resetSelectedOption();
  };

  const remove = (val: string) => onChange(innerValue.filter(v => v !== val));

  const onComboFocus = () => combobox.openDropdown();

  const onComboBlur = () => combobox.closeDropdown();

  const onComboChange = (event: any) => {
    combobox.updateSelectedOptionIndex();
    setSearch(event.currentTarget.value);
  };

  const onComboKeyDown = (event: any) => {
    if (event.key === 'Backspace' && search.length === 0) {
      event.preventDefault();
      remove(innerValue[innerValue.length - 1]);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (search.length > 0) {
        combobox.selectFirstOption();
        setSearch('');
      }
    }
  };

  const clear = () => onChange([]);

  const getClearButton = () =>
    innerValue.length > 0 && (
      <IconX size={17} style={{ cursor: 'pointer' }} onClick={clear} />
    );

  const values = innerValue
    .map((itemValue: string) => (
      <Pill
        key={itemValue}
        withRemoveButton={true}
        onRemove={() => remove(itemValue)}
        styles={{
          label: {
            lineHeight: '25px',
          },
        }}
      >
        {data.find(it => it.value === itemValue).label}
      </Pill>
    ));

  const options = data
    .filter(item => !innerValue.includes(item.value))
    .filter(item => item.label.toLowerCase().includes(search.trim().toLowerCase()))
    .map(item => (
      <Combobox.Option
        value={item.value}
        key={item.value}
        active={innerValue.includes(item.value)}
      >
        <span>{item.label}</span>
      </Combobox.Option>
    ));

  return (
    <Combobox store={combobox} onOptionSubmit={select} withinPortal={false} {...inputProps}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={getClearButton()}
        >
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                value={search}
                onFocus={onComboFocus}
                onBlur={onComboBlur}
                onChange={onComboChange}
                onKeyDown={onComboKeyDown}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 && options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default Tags;
