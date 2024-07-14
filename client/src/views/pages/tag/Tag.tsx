import {
  ActionIcon,
  Flex,
  Group,
  Menu,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import http from '../../../services/http.service';
import { useDisclosure } from '@mantine/hooks';
import TagModal from './TagModal';

const Tag: FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);

  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    findAll();
  }, []);

  const findAll = async () => {
    const [response, error] = await http.get<any[]>('/tag/findAll');

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao carregar a página.',
      });
    }

    setData(response || []);
  };

  const openEdit = (tag: any) => {
    setEdit(tag);
    toggle();
  };

  const closeModal = () => {
    if (opened) {
      setEdit(null);
      findAll();
      toggle();
    }
  };

  const execDelete = async (tagId: string) => {
    const [, error] = await http.delete(`/tag/delete/${tagId}`);

    if (error) {
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Ocorreu um erro ao excluir o registro.',
      });
    } else {
      findAll();
    }
  };

  const deleteTag = (tagId: string) => {
    modals.openConfirmModal({
      title: 'Exclusão de registro',
      children: <Text>Deseja mesmo excluir este registro?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => execDelete(tagId),
    });
  };

  return (
    <div
      style={{ padding: '10px', boxSizing: 'border-box' }}
    >
      <Flex justify="space-between">
        <Title order={2}>Meus marcadores</Title>
        <ActionIcon onClick={toggle} size="lg">
          <IconPlus />
        </ActionIcon>
      </Flex>
      {data.length > 0 && (
        <Table
          striped={true}
          highlightOnHover={true}
          withColumnBorders={true}
          withTableBorder={true}
          withRowBorders={true}
          mt="lg"
        >
          <Table.Tbody>
            {data.map((it) => (
              <Table.Tr key={it.id}>
                <Table.Td>
                  <Group justify="space-between">
                    {it.label}
                    <Menu shadow="md" position="bottom-end" id={it.id}>
                      <Menu.Target>
                        <ActionIcon variant="transparent" color="gray">
                          <IconDotsVertical />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconPencil color="orange" />}
                          onClick={openEdit.bind(null, it)}
                        >
                          Editar
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash color="red" />}
                          onClick={deleteTag.bind(null, it.id)}
                        >
                          Remover
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      {opened && <TagModal edit={edit} onClose={closeModal} />}
    </div>
  );
};

export default Tag;
