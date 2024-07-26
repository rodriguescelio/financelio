import { ActionIcon, Button, Card, Flex, Grid, Group, LoadingOverlay, Menu, Table, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCashRegister, IconChevronLeft, IconCurrencyDollar, IconDotsVertical, IconRestore } from "@tabler/icons-react";
import moment from "moment";
import { FC, useEffect, useState } from "react";
import http from "../../../../services/http.service";
import { useNavigate, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { getBillDescription } from "../../../../utils/bill.util";
import { formatDate, formatMoney } from "../../../../utils/mask.util";
import { InvoiceStatus, invoiceStatus } from "../../../../models/enum/invoiceStatus.enum";
import { useDisclosure } from "@mantine/hooks";
import InvoiceManualAmountModal from "./InvoiceManualAmountModal";
import InvoicePaymentModal from "./InvoicePaymentModal";
import { modals } from "@mantine/modals";

const RESET_PAYMENT_MODAL_ID = 'resetPaymentModalId';

const Invoice: FC = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();

  const [ref, setRef] = useState<string>(moment().format('MM/YYYY'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const [manualAmountOpened, { toggle: toggleManualAmountModal }] = useDisclosure();
  const [paymentOpenend, { toggle: togglePaymentModal }] = useDisclosure();

  useEffect(
    () => {
      loadInvoice();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref]
  );

  const loadInvoice = async () => {
    setLoading(true);

    const [res, err] = await http.get(`/card/${cardId}/invoice/${ref.replace('/','')}`);

    if (err) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar os registros.',
      });
    }

    setData(res);
    setLoading(false);
  };

  const next = () =>
    setRef((r) =>
      moment(`01/${r}`, 'DD/MM/YYYY').add(1, 'month').format('MM/YYYY')
    );

  const prev = () =>
    setRef((r) =>
      moment(`01/${r}`, 'DD/MM/YYYY').subtract(1, 'month').format('MM/YYYY')
    );

  const closeManualAmount = (newData?: any) => {
    if (newData) {
      setData(newData);
    }
    loadInvoice();
    toggleManualAmountModal();
  };

  const closePayment = () => {
    loadInvoice();
    togglePaymentModal();
  };

  const resetPayment = async () => {
    const [_, err] = await http.post(`/card/${cardId}/reset/${data.receipt.id}`);
    if (err) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao executar a operação.',
      });
    } else {
      modals.close(RESET_PAYMENT_MODAL_ID);
      loadInvoice();
    }
  };

  const openResetPaymentModal = () => {
    modals.open({
      modalId: RESET_PAYMENT_MODAL_ID,
      title: 'Reverter pagamento',
      children: (
        <>
          <Text ta="justify">
            Ao reverter o pagamento esta fatura retornará ao status de fechado, o valor pago retornará para a conta de origem e a fatura ficará disponível para um novo pagamento. Deseja prosseguir?
          </Text>
          <Group mt="md" justify="flex-end">
            <Button onClick={() => modals.close(RESET_PAYMENT_MODAL_ID)}>
              Cancelar
            </Button>
            <Button color="red" onClick={resetPayment}>
              Sim, reverter pagamento
            </Button>
          </Group>
        </>
      ),
    });
  };

  const isPaid = data && data.receipt && data.receipt.paid;

  return (
    <div
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <ActionIcon mt={4} onClick={navigate.bind(null, -1)} variant="transparent" color="gray">
          <IconChevronLeft />
        </ActionIcon>
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="transparent" color="gray" size="lg">
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {data && data.receipt && data.receipt.paid ? (
                <Menu.Item
                  leftSection={<IconRestore color="violet" />}
                  onClick={openResetPaymentModal}
                >
                  Reverter pagamento
                </Menu.Item>
              ) : (
                <>
                  <Menu.Item
                    leftSection={<IconCurrencyDollar color="cyan" />}
                    onClick={toggleManualAmountModal}
                  >
                    Ajustar valor manual
                  </Menu.Item>
                  {data && data.status !== InvoiceStatus.EMPTY && (
                    <Menu.Item
                      leftSection={<IconCashRegister color="lime" />}
                      onClick={togglePaymentModal}
                    >
                      Efetuar pagamento
                    </Menu.Item>
                  )}
                </>
              )}
            </Menu.Dropdown>
          </Menu>
      </Flex>
      <Flex justify="center" align="center" mb="md">
        <Group>
          <LoadingOverlay visible={loading} />
          <ActionIcon mt={4} onClick={prev} variant="transparent">
            <IconArrowLeft />
          </ActionIcon>
          <Title mx={20}>{ref}</Title>
          <ActionIcon mt={4} onClick={next} variant="transparent">
            <IconArrowRight />
          </ActionIcon>
        </Group>
      </Flex>
      {data && (
        <>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card>
                <Text fw={500} size="lg" mb="sm">Valor total</Text>
                <Text style={{ fontSize: 40 }} my={isPaid ? 23 : 0} ta="center">
                  R$ {formatMoney(data.receipt ? data.receipt.totalAmount: data.total)}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card>
                <Text fw={500} size="lg" mb="sm">Vencimento</Text>
                <Text style={{ fontSize: 40 }} my={isPaid ? 23 : 0} ta="center">{data.card.payDay.toString().padStart(2, '0')}/{ref}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card>
                <Text fw={500} size="lg" mb="sm">Status</Text>
                {data.receipt && data.receipt.paid ? (
                  <Table>
                    <Table.Tr>
                      <Table.Td>Pagamento</Table.Td>
                      <Table.Td>{invoiceStatus[data.status]}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Data pag.</Table.Td>
                      <Table.Td>{formatDate(data.receipt.paymentDate)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Valor pago</Table.Td>
                      <Table.Td>R$ {formatMoney(data.receipt.paidAmount)}</Table.Td>
                    </Table.Tr>
                  </Table>
                ) : (
                  <Text style={{ fontSize: 40 }} ta="center">{invoiceStatus[data.status]}</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
          <Table mt="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 80 }}>Data</Table.Th>
                <Table.Th>Estabelecimento</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Valor em R$</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.bills.map((it: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td>{moment(it.buyDate).format('DD/MM')}</Table.Td>
                  <Table.Td>{getBillDescription(it)}</Table.Td>
                  <Table.Td align="right">R$ {formatMoney(it.amount)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
      {manualAmountOpened && <InvoiceManualAmountModal onClose={closeManualAmount} data={data} />}
      {paymentOpenend && <InvoicePaymentModal onClose={closePayment} cardId={cardId} data={data} />}
    </div>
  );
};

export default Invoice;
