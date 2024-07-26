import {
  ActionIcon,
  Button,
  Card,
  Flex,
  FocusTrap,
  Grid,
  Group,
  Menu,
  Modal,
  SegmentedControl,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCoin, IconDotsVertical, IconHistory, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { formatMoney } from '../../../utils/mask.util';
import MoneyInput from '../../components/moneyInput/MoneyInput';
import { useDisclosure } from '@mantine/hooks';
import BankAccountModal from './BankAccountModal';

const entryTypes = [
  { label: 'Crédito', value: 'credit' },
  { label: 'Débito', value: 'debit' },
  { label: 'Saldo', value: 'value' },
];

const BankAccount: FC = () => {
  const form = useForm({
    initialValues: {
      bankAccount: { id: '' },
      description: '',
      amount: 0,
      type: 'credit',
    },
  });

  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  const [bankAccountOpen, { toggle: toggleBankAccount }] = useDisclosure();
  const [bankEntryOpen, { toggle: toggleBankEntry }] = useDisclosure();

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

  const onCloseBankAccountModal = () => {
    setEdit(null);
    toggleBankAccount();
    findAll();
  };

  const openNewEntry = (bankAccountId: string) => {
    form.values.bankAccount.id = bankAccountId;
    toggleBankEntry();
  };

  const openEditBankAccount = (bankAccount: any) => {
    setEdit(bankAccount);
    toggleBankAccount();
  };

  const onSubmit = async (formData: typeof form.values) => {
    setLoading(true);

    const [, error] = await http.post<any>(
      '/bankAccount/persistEntry',
      formData
    );

    setLoading(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      toggleBankEntry();
      form.reset();
      form.values.type = 'credit';
      findAll();
    }
  };

  const execDeleteBankAccount = async (bankAccountId: string) => {
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
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Minhas contas</Title>
        <Tooltip label="Cadastrar nova conta" position="left-end">
          <ActionIcon onClick={toggleBankAccount} size="lg">
            <IconPlus />
          </ActionIcon>
        </Tooltip>
      </Flex>
      <Grid mt={30}>
        {data.map((it) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={it.id}>
            <Card withBorder={true} shadow="sm" radius="md">
              <Card.Section withBorder={true} inheritPadding={true} py="xs" pr={5}>
                <Group justify="space-between">
                  <Text fw={500}>{it.label}</Text>
                  <Menu shadow="md" position="bottom-end" id={it.id}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCoin color="teal" />}
                        onClick={openNewEntry.bind(null, it.id)}
                      >
                        Atualizar saldo
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconHistory color="teal" />}
                      >
                        Histórico de movimentações
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconPencil color="orange" />}
                        onClick={openEditBankAccount.bind(null, it)}
                      >
                        Editar
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash color="red" />}
                        onClick={deleteBankAccount.bind(null, it.id)}
                      >
                        Remover
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card.Section>
              <Group justify="space-between" mt="sm">
                <Text c="white" size="sm">Saldo atual</Text>
                <Text c="teal" size="sm">R$ {formatMoney(it.amount)}</Text>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      {bankAccountOpen && <BankAccountModal edit={edit} onClose={onCloseBankAccountModal} />}
      <Modal
        opened={bankEntryOpen}
        onClose={toggleBankEntry}
        title="Saldo em conta"
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <FocusTrap active={bankEntryOpen}>
            <SegmentedControl
              fullWidth={true}
              data={entryTypes}
              mb="md"
              {...form.getInputProps('type')}
            />
            <MoneyInput
              label="Valor"
              data-autofocus={true}
              withAsterisk={true}
              {...form.getInputProps('amount')}
            />
            <Textarea
              mt="md"
              label="Descrição"
              {...form.getInputProps('description')}
            />
          </FocusTrap>
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loading}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default BankAccount;
