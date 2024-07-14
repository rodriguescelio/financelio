import {
  ActionIcon,
  Card,
  Flex,
  Grid,
  Group,
  Menu,
  Progress,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { formatMoney } from '../../../utils/mask.util';
import CreditCardModal from './CreditCardModal';
import { useDisclosure } from '@mantine/hooks';

const CreditCard: FC = () => {
  const [opened, { toggle }] = useDisclosure();

  const [data, setData] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);

  useEffect(() => {
    findAll();
  }, []);

  const findAll = async () => {
    const [response, error] = await http.get<any[]>('/card/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const onCloseModal = () => {
    if (opened) {
      setEdit(null);
      toggle();
      findAll();
    }
  };

  const openEdit = (card: any) => {
    setEdit(card);
    toggle();
  };

  const execDeleteCard = async (cardId: string) => {
    const [, error] = await http.delete(`/card/delete/${cardId}`);

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

  const deleteCard = (cardId: string) => {
    modals.openConfirmModal({
      title: 'Exclusão de registro',
      children: <Text>Deseja mesmo excluir este registro?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => execDeleteCard(cardId),
    });
  };

  return (
    <div
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus cartões</Title>
        <Tooltip label="Cadastrar novo cartão" position="left-end">
          <ActionIcon onClick={toggle} size="lg">
            <IconPlus />
          </ActionIcon>
        </Tooltip>
      </Flex>
       <Grid mt={30}>
        {data.map((it, index) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
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
                        leftSection={<IconPencil color="orange" />}
                        onClick={openEdit.bind(null, it)}
                      >
                        Editar
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash color="red" />}
                        onClick={deleteCard.bind(null, it.id)}
                      >
                        Remover
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card.Section>
              <Text mt="sm" c="dimmed" size="sm">
                <Group justify="space-between">
                  <Flex direction="column">
                    <Text c="gray.5">Utilizado</Text>
                    <Text c="gray.5">R$ {formatMoney(it.amountUsed)}</Text>
                  </Flex>
                  <Flex direction="column" align="flex-end">
                    <Text c="gray.5">Disponível</Text>
                    <Text c="gray.5">R$ {formatMoney(it.amountLimit - it.amountUsed)}</Text>
                  </Flex>
                </Group>
                <Progress value={(it.amountUsed * 100) / it.amountLimit} size="xl" />
                <Text c="gray.5" mt={20}>Limite total: R$ {formatMoney(it.amountLimit)}</Text>
                <Text c="gray.5">Dia do fechamento: {it.closeDay.toString().padStart(2, '0')}</Text>
                <Text c="gray.5">Dia do vencimento: {it.payDay.toString().padStart(2, '0')}</Text>
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      {opened && <CreditCardModal edit={edit} onClose={onCloseModal} />}
    </div>
  );
};

export default CreditCard;
