import {
  ActionIcon,
  Button,
  Flex,
  FocusTrap,
  Group,
  Modal,
  SegmentedControl,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCoin, IconPencil, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { formatMoney } from '../../../utils/mask.util';
import MoneyInput from '../../components/moneyInput/MoneyInput';

const entryTypes = [
  { label: 'Crédito', value: 'credit' },
  { label: 'Débito', value: 'debit' },
  { label: 'Saldo', value: 'value' },
];

const BankAccount: FC = () => {
  const formBankAccount = useForm({
    initialValues: {
      id: '',
      label: '',
    },
  });

  const formBankEntry = useForm({
    initialValues: {
      bankAccount: { id: '' },
      description: '',
      amount: 0,
      type: 'credit',
    },
  });

  const [modalBankAccountOpen, setModalBankAccountOpen] = useState(false);
  const [modalBankEntryOpen, setModalBankEntryOpen] = useState(false);
  const [loadingPersist, setLoadingPersist] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState('');

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    findAll();
  }, []);

  const findAll = async () => {
    const [response, error] = await http.get<any[]>('/bankAccount/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const toggleBankAccountModal = () => setModalBankAccountOpen((p) => !p);
  const toggleBankEntryModal = () => setModalBankEntryOpen((p) => !p);

  const openNewEntry = (bankAccountId: string) => {
    formBankEntry.values.bankAccount.id = bankAccountId;
    toggleBankEntryModal();
  };

  const openEditBankAccount = (bankAccount: any) => {
    formBankAccount.values.id = bankAccount.id;
    formBankAccount.values.label = bankAccount.label;
    toggleBankAccountModal();
  };

  const onSubmitBankAccount = async (
    formData: typeof formBankAccount.values
  ) => {
    setLoadingPersist(true);

    const [, error] = await http.post<any>('/bankAccount/persist', formData);

    setLoadingPersist(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      toggleBankAccountModal();
      formBankAccount.reset();
      findAll();
    }
  };

  const onSubmitBankEntry = async (formData: typeof formBankEntry.values) => {
    setLoadingPersist(true);

    const [, error] = await http.post<any>(
      '/bankAccount/persistEntry',
      formData
    );

    setLoadingPersist(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      toggleBankEntryModal();
      formBankEntry.reset();
      formBankEntry.values.type = 'credit';
      findAll();
    }
  };

  const execDeleteBankAccount = async (bankAccountId: string) => {
    setLoadingDelete(bankAccountId);

    const [, error] = await http.delete(`/bankAccount/delete/${bankAccountId}`);

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

  const deleteBankAccount = (bankAccountId: string) => {
    modals.openConfirmModal({
      title: 'Exclusão de registro',
      children: <Text>Deseja mesmo excluir este registro?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => execDeleteBankAccount(bankAccountId),
    });
  };

  return (
    <div
      style={{ padding: 10, paddingRight: '1.5rem', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Minhas contas</Title>
        <Button onClick={toggleBankAccountModal}>Nova conta</Button>
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
              <th>Conta</th>
              <th style={{ width: 150 }}>Saldo</th>
              <th style={{ width: 150 }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => (
              <tr key={it.id}>
                <td>{it.label}</td>
                <td align="right">R$ {formatMoney(it.amount)}</td>
                <td>
                  <Group position="center">
                    <Tooltip label="Atualizar saldo">
                      <ActionIcon
                        color="blue"
                        onClick={openNewEntry.bind(null, it.id)}
                      >
                        <IconCoin />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Editar conta">
                      <ActionIcon
                        color="orange"
                        onClick={openEditBankAccount.bind(null, it)}
                      >
                        <IconPencil />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remover conta">
                      <ActionIcon
                        color="red"
                        onClick={deleteBankAccount.bind(null, it.id)}
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
        opened={modalBankAccountOpen}
        onClose={toggleBankAccountModal}
        title="Conta"
      >
        <form onSubmit={formBankAccount.onSubmit(onSubmitBankAccount)}>
          <FocusTrap active={modalBankAccountOpen}>
            <TextInput
              label="Conta"
              withAsterisk={true}
              data-autofocus={true}
              {...formBankAccount.getInputProps('label')}
            />
          </FocusTrap>
          <Group position="right" mt="md">
            <Button type="submit" loading={loadingPersist}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={modalBankEntryOpen}
        onClose={toggleBankEntryModal}
        title="Saldo em conta"
      >
        <form onSubmit={formBankEntry.onSubmit(onSubmitBankEntry)}>
          <FocusTrap active={modalBankEntryOpen}>
            <SegmentedControl
              fullWidth={true}
              data={entryTypes}
              mb="md"
              {...formBankEntry.getInputProps('type')}
            />
            <MoneyInput
              label="Valor"
              data-autofocus={true}
              withAsterisk={true}
              {...formBankEntry.getInputProps('amount')}
            />
            <Textarea
              mt="md"
              label="Descrição"
              {...formBankEntry.getInputProps('description')}
            />
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

export default BankAccount;
