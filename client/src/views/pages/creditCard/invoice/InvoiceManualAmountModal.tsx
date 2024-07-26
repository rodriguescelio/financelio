import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { FC, useEffect, useState } from "react";
import http from "../../../../services/http.service";
import { Button, FocusTrap, Group, Modal } from "@mantine/core";
import MoneyInput from "../../../components/moneyInput/MoneyInput";

interface InvoiceManualAmountModalProps {
  onClose: (data?: any) => void;
  data: any;
}

const InvoiceManualAmountModal: FC<InvoiceManualAmountModalProps> = ({ onClose, data }) => {
  const form = useForm({
    initialValues: {
      amount: 0,
      currentAmount: data.total,
    },
    validate: {
      amount: value => value === 0 ? 'Valor da fatura deve ser maior que 0' : null,
    }
  });

  useEffect(
    () => {
      if (data.receipt) {
        form.values.currentAmount = data.receipt.totalAmount;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: typeof form.values) => {
    setLoading(true);

    const [res, error] = await http.post<any>(`/card/${data.card.id}/manualAmount`, {
      ref: data.ref,
      amount: formData.amount,
    });

    setLoading(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      onClose(res);
    }
  };

  return (
    <Modal opened={true} onClose={onClose} title="Inserir valor manual para a fatura">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <FocusTrap active={true}>
          <Group grow={true} align="start">
            <MoneyInput
              label="Valor atual"
              withAsterisk={true}
              readOnly={true}
              disabled={true}
              {...form.getInputProps('currentAmount')}
            />
            <MoneyInput
              label="Novo valor"
              data-autofocus={true}
              withAsterisk={true}
              {...form.getInputProps('amount')}
            />
          </Group>
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

export default InvoiceManualAmountModal;
