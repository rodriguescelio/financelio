
import {
  ActionIcon,
  Button,
  Flex,
  FocusTrap,
  Group,
  Menu,
  Modal,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { useDisclosure } from '@mantine/hooks';

interface CategoryModalProps {
  edit?: any;
  onClose: () => void;
}

const CategoryModal: FC<CategoryModalProps> = ({ edit, onClose }) => {
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

    const [, error] = await http.post<any>('/category/persist', formData);

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
    <Modal opened={true} onClose={onClose} title="Categoria">
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

export default CategoryModal;
