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

  return (
    <div
      style={{ padding: 10, paddingRight: '1.5rem', boxSizing: 'border-box' }}
    >
      <Flex justify="center">
        <ActionIcon mt={4} onClick={prev}>
          <IconArrowLeft />
        </ActionIcon>
        <Title mx={20}>{ref}</Title>
        <ActionIcon mt={4} onClick={next}>
          <IconArrowRight />
        </ActionIcon>
      </Flex>
      <Flex justify="center" mt="md">
        <Title order={3}>{getTotal()}</Title>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          withBorder={true}
          withColumnBorders={true}
          mt="lg"
        >
          <thead>
            <tr>
              <th>Cartão</th>
              <th style={{ width: 130 }}>Data</th>
              <th>Compra</th>
              <th style={{ width: 150 }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.flatMap((card) => {
              let total = 0;

              const bills = card.bills.map((bill: any, index: number) => {
                total += bill.amount;

                return (
                  <tr key={bill.id}>
                    {index === 0 && (
                      <td rowSpan={card.bills.length + 1} valign="top">
                        {card.label}
                      </td>
                    )}
                    <td align="center">{formatDate(bill.buyDate)}</td>
                    <td>
                      {bill.description}{' '}
                      {bill.type === 'installments' &&
                        `(${bill.installmentIndex}/${bill.installments})`}
                    </td>
                    <td align="right">R$ {formatMoney(bill.amount)}</td>
                  </tr>
                );
              });

              bills.push(
                <tr key={`${card.id}-subtotal`}>
                  <td colSpan={2}>
                    <b>Subtotal</b>
                  </td>
                  <td align="right">
                    <b>R$ {formatMoney(total)}</b>
                  </td>
                </tr>,
                <tr key={`${card.id}-divider`}>
                  <td colSpan={4} />
                </tr>
              );

              return bills;
            })}
            {/* {data.map((it) => (
              <tr key={it.id}>
                <td>{it.label}</td>
                <td align="right">R$ {formatMoney(it.amountLimit)}</td>
                <td align="right">{it.closeDay}</td>
                <td align="right">{it.payDay}</td>
                <td>
                  <Group position="center">
                    <Tooltip label="Editar cartão">
                      <ActionIcon
                        color="orange"
                        onClick={openEdit.bind(null, it)}
                      >
                        <IconPencil />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remover cartão">
                      <ActionIcon
                        color="red"
                        onClick={deleteCard.bind(null, it.id)}
                        loading={loadingDelete === it.id}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))} */}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Home;
