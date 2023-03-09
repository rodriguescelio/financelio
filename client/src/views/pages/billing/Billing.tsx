import {
  ActionIcon,
  Button,
  Checkbox,
  Flex,
  FocusTrap,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { formatDate, formatMoney } from '../../../utils/mask.util';
import MoneyInput from '../../components/moneyInput/MoneyInput';

enum BillType {
  SINGLE = 'single',
  RECURRENCE = 'recurrence',
  INSTALLMENTS = 'installments',
}

const billTypes = [
  { label: 'Cobrança única', value: BillType.SINGLE },
  { label: 'Recorrência', value: BillType.RECURRENCE },
  { label: 'Parcelado', value: BillType.INSTALLMENTS },
];

const MODAL_ID = 'modalInstallment';

const Billing: FC = () => {
  const form = useForm({
    initialValues: {
      type: 'single',
      date: new Date(),
      category: '',
      card: '',
      description: '',
      amount: 0,
      installments: 0,
      isInstallmentAmount: false,
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loadingPersist, setLoadingPersist] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState('');

  useEffect(() => {
    loadCards();
    loadCategories();
    findAll();
  }, []);

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

  const findAll = async () => {
    const [response, error] = await http.get<any[]>('/bill/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const toggleModal = () => setModalOpen((p) => !p);

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
      toggleModal();
      form.reset();
      findAll();
    }
  };

  const deleteSingleBill = async (billId: string) => {
    setLoadingDelete(billId);

    const [, error] = await http.delete(`/bill/deleteSingle/${billId}`);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro ao excluir o registro.',
      });
    } else {
      findAll();
    }

    setLoadingDelete('');
  };

  const deleteInstallmentSingle = (billId: string) => {
    modals.close(MODAL_ID);
    deleteSingleBill(billId);
  };

  const deleteInstallment = async (billId: string, type: string) => {
    modals.close(MODAL_ID);
    setLoadingDelete(billId);

    const [, error] = await http.post(`/bill/delete/${billId}`, { type });

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro ao excluir o registro.',
      });
    } else {
      findAll();
    }

    setLoadingDelete('');
  };

  const deleteBill = (bill: any) => {
    if (bill.type === BillType.INSTALLMENTS) {
      modals.open({
        modalId: MODAL_ID,
        title: 'Exclusão de registro',
        children: (
          <>
            <Text>
              Você está removendo um lançamento parcelado, o que deseja fazer?
            </Text>
            <Group mt="md">
              <Button
                fullWidth={true}
                color="red"
                onClick={deleteInstallment.bind(null, bill.id, 'all')}
              >
                Apagar todas as parcelas
              </Button>
              <Button
                fullWidth={true}
                color="red"
                onClick={deleteInstallmentSingle.bind(null, bill.id)}
              >
                Apagar somente esta parcela
              </Button>
              <Button
                fullWidth={true}
                color="red"
                onClick={deleteInstallment.bind(null, bill.id, 'next')}
              >
                Apagar esta e as próximas parcelas
              </Button>
              <Button fullWidth={true}>Cancelar</Button>
            </Group>
          </>
        ),
      });
    } else {
      modals.openConfirmModal({
        title: 'Exclusão de registro',
        children: <Text>Deseja mesmo excluir este registro?</Text>,
        labels: { confirm: 'Excluir', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        onConfirm: () => deleteSingleBill(bill.id),
      });
    }
  };

  const getDescription = (bill: any) => {
    let description = bill.description;

    if (bill.type === BillType.INSTALLMENTS) {
      description += ` (${bill.installmentIndex}/${bill.installments})`;
    }

    return description;
  };

  return (
    <div
      style={{ padding: 10, paddingRight: '1.5rem', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus lançamentos</Title>
        <Button onClick={toggleModal.bind(null, true)}>Novo lançamento</Button>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          highlightOnHover={true}
          withBorder={true}
          withColumnBorders={true}
          mt="lg"
        >
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Cartão</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th style={{ width: 120 }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => (
              <tr key={it.id}>
                <td>{formatDate(it.billDate)}</td>
                <td>{getDescription(it)}</td>
                <td>{it.category && it.category.label}</td>
                <td>{it.card && it.card.label}</td>
                <td>
                  {billTypes.find((type) => type.value === it.type)?.label}
                </td>
                <td>R$ {formatMoney(it.amount)}</td>
                <td>
                  <Group position="center">
                    <Tooltip label="Remover lançamento">
                      <ActionIcon
                        color="red"
                        onClick={deleteBill.bind(null, it)}
                        loading={loadingDelete === it.id}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal
        opened={modalOpen}
        onClose={toggleModal.bind(null, true)}
        title="Lançamento"
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <FocusTrap active={modalOpen}>
            <SegmentedControl
              fullWidth={true}
              data={billTypes}
              mb="md"
              {...form.getInputProps('type')}
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
              data={categories.map((it) => ({ label: it.label, value: it.id }))}
              {...form.getInputProps('category')}
            />
            <Select
              mb="md"
              label="Cartão"
              searchable={true}
              clearable={true}
              data={cards.map((it) => ({ label: it.label, value: it.id }))}
              {...form.getInputProps('card')}
            />
            <TextInput
              mb="md"
              label="Descrição"
              withAsterisk={true}
              data-autofocus={true}
              {...form.getInputProps('description')}
            />
            <Flex>
              <div style={{ flexGrow: 1 }}>
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
                mt="md"
                label="Nº de parcelas"
                withAsterisk={true}
                {...form.getInputProps('installments')}
              />
            )}
          </FocusTrap>
          <Group position="right" mt="md">
            <Button type="submit" loading={loadingPersist}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
