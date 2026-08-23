export type DemoUser = {
  name: string;
  email: string;
};

const KEY = 'cotejo_session';

export function getSession(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function saveSession(user: DemoUser) {
  sessionStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export const DEMO_ACCOUNT = {
  email: 'demo@cotejo.app',
  password: 'demo',
  name: 'Auditor Demo',
};
