import {
  ActionIcon,
  Button,
  Flex,
  FocusTrap,
  Group,
  Modal,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';

const Category: FC = () => {
  const form = useForm({
    initialValues: {
      id: '',
      label: '',
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const [loadingPersist, setLoadingPersist] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState('');

  useEffect(() => {
    findAll();
  }, []);

  const findAll = async () => {
    const [response, error] = await http.get<any[]>('/category/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const toggleModal = () => setModalOpen((p) => !p);

  const onSubmit = async (formData: typeof form.values) => {
    setLoadingPersist(true);

    const [, error] = await http.post<any>('/category/persist', formData);

    setLoadingPersist(false);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao salvar o registro.',
      });
    } else {
      toggleModal();
      form.reset();
      findAll();
    }
  };

  const openEdit = (card: any) => {
    form.values.id = card.id;
    form.values.label = card.label;
    toggleModal();
  };

  const execDeleteCategory = async (cardId: string) => {
    setLoadingDelete(cardId);

    const [, error] = await http.delete(`/category/delete/${cardId}`);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro ao excluir o registro.',
      });
    } else {
      findAll();
    }

    setLoadingDelete('');
  };

  const deleteCategory = (cardId: string) => {
    modals.openConfirmModal({
      title: 'Exclusão de registro',
      children: <Text>Deseja mesmo excluir este registro?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => execDeleteCategory(cardId),
    });
  };

  return (
    <div
      style={{ padding: 10, paddingRight: '1.5rem', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Minhas categorias</Title>
        <Button onClick={toggleModal}>Nova categoria</Button>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          highlightOnHover={true}
          withBorder={true}
          withColumnBorders={true}
          mt="lg"
        >
          <thead>
            <tr>
              <th>Categoria</th>
              <th style={{ width: 120 }}>Opções</th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => (
              <tr key={it.id}>
                <td>{it.label}</td>
                <td>
                  <Group position="center">
                    <Tooltip label="Editar categoria">
                      <ActionIcon
                        color="orange"
                        onClick={openEdit.bind(null, it)}
                      >
                        <IconPencil />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remover categoria">
                      <ActionIcon
                        color="red"
                        onClick={deleteCategory.bind(null, it.id)}
                        loading={loadingDelete === it.id}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal opened={modalOpen} onClose={toggleModal} title="Categoria">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <FocusTrap active={modalOpen}>
            <TextInput
              label="Nome"
              withAsterisk={true}
              data-autofocus={true}
              mb="md"
              {...form.getInputProps('label')}
            />
          </FocusTrap>
          <Group position="right" mt="md">
            <Button type="submit" loading={loadingPersist}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default Category;
