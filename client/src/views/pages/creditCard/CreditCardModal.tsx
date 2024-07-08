import {
  Button,
  FocusTrap,
  Grid,
  Group,
  Modal,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { FC, useEffect, useState } from 'react';
import MoneyInput from '../../components/moneyInput/MoneyInput';
import { useForm } from '@mantine/form';
import http from '../../../services/http.service';
import { notifications } from '@mantine/notifications';

interface CreditCardModalProps {
  edit?: any;
  onClose: () => void;
}

const CreditCardModal: FC<CreditCardModalProps> = ({ edit, onClose }) => {
  const form = useForm({
    initialValues: {
      id: '',
      label: '',
      amountLimit: 0,
      closeDay: 1,
      payDay: 1,
    },
  });

  const [loadingPersist, setLoadingPersist] = useState(false);

  useEffect(
    () => {
      if (edit) {
        form.values.id = edit.id;
        form.values.label = edit.label;
        form.values.amountLimit = edit.amountLimit;
        form.values.closeDay = edit.closeDay;
        form.values.payDay = edit.payDay;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edit]
  );

  const onSubmit = async (formData: typeof form.values) => {
    setLoadingPersist(true);

    const [, error] = await http.post<any>('/card/persist', formData);

    setLoadingPersist(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal opened={true} onClose={onClose} title="Cartão">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <FocusTrap active={true}>
            <TextInput
              label="Nome"
              withAsterisk={true}
              data-autofocus={true}
              mb="md"
              {...form.getInputProps('label')}
            />
            <MoneyInput
              label="Limite"
              data-autofocus={true}
              withAsterisk={true}
              {...form.getInputProps('amountLimit')}
            />
            <Grid mt="md">
              <Grid.Col span={6}>
                <NumberInput
                  min={0}
                  max={31}
                  label="Dia do fechamento"
                  {...form.getInputProps('closeDay')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  min={0}
                  max={31}
                  label="Dia do vencimento"
                  {...form.getInputProps('payDay')}
                />
              </Grid.Col>
            </Grid>
          </FocusTrap>
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loadingPersist}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>
  );
};

export default CreditCardModal;
