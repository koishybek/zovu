// Демо-персоны для dev-входа (seed-demo.ts). OTP всегда 1111.
// Показываются ТОЛЬКО при import.meta.env.DEV — в проде dev-панель скрыта.

export interface DemoPersona {
  phone: string;
  label: string;
  role: 'client' | 'specialist';
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { phone: '+77000000000', label: 'Динара · заказчик', role: 'client' },
  { phone: '+77010000001', label: 'Асхат · специалист', role: 'specialist' },
];
