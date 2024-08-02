import {
  Button,
  Checkbox,
  Flex,
  FocusTrap,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { BillType, billTypes } from '../../../models/enum/billTypes.enum';
import http from '../../../services/http.service';
import { BR_DATE_FORMAT, MONTH_STR_DATE_FORMAT } from '../../../utils/mask.util';
import MoneyInput from '../../components/moneyInput/MoneyInput';
import { toSelect } from '../../../utils/form.util';
import Tags from '../../components/tags/Tags';

interface BillingModalProps {
  onClose: () => void;
}

const BillingModal: FC<BillingModalProps> = ({ onClose }) => {
  const form = useForm({
    initialValues: {
      type: 'single',
      date: new Date(),
      category: '',
      card: '',
      description: '',
      amount: 0,
      installments: 0,
      payDateSelect: '',
      payDate: new Date(),
      isInstallmentAmount: false,
      paid: false,
      bankAccount: '',
      debit: true,
      markPreviousPaid: true,
    },
    validate: {
      amount: value => value > 0 ? null : 'Valor deve ser maior que R$ 0',
      description: isNotEmpty('Informe uma descrição para este lançamento'),
      date: isNotEmpty('Informe a data da compra'),
      // TODO data de pagamento realmente deveria ser obrigatório?
      payDate: isNotEmpty('Informe a data do pagamento'),
      installments: (value, values) => values.type === BillType.INSTALLMENTS && value < 1 ? 'Informe o número de parcelas' : null,
    },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [payDates, setPayDates] = useState<any[]>([]);

  const [loadingPersist, setLoadingPersist] = useState(false);
  const [isFirstDateBefore, setIsFirstDateBefore] = useState(false);

  useEffect(() => {
    loadCards();
    loadCategories();
    loadTags();
    loadBankAccounts();
  }, []);

  useEffect(
    () => {
      if (form.values.card) {
        calculatePayDates();
      } else {
        form.setValues({ payDate: new Date() });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values.card]
  );

  useEffect(
    () => {
      if (!form.values.paid) {
        form.values.debit = true;
        form.values.bankAccount = '';
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values.paid]
  );

  useEffect(
    () => {
      if (form.values.payDateSelect) {
        form.setValues({ payDate: moment(form.values.payDateSelect, BR_DATE_FORMAT).toDate() });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values.payDateSelect]
  );

  useEffect(
    () => {
      let result = false;

      if (form.values.payDate && form.values.date && form.values.type === BillType.INSTALLMENTS) {
        const payDate = moment(form.values.payDate);
        const date = moment(form.values.date);
        result = payDate.month() !== date.month() && payDate.isBefore(date);
      }

      setIsFirstDateBefore(result);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values.payDate]
  );

  const loadCards = async () => {
    const [response, error] = await http.get<any[]>('/card/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setCards(response || []);
  };

  const loadCategories = async () => {
    const [response, error] = await http.get<any[]>('/category/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setCategories(response || []);
  };

  const loadTags = async () => {
    const [response, error] = await http.get<any[]>('/tag/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setTags(response || []);
  };

  const loadBankAccounts = async () => {
    const [response, error] = await http.get<any[]>('/bankAccount/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setBankAccounts(response || []);
  };

  const calculatePayDates = () => {
    if (form.values.date) {
      const selectedDate = moment(form.values.date);
      const currentDay = selectedDate.date();

      let initialMonth = selectedDate.month() - 1;

      if (form.values.card) {
        const card = cards.find((it) => it.id === form.values.card);
        if (card) {
          selectedDate.date(card.payDay);
          if (currentDay <= card.closeDate) {
            initialMonth--;
          }
        }
      }

      form.values.payDateSelect = selectedDate
        .clone()
        .month(initialMonth + 1)
        .format(BR_DATE_FORMAT);

      setPayDates(
        Array.from(Array(5), (_, monthIndex) => {
          const date = selectedDate.month(initialMonth + monthIndex);
          return {
            label: date.format(MONTH_STR_DATE_FORMAT),
            value: date.format(BR_DATE_FORMAT),
          };
        })
      );

      return;
    }

    setPayDates([]);
  };

  const onSubmit = async (formData: typeof form.values) => {
    setLoadingPersist(true);

    const [, error] = await http.post('/bill/create', formData);

    setLoadingPersist(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      onClose();
    }
  };

  const labelPayDate = form.values.type === BillType.SINGLE
                ? 'Data do pagamento'
                : 'Data do primeiro pagamento';

  return (
    <Modal opened={true} onClose={onClose} title="Lançamento">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <FocusTrap active={true}>
          <SegmentedControl
            fullWidth={true}
            data={billTypes}
            mb="md"
            {...form.getInputProps('type')}
          />
          <Flex>
            <div style={{ flexGrow: 1, marginBottom: 'var(--mantine-spacing-md)' }}>
              <MoneyInput
                label="Valor"
                data-autofocus={true}
                withAsterisk={true}
                {...form.getInputProps('amount')}
              />
            </div>
            {form.values.type === BillType.INSTALLMENTS && (
              <Checkbox
                label="Valor da parcela"
                style={{ marginTop: 32, marginLeft: 20 }}
                {...form.getInputProps('isInstallmentAmount')}
              />
            )}
          </Flex>
          {form.values.type === BillType.INSTALLMENTS && (
            <NumberInput
              mb="md"
              label="Nº de parcelas"
              withAsterisk={true}
              {...form.getInputProps('installments')}
            />
          )}
          <TextInput
            mb="md"
            label="Descrição"
            withAsterisk={true}
            {...form.getInputProps('description')}
          />
          <DateInput
            label="Data da compra"
            mb="md"
            firstDayOfWeek={0}
            valueFormat="DD/MM/YYYY"
            withAsterisk={true}
            {...form.getInputProps('date')}
          />
          <Select
            mb="md"
            label="Categoria"
            searchable={true}
            clearable={true}
            data={toSelect(categories)}
            {...form.getInputProps('category')}
          />
          <Tags label="Marcadores" data={toSelect(tags)} mb="md" {...form.getInputProps('tags')} />
          <Select
            mb="md"
            label="Cartão"
            searchable={true}
            clearable={true}
            data={toSelect(cards)}
            {...form.getInputProps('card')}
          />
          {form.values.card ? (
            <Select
              mb="md"
              label={labelPayDate}
              searchable={true}
              clearable={true}
              data={payDates}
              withAsterisk={true}
              {...form.getInputProps('payDateSelect')}
            />
          ) : (
            <>
              <DateInput
                label={labelPayDate}
                mb="md"
                firstDayOfWeek={0}
                valueFormat="DD/MM/YYYY"
                withAsterisk={true}
                {...form.getInputProps('payDate')}
              />
              {isFirstDateBefore && (
                <Checkbox
                  mb="md"
                  defaultChecked={true}
                  label="Marcar parcelas anteriores à data atual como pagas"
                  {...form.getInputProps('markPreviousPaid')}
                />
              )}
            </>
          )}
          {form.values.type === BillType.SINGLE && !form.values.card && (
            <>
                <Checkbox
                  mb="md"
                  label="Este lançamento já foi pago"
                  {...form.getInputProps('paid')}
                />
                {form.values.paid && (
                  <>
                    <Select
                      mb="md"
                      label="Conta"
                      searchable={true}
                      clearable={true}
                      data={toSelect(bankAccounts)}
                      {...form.getInputProps('bankAccount')}
                    />
                    {form.values.bankAccount && (
                      <Checkbox
                        mb="md"
                        defaultChecked={true}
                        label="Debitar valor da conta informada"
                        {...form.getInputProps('debit')}
                      />
                    )}
                  </>
                )}
            </>
          )}
        </FocusTrap>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loadingPersist}>
            Salvar
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default BillingModal;
