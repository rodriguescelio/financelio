import ReactDOM from 'react-dom/client';
import App from './App';
import moment from 'moment';

import 'moment/dist/locale/pt-br';

moment.locale('pt-br');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);
