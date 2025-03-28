export default {
  nav: {
    about: 'О нас',
    changelog: 'История изменений',
    pricing: 'Цены',
    signin: 'Войти',
    signup: 'Зарегистрироваться',
    signout: 'Выйти',
    account: 'Аккаунт',
    signin_success: 'Вход выполнен.',
    signout_success: 'Выход выполнен.',
    register_success: 'Зарегистрировано.',
  },
  hero: {
    title: 'What You Should Say Next',
    description: 'Больше никаких затруднений в общении.',
    email_placeholder: 'Введите ваш email',
    waitlist: 'Присоединяйтесь к списку ожидания для раннего доступа',
  },
  footer: {
    privacy: 'Конфиденциальность',
    terms: 'Условия',
    contact: 'Контакты',
    copyright: '© 2025 Langrics Все права защищены.',
  },
  categories: {
    deeper_reflection: 'Глубокое размышление',
    additional_details: 'Дополнительные детали',
    question_expansion: 'Расширение вопроса',
    related_topics: 'Связанные темы',
    personal_opinion: 'Личное мнение',
    related_thoughts: 'Связанные мысли',
    narrative_continuation: 'Продолжение повествования',
    additional_context: 'Дополнительный контекст',
    personal_perspective: 'Личная точка зрения',
  },
  main: {
    translation: 'Перевод',
    suggestion_heading: 'Продолжайте разговор с помощью',
    prompt_speak: 'Нажмите на микрофон и начните говорить',
    add_context: 'Добавить контекст',
    cancel: 'Отмена',
    clear: 'Очистить',
  },
  changelog: {
    title: 'История изменений',
    description: 'Отслеживайте все обновления и изменения в приложении Wyssn',
  },

  account: {
    title: 'Аккаунт',
    manage_subscription: 'Управление подпиской и настройками аккаунта',
    manage_subscription_button: 'Управление подпиской',
    user_info: 'Информация пользователя',
    name: 'Имя',
    email: 'Эл. почта',
    subscription: 'Подписка',
    loading: 'Загрузка...',
    subscription_success: 'Ваша подписка успешно обработана.',
    subscription_canceled: 'Процесс оформления подписки был отменен.',
    error_no_customer:
      'У вас еще нет учетной записи клиента Stripe. Пожалуйста, оформите подписку сначала.',
    error_portal_failed:
      'Не удалось получить доступ к порталу оплаты. Пожалуйста, попробуйте позже.',
    error_generic: 'Произошла ошибка. Пожалуйста, повторите попытку.',
    usage: 'Использование',
    today_usage: 'Сегодняшнее использование',
    total_usage: 'Общее использование',
    reset_time: 'Время сброса',
    current_usage:
      'Текущее использование: {count} / {limit} запросов в этом месяце',
    subscription_renewal: 'Ваша подписка {action} {date}',
    subscription_renew: 'будет продлена',
    subscription_end: 'закончится',
    free_plan_status: 'Вы используете бесплатный план',
  },
  // Contact
  contact: {
    title: 'Связаться с нами',
    email: 'Электронная почта',
    subject: 'Тема',
    message: 'Сообщение',
    submit: 'Отправить',
    sending: 'Отправка...',
    success: 'Сообщение успешно отправлено!',
    errors: {
      required: 'Это поле обязательно',
      email_invalid: 'Пожалуйста, введите действительный email',
      rate_limit: 'Слишком много запросов. Пожалуйста, попробуйте позже.',
      generic_error: 'Не удалось отправить сообщение. Пожалуйста, попробуйте снова.'
    }
  },

  // Subscription plans
  plans: {
    heading: 'Выберите подходящий вам план',
    subheading: 'Начните с наших гибких ценовых опций',
    free: {
      title: 'Бесплатный план',
      description: 'Идеально для начала с базовыми функциями',
      current_plan: 'Текущий план',
      downgrade: 'Понизить',
    },
    pro: {
      title: 'Профессиональный план',
      description:
        'Для индивидуальных пользователей, которым требуется больше возможностей',
      subscribe: 'Подписаться',
    },
    enterprise: {
      title: 'Корпоративный план',
      description: 'Для команд и компаний с индивидуальными требованиями',
      contact_sales: 'Связаться с отделом продаж',
    },
    pricing: {
      month: 'месяц',
      custom_pricing: 'Индивидуально',
      pricing: 'цены',
      popular: 'Популярный',
      current_plan: 'Текущий план',
    },
    features: {
      core_features: 'Все основные функции включены',
      requests_free_daily: 'Ограничение:100запросов в день',
      requests_free_monthly: 'Ограничение: 500 запросов в месяц',
      standard_support: 'Стандартная поддержка',
      requests_pro_daily: 'Ограничение: 500 запросов в день',
      requests_pro_monthly: 'Ограничение: 10 000 запросов в месяц',
      priority_support: 'Приоритетная поддержка',
      custom_limits: 'Индивидуальные лимиты запросов',
      team_management: 'Функции управления командой',
      dedicated_support: 'Выделенная поддержка',
      custom_billing: 'Индивидуальные условия оплаты',
    },
  },
} as const
