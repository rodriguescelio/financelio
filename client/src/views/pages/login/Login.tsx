import {
  Alert,
  Button,
  Card,
  Checkbox,
  CloseButton,
  Flex,
  FocusTrap,
  Loader,
  PasswordInput,
  SegmentedControl,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AUTH_TOKEN_NAME } from '../../../constants';
import { Token } from '../../../models/dto/token';
import http from '../../../services/http.service';
import { globalActions } from '../../../store/slices/global.slice';
import { withCustomEvents } from '../../../utils/form.util';

enum State {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

enum ScreenMode {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
}

const screenModeList = [
  { label: 'Entrar', value: ScreenMode.LOGIN },
  { label: 'Cadastrar', value: ScreenMode.SIGNUP },
];

const INPUT_ICON = {
  [State.IDLE]: null,
  [State.LOADING]: <Loader size="xs" />,
  [State.SUCCESS]: <IconCheck size={20} color="green" />,
  [State.ERROR]: <CloseButton size="lg" color="red" />,
};

const Login: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm({
    initialValues: {
      mode: ScreenMode.LOGIN,
      name: '',
      email: '',
      password: '',
      keepConnected: false,
    },
    validate: {
      name: (name, values) =>
        values.mode === ScreenMode.SIGNUP && !name
          ? 'Informe como você deseja ser chamado.'
          : null,
      email: (email, values) => {
        let message = null;

        if (email) {
          if (
            values.mode === ScreenMode.SIGNUP &&
            screenState.emailState === State.ERROR
          ) {
            message = 'Email jã em uso.';
          }
        } else {
          message = 'Informe seu email para prosseguir.';
        }

        return message;
      },
      password: (password) =>
        password ? null : 'Informe sua senha para prosseguir.',
    },
  });

  type FormValues = typeof form.values;

  const [screenState, setScreenState] = useState({
    emailState: State.IDLE,
    formState: State.IDLE,
    formMessage: '',
  });

  useEffect(() => {
    form.values.name = '';
    form.values.email = '';
    form.values.password = '';
    form.values.keepConnected = false;

    setScreenState((p) => ({
      ...p,
      formState: State.IDLE,
      emailState: State.IDLE,
    }));
  }, [form.values.mode]);

  const onBlurEmail = async () => {
    if (form.values.mode === ScreenMode.SIGNUP && form.values.email) {
      setScreenState((p) => ({ ...p, emailState: State.LOADING }));

      const [available, error] = await http.post<boolean>('/auth/checkEmail', {
        email: form.values.email,
      });

      setScreenState((p) => {
        const newState = { ...p };

        if (error) {
          newState.emailState = State.IDLE;
          newState.formState = State.ERROR;
          newState.formMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message;
        } else {
          newState.emailState = available ? State.SUCCESS : State.ERROR;
          if (!available) {
            form.setFieldError('email', 'Email já em uso.');
          }
        }

        return newState;
      });
    }
  };

  const onFocusEmail = () => {
    if (form.values.mode === ScreenMode.SIGNUP) {
      setScreenState((p) => ({ ...p, emailState: State.IDLE }));
      form.clearFieldError('email');
    }
  };

  const done = (token: Token) => {
    window.localStorage.removeItem(AUTH_TOKEN_NAME);
    window.sessionStorage.removeItem(AUTH_TOKEN_NAME);

    if (form.values.keepConnected) {
      window.localStorage.setItem(AUTH_TOKEN_NAME, token.token);
    } else {
      window.sessionStorage.setItem(AUTH_TOKEN_NAME, token.token);
    }

    dispatch(globalActions.setAccount(token.account));
    setTimeout(() => navigate('/'), 1500);
  };

  const submitLogin = async (values: FormValues) => {
    const [response, error] = await http.post<Token>('/auth/login', {
      email: values.email,
      password: values.password,
    });

    setScreenState((p) => {
      const newState = {
        ...p,
        formState: error ? State.ERROR : State.SUCCESS,
      };

      if (error) {
        if (error.response && error.response.data) {
          newState.formMessage =
            error.response.data.statusCode === 403
              ? 'Email/Senha inválidos.'
              : error.response.data.message;
        } else {
          newState.formMessage = error.message;
        }
      } else {
        newState.formMessage = `Bem vindo(a) ${response.account.name}!`;
        done(response);
      }

      return newState;
    });
  };

  const submitSignup = async (values: FormValues) => {
    const [response, error] = await http.post<Token>('/auth/signup', {
      name: values.name,
      email: values.email,
      password: values.password,
    });

    setScreenState((p) => {
      const newState = {
        ...p,
        formState: error ? State.ERROR : State.SUCCESS,
      };

      if (error) {
        newState.formMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message;
      } else {
        newState.formMessage = `Bem vindo(a) ${response.account.name}!`;
        done(response);
      }

      return newState;
    });
  };

  const onSubmit = (values: FormValues) => {
    setScreenState((p) => ({ ...p, formState: State.LOADING }));
    if (values.mode === ScreenMode.LOGIN) {
      submitLogin(values);
    } else {
      submitSignup(values);
    }
  };

  const getInputStyle = (state: State) =>
    state === State.SUCCESS ? { input: { borderColor: 'green' } } : {};

  const showAlert =
    [State.IDLE, State.LOADING].indexOf(screenState.formState) == -1;
  const alertSuccess = screenState.formState === State.SUCCESS;

  return (
    <Flex justify="center" align="center" h="100%">
      <Card shadow="sm" p="lg" radius="md" withBorder={true}>
        <SegmentedControl
          fullWidth={true}
          data={screenModeList}
          size="lg"
          {...form.getInputProps('mode')}
        />
        <form style={{ width: 400 }} onSubmit={form.onSubmit(onSubmit)}>
          {showAlert && (
            <Alert
              icon={alertSuccess ? <IconCheck /> : <IconAlertCircle />}
              title={alertSuccess ? 'Sucesso!' : 'Oops...'}
              color={alertSuccess ? 'green' : 'red'}
              mt="md"
            >
              {screenState.formMessage}
            </Alert>
          )}
          <FocusTrap active={true}>
            {form.values.mode === ScreenMode.SIGNUP && (
              <TextInput
                mt="md"
                label="Nome"
                placeholder="Insira seu nome"
                withAsterisk={true}
                {...form.getInputProps('name')}
              />
            )}
            <TextInput
              mt="md"
              label="Email"
              placeholder="Insira seu email"
              withAsterisk={true}
              rightSection={INPUT_ICON[screenState.emailState]}
              styles={getInputStyle.bind(null, screenState.emailState)}
              data-autofocus={true}
              {...withCustomEvents(
                form.getInputProps('email'),
                onBlurEmail,
                onFocusEmail
              )}
            />
            <PasswordInput
              mt="md"
              label="Senha"
              placeholder="Insira sua senha"
              withAsterisk={true}
              {...form.getInputProps('password')}
            />
            <Checkbox
              label="Mantenha-me conectado"
              pt="md"
              {...form.getInputProps('keepConnected')}
            />
          </FocusTrap>
          <Button
            fullWidth={true}
            mt="md"
            type="submit"
            loading={screenState.formState === State.LOADING}
          >
            {form.values.mode === ScreenMode.SIGNUP ? 'Cadastrar' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </Flex>
  );
};

export default Login;
