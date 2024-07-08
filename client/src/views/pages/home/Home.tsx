import { ActionIcon, Flex, Table, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { formatDate, formatMoney } from '../../../utils/mask.util';

const Home: FC = () => {
  const [ref, setRef] = useState<string>(moment().format('MM/YYYY'));
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [ref]);

  const load = async () => {
    const [response, error] = await http.get(`/dashboard/bills/${ref}`);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const next = () =>
    setRef((r) =>
      moment(`01/${r}`, 'DD/MM/YYYY').add(1, 'month').format('MM/YYYY')
    );

  const prev = () =>
    setRef((r) =>
      moment(`01/${r}`, 'DD/MM/YYYY').subtract(1, 'month').format('MM/YYYY')
    );

  const getTotal = () => {
    const total = data
      .flatMap((card) => card.bills.map((it: any) => it.amount), 0)
      .reduce((total, it) => total + it, 0);

    return `R$ ${formatMoney(total)}`;
  };

  return <></>;

  return (
    <div
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="center">
        <ActionIcon mt={4} onClick={prev} variant="transparent">
          <IconArrowLeft />
        </ActionIcon>
        <Title mx={20}>{ref}</Title>
        <ActionIcon mt={4} onClick={next} variant="transparent">
          <IconArrowRight />
        </ActionIcon>
      </Flex>
      <Flex justify="center" mt="md">
        <Title order={3}>{getTotal()}</Title>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          withColumnBorders={true}
          mt="lg"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Cartão</Table.Th>
              <Table.Th style={{ width: 130 }}>Data</Table.Th>
              <Table.Th>Compra</Table.Th>
              <Table.Th style={{ width: 150 }}>Valor</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.flatMap((card) => {
              let total = 0;

              const bills = card.bills.map((bill: any, index: number) => {
                total += bill.amount;

                return (
                  <Table.Tr key={bill.id}>
                    {index === 0 && (
                      <Table.Td rowSpan={card.bills.length + 1} valign="top">
                        {card.label}
                      </Table.Td>
                    )}
                    <Table.Td align="center">{formatDate(bill.buyDate)}</Table.Td>
                    <Table.Td>
                      {bill.description}{' '}
                      {bill.type === 'installments' &&
                        `(${bill.installmentIndex}/${bill.installments})`}
                    </Table.Td>
                    <Table.Td align="right">R$ {formatMoney(bill.amount)}</Table.Td>
                  </Table.Tr>
                );
              });

              bills.push(
                <Table.Tr key={`${card.id}-subtotal`}>
                  <Table.Td colSpan={2}>
                    <b>Subtotal</b>
                  </Table.Td>
                  <Table.Td align="right">
                    <b>R$ {formatMoney(total)}</b>
                  </Table.Td>
                </Table.Tr>,
                <Table.Tr key={`${card.id}-divider`}>
                  <Table.Td colSpan={4} />
                </Table.Tr>
              );

              return bills;
            })}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
};

export default Home;
