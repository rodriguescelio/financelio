import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import store from './store';
import Root from './views/components/root/Root';
import Home from './views/pages/home/Home';
import Login from './views/pages/login/Login';
import BankAccount from './views/pages/bankAccount/BankAccount';
import { Notifications } from '@mantine/notifications';
import CreditCard from './views/pages/creditCard/CreditCard';
import Billing from './views/pages/billing/Billing';
import Category from './views/pages/category/Category';

import './App.scss';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: '/bills',
        element: <Billing />,
      },
      {
        path: '/category',
        element: <Category />,
      },
      {
        path: '/creditCard',
        element: <CreditCard />,
      },
      {
        path: '/bankAccount',
        element: <BankAccount />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

function App() {
  return (
    <div className="app">
      <MantineProvider
        withGlobalStyles={true}
        withNormalizeCSS={true}
        theme={{ colorScheme: 'dark' }}
      >
        <Notifications position="top-right" />
        <Provider store={store}>
          <ModalsProvider>
            <RouterProvider router={router} />
          </ModalsProvider>
        </Provider>
      </MantineProvider>
    </div>
  );
}

export default App;
