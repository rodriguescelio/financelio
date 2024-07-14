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

interface TagModalProps {
  edit?: any;
  onClose: () => void;
}

const TagModal: FC<TagModalProps> = ({ edit, onClose }) => {
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

  const onSubmit = async (formData: typeof form.values) => {
    setLoading(true);

    const [, error] = await http.post<any>('/tag/persist', formData);

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
    <Modal opened={true} onClose={onClose} title="Marcador">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <FocusTrap active={true}>
          <TextInput
            label="Nome"
            withAsterisk={true}
            data-autofocus={true}
            mb="md"
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

export default TagModal;
