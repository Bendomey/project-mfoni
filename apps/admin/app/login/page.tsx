import {LoginModule} from '@/modules'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login - mfoni admin",
};

export default function Login() {
  return <LoginModule />
}

