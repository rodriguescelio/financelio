import { Basic } from './basic';

export interface Account extends Basic {
  name?: string;
  email?: string;
  password?: string;
  createdAt?: string;
}
