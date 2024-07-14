import { FC } from 'react';
import { AppShell } from '@mantine/core';
import {
  IconBookmark,
  IconBuildingBank,
  IconCreditCard,
  IconHome,
  IconList,
  IconReceipt2,
} from '@tabler/icons-react';
import NavLink from '../navLink/NavLink';

const Navbar: FC<{ opened: boolean }> = ({ opened }) => {
  return (
    <AppShell.Navbar
      p="md"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
    >
      <NavLink
        color="blue"
        icon={<IconHome size="1rem" />}
        label="Início"
        to="/"
      />
      <NavLink
        color="blue"
        icon={<IconReceipt2 size="1rem" />}
        label="Lançamentos"
        to="/bills"
      />
      <NavLink
        color="blue"
        icon={<IconCreditCard size="1rem" />}
        label="Cartões"
        to="/creditCard"
      />
      <NavLink
        color="blue"
        icon={<IconBuildingBank size="1rem" />}
        label="Contas"
        to="/bankAccount"
      />
      <NavLink
        color="blue"
        icon={<IconList size="1rem" />}
        label="Categorias"
        to="/category"
      />
      <NavLink
        color="blue"
        icon={<IconBookmark size="1rem" />}
        label="Marcadores"
        to="/tag"
      />
    </AppShell.Navbar>
  );
};

export default Navbar;
