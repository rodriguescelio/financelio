import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Collapse,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  Select,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEraser, IconFilter, IconPlus, IconSearch } from '@tabler/icons-react';
import { FC, useEffect, useRef, useState } from 'react';
import { billTypes } from '../../../models/enum/billTypes.enum';
import http from '../../../services/http.service';
import { dateToPlain, formatMoney, MONTH_STR_DATE_FORMAT } from '../../../utils/mask.util';
import BillingModal from './BillingModal';
import { useDisclosure } from '@mantine/hooks';
import classes from './Billing.module.css';
import { useForm } from '@mantine/form';
import Tags from '../../components/tags/Tags';
import { DateInput } from '@mantine/dates';
import moment from 'moment';
import { toSelect } from '../../../utils/form.util';
import { BILLING, BILLING_FILTER_TYPE_ENUM, BUY } from '../../../models/enum/billingFilterType.enum';
import BillingItem from './BillingItem';

const NO_TIME_DATE = { hour: 0, minute: 0, second: 0, millisecond: 0 };

const Billing: FC = () => {
  const form = useForm({
    initialValues: {
      dateStart: moment().startOf('month').toDate(),
      dateEnd: moment().endOf('month').toDate(),
      filterType: BILLING.value,
      unpaid: true,
      paid: true,
      categories: [],
      cards: [],
      tags: [],
      types: []
    },
  });

  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(BILLING.value);

  const [opened, { toggle }] = useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);

  const filter = useRef<HTMLButtonElement | null>(null);

  useEffect(
    () => {
      loadCards();
      loadCategories();
      loadTags();
      findAll();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const findAll = async () => {
    setLoading(true);

    const query = new URLSearchParams();

    query.append("start", dateToPlain(form.values.dateStart));
    query.append("end", dateToPlain(form.values.dateEnd));
    query.append("unpaid", form.values.unpaid.toString());
    query.append("paid", form.values.paid.toString());
    query.append("filterType", form.values.filterType);

    form.values.categories.forEach(it => {
      query.append("categories[]", it);
    });

    form.values.cards.forEach(it => {
      query.append("cards[]", it);
    });

    form.values.tags.forEach(it => {
      query.append("tags[]", it);
    });

    form.values.types.forEach(it => {
      query.append("types[]", it);
    });

    const [response, error] = await http.get<any[]>(`/bill/findAll?${query.toString()}`);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setLoading(false);

    setData(response || []);
    setFilterType(form.values.filterType);
  };

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

  const loadTags = async () => {
    const [response, error] = await http.get<any[]>('/tag/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setTags(response || []);
  };

  const toggleModal = () => {
    if (opened) {
      toggle();
      findAll();
    }
  };


  const clear = () => {
    form.reset();
    setTimeout(() => {
      filter.current?.click();
    }, 50);
  };

  const sortByDate = (items: any[]) => {
    const result: any[] = [];
    let lastDate: moment.Moment | null = null;

    items.forEach((it: any) => {
      const date = moment(it[filterType === BUY.value ? 'buyDate' : 'billDate']).set(NO_TIME_DATE);
      if (lastDate === null || !date.isSame(lastDate)) {
        result.push({ date, items: [it] });
        lastDate = date;
      } else {
        result[result.length - 1].items.push(it);
      }
    });

    return result;
  };

  return (
    <div
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus lançamentos</Title>
        <Group>
          <Tooltip label="Filtrar lançamentos" position="left-end">
            <ActionIcon onClick={toggleFilter} size="lg" color="yellow">
              <IconFilter />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Cadastrar novo lançamento" position="left-end">
            <ActionIcon onClick={toggle} size="lg">
              <IconPlus />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
      <Collapse in={filterOpened} pos="relative">
        <LoadingOverlay visible={loading} />
        <div className={classes.filters}>
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Group align="flex-end" grow={true}>
                <DateInput
                  label="Período"
                  mb="md"
                  firstDayOfWeek={0}
                  valueFormat="DD/MM/YYYY"
                  {...form.getInputProps('dateStart')}
                />
                <DateInput
                  label=""
                  mb="md"
                  firstDayOfWeek={0}
                  valueFormat="DD/MM/YYYY"
                  {...form.getInputProps('dateEnd')}
                />
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Select label="Filtrar por" data={BILLING_FILTER_TYPE_ENUM} {...form.getInputProps('filterType')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Tags label="Categorias" data={toSelect(categories)} mb="md" {...form.getInputProps('categories')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Tags label="Cartões" data={toSelect(cards)} mb="md" {...form.getInputProps('cards')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Tags label="Marcadores" data={toSelect(tags)} mb="md" {...form.getInputProps('tags')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Tags label="Tipos" data={billTypes} mb="md" {...form.getInputProps('types')} />
            </Grid.Col>
            <Grid.Col>
              <Group justify="space-between">
                <Group>
                  <Checkbox checked={form.values.unpaid} label="Não pagas" {...form.getInputProps('unpaid')} />
                  <Checkbox checked={form.values.paid} label="Pagas" ml="md" {...form.getInputProps('paid')} />
                </Group>
                <Group>
                  <Tooltip label="Limpar todos os filtros" position="left-end">
                    <Button leftSection={<IconEraser size={15} />} onClick={clear} color='gray'>Limpar</Button>
                  </Tooltip>
                  <Button id="billing-filter" leftSection={<IconSearch size={15} />} onClick={findAll} ref={filter}>Filtrar</Button>
                </Group>
              </Group>
            </Grid.Col>
          </Grid>
        </div>
      </Collapse>
      {data.length > 0 && (
        <>
          {sortByDate(data).map((it, index) => (
            <Table key={index}>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td style={{ fontSize: 11, paddingTop: 20 }}>
                    {it.date.format(MONTH_STR_DATE_FORMAT)}
                  </Table.Td>
                </Table.Tr>
                {it.items.map((bill: any) => <BillingItem bill={bill} key={bill.id} findAll={findAll} />)}
              </Table.Tbody>
            </Table>
          ))}
          <Grid mt="xl" mb="xl">
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card>
                <Text fw={500} size="md">Total de lançamentos</Text>
                <Text style={{ fontSize: 25 }} ta="center">
                  {data.length}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card>
                <Text fw={500} size="md">Valor total</Text>
                <Text style={{ fontSize: 25 }} ta="center">R$ {formatMoney(data.reduce((t, i) => t + i.amount, 0))}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card>
                <Text fw={500} size="md">Total pago</Text>
                <Text style={{ fontSize: 25 }} ta="center">R$ {formatMoney(data.filter(it => it.paid).reduce((t, i) => t + i.amount, 0))}</Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
              <Card>
                <Text fw={500} size="md">Total pendente</Text>
                <Text style={{ fontSize: 25 }} ta="center">R$ {formatMoney(data.filter(it => !it.paid).reduce((t, i) => t + i.amount, 0))}</Text>
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}
      {opened && <BillingModal onClose={toggleModal} />}
    </div>
  );
};

export default Billing;
