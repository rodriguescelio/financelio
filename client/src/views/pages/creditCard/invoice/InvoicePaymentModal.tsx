import { Button, Checkbox, FocusTrap, Group, Modal, Select, Text } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import MoneyInput from "../../../components/moneyInput/MoneyInput";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import http from "../../../../services/http.service";
import { toSelect } from "../../../../utils/form.util";
import { DateInput } from "@mantine/dates";
import { modals } from "@mantine/modals";

interface InvoicePaymentModalProps {
  cardId: string | undefined;
  onClose: () => void;
  data: any;
}

const MODAL_ALERT_ID = 'modalAlertOperation';

enum InsertMode {
  NORMAL = 'normal',
  UPDATE_AMOUNT = 'update_amount',
  CREATE_REMAINING_BILL = 'create_remaining',
}

const InvoicePaymentModal: FC<InvoicePaymentModalProps> = ({ cardId, onClose, data }) => {
  const form = useForm({
    initialValues: {
      ref: data.ref,
      total: data.total,
      date: new Date(),
      bankAccount: '',
      debit: true,
      paid: 0,
      insertMode: InsertMode.NORMAL,
    },
    validate: {
      paid: value => value > 0 ? null : 'Valor pago deve ser maior que R$ 0',
    }
  });

  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(
    () => {
      if (data.receipt) {
        form.values.total = data.receipt.totalAmount;
      }
      loadBankAccounts();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadBankAccounts = async () => {
    const [response, error] = await http.get<any[]>('/bankAccount/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setBankAccounts(response || []);
  };

  const savePayment = async () => {
    closeModal();
    setLoading(true);
    const [_, err] = await http.post(`/card/${cardId}/pay`, form.values);
    if (err) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao executar a operação.',
      });
    } else {
      onClose();
    }
  };

  const showModal = (children: any) => {
    modals.open({
      modalId: MODAL_ALERT_ID,
      title: 'Pagamento de fatura',
      children,
    });
  };

  const closeModal = () => modals.close(MODAL_ALERT_ID);

  const execWith = (insertMode: InsertMode) => {
    form.values.insertMode = insertMode;
    savePayment();
  };

  const onSubmit = (formData: typeof form.values) => {
    if (formData.paid > formData.total) {
      showModal(
        <>
          <Text ta="justify">O valor pago informado é maior do que o total da fatura. O que deseja fazer?</Text>
          <Group mt="md" justify="flex-end">
            <Button onClick={closeModal}>Corrigir valor</Button>
            <Button color="red" onClick={execWith.bind(null, InsertMode.UPDATE_AMOUNT)}>Atualizar valor da fatura</Button>
          </Group>
        </>
      );
    } else if (formData.paid < formData.total) {
      showModal(
        <>
          <Text ta="justify">O valor pago informado é menor do que o total da fatura. Você pode salvar mesmo assim, corrigir o valor ou gerar uma cobrança para o mês seguinte com o restante do valor. O que deseja fazer?</Text>
          <Group mt="md">
            <Button fullWidth={true} onClick={closeModal}>
              Corrigir valor pago
            </Button>
            <Button
              fullWidth={true}
              onClick={execWith.bind(null, InsertMode.CREATE_REMAINING_BILL)}
            >
              Gerar uma nova cobrança
            </Button>
            <Button fullWidth={true} onClick={savePayment}>
              Salvar mesmo assim
            </Button>
          </Group>
        </>
      );
    } else {
      savePayment();
    }
  };

  return (
    <Modal opened={true} onClose={onClose} title="Efetuar pagamento">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <FocusTrap active={true}>
          <Group grow={true} align="start" mb="md">
            <MoneyInput
              label="Valor total"
              withAsterisk={true}
              readOnly={true}
              disabled={true}
              {...form.getInputProps('total')}
            />
            <MoneyInput
              label="Valor pago"
              data-autofocus={true}
              withAsterisk={true}
              {...form.getInputProps('paid')}
            />
          </Group>
          <Group grow={true}>
            <DateInput
              label="Data do pagamento"
              mb="md"
              firstDayOfWeek={0}
              valueFormat="DD/MM/YYYY"
                withAsterisk={true}
              {...form.getInputProps('date')}
            />
            <Select
              mb="md"
              label="Conta"
              searchable={true}
              clearable={true}
              data={toSelect(bankAccounts)}
              {...form.getInputProps('bankAccount')}
            />
          </Group>
          {!!form.values.bankAccount && (
            <Checkbox
              defaultChecked={true}
              label="Debitar valor pago da conta informada"
              {...form.getInputProps('debit')}
            />
          )}
        </FocusTrap>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            Salvar
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default InvoicePaymentModal;
