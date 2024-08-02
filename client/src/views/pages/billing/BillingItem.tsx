import { useDisclosure } from "@mantine/hooks";
import { FC } from "react";
import http from "../../../services/http.service";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { BillType } from "../../../models/enum/billTypes.enum";
import { ActionIcon, Badge, Button, Collapse, Flex, Grid, Group, Menu, Stack, Table, Text } from "@mantine/core";
import { formatMoney } from "../../../utils/mask.util";
import { getBillDescription } from "../../../utils/bill.util";
import { IconBookmarkFilled, IconCreditCard, IconDotsVertical, IconList, IconTrash } from "@tabler/icons-react";
import classes from './BillingItem.module.css';

interface BillingItemProps {
  bill: any;
  findAll: () => void;
}

const MODAL_ID = 'modalInstallment';

interface ItemBadgeProps {
  icon: any;
  label: string;
  color: string;
}

const ItemBadge: FC<ItemBadgeProps> = ({ icon: Icon, label, color }) => (
  <Badge color={color} mr="sm" variant="light" mt={2}>
    <Icon size={16} className={classes.icon} />
    {label}
  </Badge>
);

const BillingItem: FC<BillingItemProps> = ({ bill, findAll }) => {
  const [open, { toggle }] = useDisclosure(false);

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

  return (
    <>
      <Table.Tr>
        <Table.Td style={{ paddingLeft: 20 }}>
          <Group style={{ cursor: 'pointer' }} onClick={toggle} justify="space-between">
            <span>{getBillDescription(bill)}</span>
            <div onClick={e => e.stopPropagation()}>
              <span style={{ verticalAlign: 'top', display: 'inline-block', marginTop: 6 }}>R$ {formatMoney(bill.amount)}</span>
              <Menu shadow="md" position="bottom-end" id={bill.id} mt={1}>
                <Menu.Target>
                  <ActionIcon variant="transparent" color="gray">
                    <IconDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconTrash color="red" />}
                    onClick={deleteBill.bind(null, bill)}
                  >
                    Remover
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </Group>
          <Collapse in={open}>
            <Group mt={2} mb={8}>
              {(bill.category || bill.card || (bill.tags && bill.tags.length)) && (
                <>
                  {bill.category && (
                    <Flex direction="column">
                      <Text size="xs">Categoria</Text>
                      <ItemBadge
                        icon={IconList}
                        color="cyan"
                        label={bill.category.label}
                      />
                    </Flex>
                  )}
                  {bill.card && (
                    <Flex direction="column">
                      <Text size="xs">Cartão</Text>
                      <ItemBadge
                        icon={IconCreditCard}
                        color="green"
                        label={bill.card.label}
                      />
                    </Flex>
                  )}
                  {bill.tags && bill.tags.length > 0 && (
                    <Flex direction="column">
                      <Text size="xs">Marcadores</Text>
                      <span>
                        {bill.tags.map((tag: any) => (
                          <ItemBadge
                            key={tag.id}
                            icon={IconBookmarkFilled}
                            color="orange"
                            label={tag.label}
                          />
                        ))}
                      </span>
                    </Flex>
                  )}
                </>
              )}
            </Group>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export default BillingItem;

