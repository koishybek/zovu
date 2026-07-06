// RU — канон UI-строк (ZOVU_PROMPT.md Приложение A). Единственный источник формулировок.
// Структура по неймспейсам-фичам. Плейсхолдеры — {{name}} (i18next).

export const ru = {
  common: {
    appName: 'Zovu',
    next: 'Продолжить',
    back: 'Назад',
    cancel: 'Отмена',
    save: 'Сохранить',
    send: 'Отправить',
    retry: 'Повторить',
    close: 'Закрыть',
    done: 'Готово',
    loading: 'Загрузка…',
    error: 'Что-то пошло не так',
    emptyDefault: 'Пока пусто',
    currency: '₸',
    priceWithCurrency: '{{amount}} ₸',
    distanceKm: '{{km}} км',
    minutesAgo: '{{count}} мин назад',
    tenge: '₸',
  },

  tabbar: {
    // Специалист
    map: 'Карта',
    orders: 'Заказы',
    bids: 'Отклики',
    profile: 'Профиль',
    // Заказчик
    myOrders: 'Заказы',
    myBids: 'Отклики',
    chats: 'Чаты',
  },

  status: {
    new: 'Новый',
    waiting: 'Ожидание ответа',
    accepted: 'Принят',
    notSelected: 'Не выбран',
    inProgress: 'В работе',
    done: 'Выполнен',
    doneAuto: 'Выполнен (автозакрытие)',
    cancelled: 'Отменён',
    review: 'На рассмотрении',
    awaitingConfirmation: 'Ожидает подтверждения',
  },

  auth: {
    // S-01 Welcome
    welcomeSlogan: 'Находим специалистов рядом',
    start: 'Начать',
    // S-02 Phone
    phoneTitle: 'Ваш номер',
    phoneHint: 'Мы отправим код подтверждения в SMS',
    getCode: 'Получить код',
    phoneInvalid: 'Введите корректный номер',
    // S-03 OTP
    otpTitle: 'Введите код из SMS',
    resendCode: 'Отправить код повторно',
    resendIn: 'Отправить код повторно {{time}}',
    otpWrong: 'Неверный код',
    otpExpired: 'Код истёк, запросите новый',
  },

  role: {
    // S-04
    whoAreYou: 'Кто вы?',
    iAmClient: 'Я заказчик',
    iAmSpecialist: 'Я специалист',
    // S-34
    whoOnPlatform: 'Кем вы хотите быть на платформе Zovu?',
    roleSettings: 'Настройки роли',
    canChangeAnytime: 'Вы можете сменить роль в любое время в настройках.',
    activateSecondRole: 'Активировать вторую роль',
  },

  onboarding: {
    // S-05 анкета
    tellAboutYourself: 'Расскажите о себе',
    fullName: 'ФИО',
    birthDate: 'Дата рождения',
    mainCategory: 'Основная категория',
    extraCategories: 'Дополнительные категории',
    about: 'О себе',
    uploadDiploma: 'Загрузить диплом',
    // S-06 верификация
    identityConfirm: 'Подтверждение личности',
    uploadPhotosForCheck: 'Загрузите фотографии для проверки',
    selfie: 'Селфи',
    selfieHint: 'Сделайте фото своего лица',
    selfieWithDoc: 'Селфи с документом',
    selfieWithDocHint: 'С документом в руках',
    sendForReview: 'Отправить на проверку',
    // S-07 pending
    checkingData: 'Проверяем ваши данные',
    checkingHint:
      'Обычно проверка занимает от нескольких минут до 24 часов. Мы пришлём уведомление.',
    // S-08 success
    verificationPassed: 'Верификация пройдена',
    verificationPassedHint: 'Спасибо! Ваш профиль успешно подтверждён.',
  },

  specialist: {
    // S-11 лента
    feedTitle: 'Лента заказов',
    filterNew: 'Новые',
    filterNearby: 'Рядом',
    filterAll: 'Все',
    filterNewCount: 'Новые ({{count}})',
    viewDeck: 'Колода',
    viewList: 'Список',
    viewMap: 'Карта',
    // S-12 карточка
    respond: 'Откликнуться',
    description: 'Описание',
    whenConvenient: 'Когда удобно',
    duration: 'Длительность',
    // S-13 отклик
    yourPrice: 'Ваша цена',
    serviceCommission: 'Комиссия сервиса',
    youGet: 'Вы получите',
    acceptPrice: 'Принять цену',
    proposeOwn: 'Предложить свою',
    clientWillDecide: 'Клиент увидит вашу цену и примет решение.',
    // S-15 баланс
    currentBalance: 'Текущий баланс',
    nextCharge: 'Следующее списание',
    subscriptionActive: 'Подписка активна',
    subscriptionInactive: 'Подписка неактивна',
    operationsHistory: 'История операций',
    chargeSubscription: 'Списание за подписку',
    orderCommission: 'Комиссия за заказ',
    topupBalance: 'Пополнение баланса',
    // S-16 пополнение
    enterAmount: 'Введите сумму',
    paymentMethod: 'Способ оплаты',
    noFee: 'Комиссия не взимается',
    topup: 'Пополнить',
    kaspi: 'Kaspi',
    bankCard: 'Банковская карта',
    // S-17 блок
    topupYourBalance: 'Пополните баланс',
    balanceZeroBlock:
      'Баланс нулевой, поэтому отклики недоступны. Пополните баланс, чтобы продолжить работу.',
    aboutSubscription: 'Подробнее о подписке',
    // S-18 профиль
    diplomaBadge: 'Дипломированный ✓',
    portfolio: 'Портфолио',
    reviews: 'Отзывы',
    ordersCount: '{{count}} заказов',
    addCategory: 'Добавить',
    streak: '🔥 {{count}}',
  },

  client: {
    // S-20 создание
    createOrder: 'Создание заказа',
    whatToDo: 'Что надо сделать',
    photosUpTo5: 'Фото (до 5)',
    budget: 'Бюджет (₸)',
    address: 'Адрес',
    publish: 'Опубликовать',
    proposeCategory: 'Предложить свою',
    // S-21 фильтры
    filters: 'Фильтры',
    reset: 'Сбросить',
    certifiedOnly: 'Только дипломированные',
    minRating: 'Мин. рейтинг',
    experience: 'Опыт работы',
    distance: 'Расстояние',
    showNSpecialists: 'Показать {{count}} специалистов',
    // S-22 карта
    yourOrder: 'Ваш заказ',
    // Профиль заказчика
    becomeSpecialist: 'Стать специалистом',
    ordersPlaced: 'Размещено заказов: {{count}}',
    // S-23 отклики
    bidsReceived: 'Получено {{count}} откликов',
    // S-24 деталь
    bidDetails: 'Детали отклика',
    proposal: 'Предложение',
    terms: 'Сроки',
    decline: 'Отклонить',
    accept: 'Принять',
    // S-25 активный
    inProgressBanner: 'Специалист уже приступил к выполнению.',
    performer: 'Исполнитель',
    agreedOn: 'Договорились',
    completeOrder: 'Завершить заказ',
    // S-26 завершение
    checkAndConfirm: 'Проверьте работу и подтвердите выполнение заказа.',
    orderCompleted: 'Заказ успешно завершён',
    // S-27 оценка
    howWasWork: 'Как прошла работа?',
    reviewHelps: 'Ваш отзыв поможет другим пользователям',
    comment: 'Комментарий',
    leaveReview: 'Оставить отзыв',
  },

  map: {
    specialistTitle: 'Заказы рядом',
    clientTitle: 'Заказы на карте',
    open: 'Открыть',
    emptyTitle: 'Заказов рядом нет',
    emptyHint: 'Пока в ваших категориях нет активных заказов поблизости',
    clientEmptyTitle: 'Заказов на карте нет',
    clientEmptyHint: 'Создайте заказ — он появится на карте',
  },

  clientBids: {
    emptyTitle: 'Откликов пока нет',
    emptyHint: 'Когда специалисты откликнутся на ваши заказы, они появятся здесь',
  },

  clientChats: {
    emptyTitle: 'Чатов пока нет',
    emptyHint: 'Чат откроется автоматически, когда вы примете отклик специалиста',
    noMessages: 'Нет сообщений',
  },

  chat: {
    title: 'Чат',
    report: 'Пожаловаться',
    online: 'в сети',
    messagePlaceholder: 'Сообщение',
    readonly: 'Чат завершён',
  },

  support: {
    title: 'Поддержка',
    categoryOrder: 'Заказ',
    categoryPayment: 'Оплата',
    categoryComplaint: 'Жалоба',
    categoryVerification: 'Верификация',
    categoryOther: 'Иное',
    newTicket: 'Новое обращение',
    attachFiles: 'Прикрепить файлы',
  },

  notifications: {
    title: 'Уведомления',
    newBid: 'Новый отклик на заказ',
    orderAccepted: 'Заказ принят',
    lowBalance: 'Низкий баланс',
    thanksForReview: 'Спасибо за отзыв!',
  },

  settings: {
    title: 'Настройки',
    appLanguage: 'Язык приложения',
    russian: 'Русский',
    kazakh: 'Қазақша',
    general: 'Общие',
    security: 'Безопасность',
    privacy: 'Конфиденциальность',
    about: 'О приложении',
    logout: 'Выйти из аккаунта',
  },

  categories: {
    electric: 'Электрика',
    plumbing: 'Сантехника',
    cleaning: 'Уборка',
    repair: 'Ремонт',
    furniture: 'Сборка мебели',
    appliances: 'Бытовая техника',
    finishing: 'Отделка',
    moving: 'Грузоперевозки',
    postRepairCleaning: 'Клининг после ремонта',
    computerHelp: 'Компьютерная помощь',
    beauty: 'Красота',
    tutoring: 'Репетиторство',
  },
};

// Тип-форма ресурса: структура ключей сохраняется, значения — string (для переводов).
export type Resources = typeof ru;
