import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DeviceFrame } from '../app/shells/DeviceFrame';
import { RoleShell } from '../app/shells/RoleShell';
import { ScreenStub } from '../components/ScreenStub';
import { UiKitPage } from '../features/dev/UiKitPage';
import { RootRedirect } from './RootRedirect';
import { RequireAuth } from './RequireAuth';
import { WelcomeScreen } from '../features/auth/WelcomeScreen';
import { PhoneScreen } from '../features/auth/PhoneScreen';
import { OtpScreen } from '../features/auth/OtpScreen';
import { RoleScreen } from '../features/auth/RoleScreen';
import { ClientNameScreen } from '../features/auth/ClientNameScreen';
import { SpecialistProfileScreen } from '../features/onboarding/SpecialistProfileScreen';
import { VerificationScreen } from '../features/onboarding/VerificationScreen';
import { PendingScreen } from '../features/onboarding/PendingScreen';
import { SuccessScreen } from '../features/onboarding/SuccessScreen';
import { routes, SPECIALIST_TABS, CLIENT_TABS } from './routes';

// M1: экраны — заглушки (ScreenStub), реализация в M3–M7. Пути — канон docs/05-screens.md.
const stub = (code: string, name: string, milestone: string) => (
  <ScreenStub code={code} name={name} milestone={milestone} />
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DeviceFrame />,
    children: [
      { index: true, element: <RootRedirect /> },

      // Онбординг и auth (S-01…S-08) — вне таббара
      { path: routes.welcome, element: <WelcomeScreen /> },
      { path: routes.phone, element: <PhoneScreen /> },
      { path: routes.otp, element: <OtpScreen /> },
      { path: routes.role, element: <RequireAuth><RoleScreen /></RequireAuth> },
      { path: routes.spProfileForm, element: <RequireAuth><SpecialistProfileScreen /></RequireAuth> },
      { path: routes.spVerification, element: <RequireAuth><VerificationScreen /></RequireAuth> },
      { path: routes.spPending, element: <RequireAuth><PendingScreen /></RequireAuth> },
      { path: routes.spSuccess, element: <RequireAuth><SuccessScreen /></RequireAuth> },
      { path: routes.clientName, element: <RequireAuth><ClientNameScreen /></RequireAuth> },

      // Специалист (shell с таббаром, S-10…S-18)
      {
        element: (
          <RequireAuth>
            <RoleShell tabs={SPECIALIST_TABS} />
          </RequireAuth>
        ),
        children: [
          { path: routes.spMap, element: stub('S-10', 'Карта специалиста', 'M4') },
          { path: routes.spOrders, element: stub('S-11', 'Лента (Колода/Список/Карта)', 'M4') },
          { path: routes.spBids, element: stub('S-14', 'Мои отклики', 'M4') },
          { path: routes.spProfile, element: stub('S-18', 'Профиль специалиста', 'M4') },
        ],
      },
      // Специалист — полноэкранные (вне таббара)
      { path: routes.spOrder(), element: stub('S-12', 'Карточка заказа', 'M4') },
      { path: routes.spRespond(), element: stub('S-13', 'Отклик', 'M4') },
      { path: routes.spBalance, element: stub('S-15', 'Баланс', 'M5') },
      { path: routes.spTopup, element: stub('S-16', 'Пополнение', 'M5') },
      { path: routes.spSubscriptionLock, element: stub('S-17', 'Пополните баланс', 'M5') },

      // Заказчик (shell с таббаром, S-20…S-27)
      {
        element: (
          <RequireAuth>
            <RoleShell tabs={CLIENT_TABS} />
          </RequireAuth>
        ),
        children: [
          { path: routes.clientOrders, element: stub('—', 'Мои заказы', 'M4') },
          { path: routes.clientBids, element: stub('S-23', 'Отклики', 'M4') },
          { path: routes.clientChats, element: stub('—', 'Чаты', 'M6') },
        ],
      },
      // Заказчик — полноэкранные
      { path: routes.clientOrderNew, element: stub('S-20', 'Создание заказа', 'M4') },
      { path: routes.clientOrderNewFilters, element: stub('S-21', 'Фильтры подбора', 'M4') },
      { path: routes.clientMap, element: stub('S-22', 'Карта заказчика', 'M4') },
      { path: routes.clientOrderBids(), element: stub('S-23', 'Отклики на заказ', 'M4') },
      { path: routes.clientBid(), element: stub('S-24', 'Деталь отклика', 'M4') },
      { path: routes.clientOrder(), element: stub('S-25', 'Активный заказ', 'M6') },
      { path: routes.clientOrderReview(), element: stub('S-27', 'Оценка и отзыв', 'M6') },

      // Общие (S-30…S-35)
      { path: routes.chat(), element: stub('S-30', 'Чат', 'M6') },
      { path: routes.support, element: stub('S-31', 'Поддержка', 'M7') },
      { path: routes.supportNew, element: stub('S-31', 'Новое обращение', 'M7') },
      { path: routes.supportTicket(), element: stub('S-31', 'Тикет поддержки', 'M7') },
      { path: routes.notifications, element: stub('S-32', 'Уведомления', 'M6') },
      { path: routes.reviews(), element: stub('S-33', 'Отзывы', 'M6') },
      { path: routes.roleSwitch, element: stub('S-34', 'Роль', 'M7') },
      { path: routes.settings, element: stub('S-35', 'Настройки', 'M7') },

      // Dev — витрина UI-кита (реальный экран)
      { path: routes.uikit, element: <UiKitPage /> },

      { path: '*', element: <Navigate to={routes.welcome} replace /> },
    ],
  },
]);
