import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Menu,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconBookmarkFilled, IconCreditCard, IconDotsVertical, IconList, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { BillType } from '../../../models/enum/billTypes.enum';
import http from '../../../services/http.service';
import { formatDate, formatMoney } from '../../../utils/mask.util';
import BillingModal from './BillingModal';
import { useDisclosure } from '@mantine/hooks';
import classes from './Billing.module.css';

const MODAL_ID = 'modalInstallment';

interface ItemBadgeProps {
  icon: any;
  label: string;
  color: string;
}

const ItemBadge: FC<ItemBadgeProps> = ({ icon: Icon, label, color }) => (
  <Badge color={color} mr="sm" variant="light" mt={7}>
    <Icon size={16} className={classes.icon} />
    {label}
  </Badge>
);

const Billing: FC = () => {
  const [data, setData] = useState<any[]>([]);

  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    findAll();
  }, []);

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

  const toggleModal = () => {
    if (opened) {
      toggle();
      findAll();
    }
  };

  const deleteSingleBill = async (billId: string) => {
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
  };

  const deleteInstallmentSingle = (billId: string) => {
    modals.close(MODAL_ID);
    deleteSingleBill(billId);
  };

  const deleteInstallment = async (billId: string, type: string) => {
    modals.close(MODAL_ID);

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
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus lançamentos</Title>
        <Tooltip label="Cadastrar novo lançamento" position="left-end">
          <ActionIcon onClick={toggle} size="lg">
            <IconPlus />
          </ActionIcon>
        </Tooltip>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          withColumnBorders={true}
          withTableBorder={true}
          withRowBorders={true}
          mt="lg"
        >
          <Table.Tbody>
            {data.map((it) => (
              <Table.Tr key={it.id}>
                <Table.Td className={classes.item}>
                  <div className={classes.itemBody}>
                    <div className={classes.bodyContent}>
                      <span className={classes.dates}>
                        {formatDate(it.buyDate)} - {formatDate(it.billDate)}
                      </span>
                      <Title order={4}>{getDescription(it)}</Title>
                      {(it.category || it.card || (it.tags && it.tags.length)) && (
                        <div className={classes.tags}>
                          {it.category && (
                            <ItemBadge
                              icon={IconList}
                              color="cyan"
                              label={it.category.label}
                            />
                          )}
                          {it.card && (
                            <ItemBadge
                              icon={IconCreditCard}
                              color="green"
                              label={it.card.label}
                            />
                          )}
                          {it.tags && it.tags.length > 0 && (
                            <span>
                              {it.tags.map((tag: any) => (
                                <ItemBadge
                                  key={tag.id}
                                  icon={IconBookmarkFilled}
                                  color="orange"
                                  label={tag.label}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={classes.money}>
                      <span>R$</span>
                      <span>{formatMoney(it.amount)}</span>
                    </span>
                    <Menu shadow="md" position="bottom-end" id={it.id}>
                      <Menu.Target>
                        <ActionIcon variant="transparent" color="gray">
                          <IconDotsVertical />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconTrash color="red" />}
                          onClick={deleteBill.bind(null, it)}
                        >
                          Remover
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {opened && <BillingModal onClose={toggleModal} />}
    </div>
  );
};

export default Billing;
