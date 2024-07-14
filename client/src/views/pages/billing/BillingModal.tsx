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
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { BillType, billTypes } from '../../../models/enum/billTypes.enum';
import http from '../../../services/http.service';
import { BR_DATE_FORMAT } from '../../../utils/mask.util';
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
      payDate: '',
      isInstallmentAmount: false,
    },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [payDates, setPayDates] = useState<any[]>([]);

  const [loadingPersist, setLoadingPersist] = useState(false);

  useEffect(() => {
    loadCards();
    loadCategories();
    loadTags();
  }, []);

  useEffect(
    () => {
      calculatePayDates();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values.card]
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

      form.values.payDate = selectedDate
        .clone()
        .month(initialMonth + 1)
        .format(BR_DATE_FORMAT);

      setPayDates(
        Array.from(Array(5), (_, monthIndex) => {
          const date = selectedDate.month(initialMonth + monthIndex);
          return {
            label: date.format('DD MMM. YYYY'),
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

  const renderTag = () => {};

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
          <Select
            mb="md"
            label={
              form.values.type === BillType.SINGLE
                ? 'Data do pagamento'
                : 'Data do primeiro pagamento'
            }
            searchable={true}
            clearable={true}
            data={payDates}
            withAsterisk={true}
            {...form.getInputProps('payDate')}
          />
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
