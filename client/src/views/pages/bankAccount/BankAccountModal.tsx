import {
  Button,
  FocusTrap,
  Group,
  Modal,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';

interface BankAccountModalProps {
  edit?: any;
  onClose: () => void;
}

const BankAccountModal: FC<BankAccountModalProps> = ({ edit, onClose }) => {
  const form = useForm({
    initialValues: {
      id: '',
      label: '',
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(
    () => {
      if (edit) {
        form.values.id = edit.id;
        form.values.label = edit.label;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [edit]
  );

  const onSubmit = async (
    formData: typeof form.values
  ) => {
    setLoading(true);

    const [, error] = await http.post<any>('/bankAccount/persist', formData);

    setLoading(false);

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
    <Modal
      opened={true}
      onClose={onClose}
      title="Conta"
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <FocusTrap active={true}>
          <TextInput
            label="Conta"
            withAsterisk={true}
            data-autofocus={true}
            {...form.getInputProps('label')}
          />
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

export default BankAccountModal;
