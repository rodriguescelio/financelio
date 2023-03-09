import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { AUTH_TOKEN_NAME } from '../../../constants';
import http from '../../../services/http.service';
import { RootState } from '../../../store';
import { globalActions, GlobalState } from '../../../store/slices/global.slice';
import Navbar from '../navbar/Navbar';

const Root: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const { account } = useSelector<RootState, GlobalState>(
    (state) => state.global
  );

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    loader();
  }, []);

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

  const toggle = () => setOpened((p) => !p);

  const logout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_NAME);
    window.sessionStorage.removeItem(AUTH_TOKEN_NAME);
    navigate('/login');
  };

  return (
    account && (
      <AppShell
        padding="md"
        navbarOffsetBreakpoint="sm"
        navbar={<Navbar opened={opened} />}
        header={
          <Header height={{ base: 50, md: 70 }} p="md">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <Burger
                    opened={opened}
                    onClick={toggle}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </MediaQuery>
                <h2>financelio</h2>
              </div>
              <Group>
                <Text sx={{ marginTop: 3 }}>{account.name}</Text>
                <ActionIcon onClick={logout}>
                  <IconLogout />
                </ActionIcon>
              </Group>
            </div>
          </Header>
        }
        styles={{
          main: {
            background: theme.colors.dark[8],
          },
        }}
      >
        <Outlet />
      </AppShell>
    )
  );
};

export default Root;
