// Autenticação SIMULADA PARA DEMONSTRAÇÃO.
// Em produção, substituir por Supabase Auth (supabase.auth.signInWithPassword)
// ou outro provedor. Nunca manter credenciais fixas no front-end em produção.

import { sleep } from '@/utils/misc';

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export const DEMO_CREDENTIALS = { email: 'admin@mansaomaromba.com', password: 'admin123' };

const SESSION_KEY = 'mansao-maromba:session';

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    await sleep(900);
    if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      throw new Error('E-mail ou senha inválidos.');
    }
    const user: AuthUser = { name: 'Ricardo Almeida', email: DEMO_CREDENTIALS.email, role: 'Administrador' };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      /* ignora */
    }
    return user;
  },
  signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignora */
    }
  },
  currentUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
};
