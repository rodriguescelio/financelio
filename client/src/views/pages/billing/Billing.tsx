import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { BillType, billTypes } from '../../../models/enum/billTypes.enum';
import http from '../../../services/http.service';
import { formatDate, formatMoney } from '../../../utils/mask.util';
import BillingModal from './BillingModal';

const MODAL_ID = 'modalInstallment';

const Billing: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [loadingDelete, setLoadingDelete] = useState('');

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

  const toggleModal = () => setModalOpen((p) => !p);

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
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus lançamentos</Title>
        <Button onClick={toggleModal.bind(null, true)}>Novo lançamento</Button>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          highlightOnHover={true}
          withColumnBorders={true}
          withTableBorder={true}
          withRowBorders={true}
          mt="lg"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Data</Table.Th>
              <Table.Th>Data de pag.</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>Categoria</Table.Th>
              <Table.Th>Cartão</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Valor</Table.Th>
              <Table.Th style={{ width: 120 }}>Opções</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((it) => (
              <Table.Tr key={it.id}>
                <Table.Td>{formatDate(it.buyDate)}</Table.Td>
                <Table.Td>{formatDate(it.billDate)}</Table.Td>
                <Table.Td>{getDescription(it)}</Table.Td>
                <Table.Td>{it.category && it.category.label}</Table.Td>
                <Table.Td>{it.card && it.card.label}</Table.Td>
                <Table.Td>
                  {billTypes.find((type) => type.value === it.type)?.label}
                </Table.Td>
                <Table.Td>R$ {formatMoney(it.amount)}</Table.Td>
                <Table.Td>
                  <Group justify="center">
                    <Tooltip label="Remover lançamento">
                      <ActionIcon
                        color="red"
                        onClick={deleteBill.bind(null, it)}
                        loading={loadingDelete === it.id}
                        variant="transparent"
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {modalOpen && <BillingModal onClose={toggleModal} />}
    </div>
  );
};

export default Billing;
