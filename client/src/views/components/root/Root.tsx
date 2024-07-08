import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AUTH_TOKEN_NAME } from '../../../constants';
import http from '../../../services/http.service';
import { RootState } from '../../../store';
import { globalActions, GlobalState } from '../../../store/slices/global.slice';
import Navbar from '../navbar/Navbar';
import { useDisclosure } from '@mantine/hooks';

const Root: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();

  const { account } = useSelector<RootState, GlobalState>(
    (state) => state.global
  );

  const [opened, { toggle }] = useDisclosure();

  useEffect(
    () => {
      loader();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () => {
      if (opened) {
        toggle();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location]
  );

  const loader = async () => {
    const token =
      window.sessionStorage.getItem(AUTH_TOKEN_NAME) ||
      window.localStorage.getItem(AUTH_TOKEN_NAME);

    if (token) {
      const [response, error] = await http.get('/auth/getData');
      if (!error) {
        dispatch(globalActions.setAccount(response));
      }
    } else {
      navigate('/login');
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_NAME);
    window.sessionStorage.removeItem(AUTH_TOKEN_NAME);
    navigate('/login');
  };

  return (
    account && (
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        styles={{
          main: {
            background: theme.colors.dark[8],
          },
        }}
      >
        <AppShell.Header>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 10 }}>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" style={{ marginRight: 10 }} />
              <span style={{ fontSize: 25, verticalAlign: 'top', marginTop: 3 }}>financelio</span>
            </div>
            <Group>
              <Text style={{ marginTop: 3 }}>{account.name}</Text>
              <ActionIcon onClick={logout} variant="transparent" style={{ marginRight: 10 }}>
                <IconLogout />
              </ActionIcon>
            </Group>
          </div>
        </AppShell.Header>
        <Navbar opened={opened} />
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    )
  );
};

export default Root;
