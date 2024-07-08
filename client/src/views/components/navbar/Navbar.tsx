import { FC } from 'react';
import { AppShell, ScrollArea } from '@mantine/core';
import {
  IconBookmark,
  IconBuildingBank,
  IconCreditCard,
  IconHome,
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
      {/* <MantineNavbar.Section grow component={ScrollArea} mx="-xs" px="xs"> */}
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
          icon={<IconBookmark size="1rem" />}
          label="Minhas categorias"
          to="/category"
        />
        <NavLink
          color="blue"
          icon={<IconCreditCard size="1rem" />}
          label="Meus cartões"
          to="/creditCard"
        />
        <NavLink
          color="blue"
          icon={<IconBuildingBank size="1rem" />}
          label="Minhas contas"
          to="/bankAccount"
        />
      {/* </MantineNavbar.Section> */}
    </AppShell.Navbar>
  );
};

export default Navbar;
