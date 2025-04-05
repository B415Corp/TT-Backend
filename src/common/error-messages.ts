export const ErrorMessages = {
  // Пользовательские ошибки
  USER_NOT_FOUND: 'Пользователь не найден или был удален',
  INVALID_PASSWORD: 'Неверный пароль',
  USER_TO_ADD_NOT_FOUND: 'Пользователь которого вы хотите добавить не найден',
  USER_TO_DELETE_NOT_FOUND:
    'Пользователь, которого вы хотите удалить, не найден',
  USER_ALREADY_IN_PROJECT: 'Пользователь уже добавлен в проект',
  USER_NOT_IN_PROJECT: 'Такого пользователя нет в проекте',
  INVALID_CREDENTIALS: 'Неверные учетные данные',
  USER_EXISTS: 'Пользователь с таким email уже существует',
  // Проектные ошибки
  PROJECT_NOT_FOUND: (id: string) => `Проект ${id} не найден`,
  PROJECT_NAME_EXISTS: 'Проект с таким названием уже существует',
  PROJECT_NO_ACCESS: 'Проект не найден либо вы не являетесь его владельцем',
  PROJECT_MEMBER_NOT_FOUND:
    'У вас нет прав на изменение или удаление этого проекта',
  // Задачи
  TASK_NOT_FOUND: (id: string) => `Задача ${id} не найдена`,
  NO_TASKS_FOUND: 'Задачи не найдены',
  USER_ALREADY_ASSIGNED: 'Пользователь уже назначен на эту задачу',
  TASK_AND_USER_ID_REQUIRED: 'Необходимо указать как task_id, так и user_id.',
  TASK_MEMBER_NOT_FOUND: 'У вас нет прав на изменение или удаление этой задачи',
  // Валюта
  CURRENCY_NOT_FOUND: 'Указанная валюта не найдена',
  // Планы
  PLAN_NOT_FOUND: 'План подписки не найлен',
  // Подписка
  SUBSCR_NOT_FOUND: 'План подписки не найлен',
  // Подписка
  SUBSCRIPTION_TYPE_NOT_FOUND: (type: string) =>
    `Тип подписки "${type}" не существует`,
  // Клиенты
  CLIENT_NOT_FOUND: (id: string) => `Клиент ${id} не найден`,
  // Ошибки сессии и авторизации
  UNAUTHORIZED: 'Необходима авторизация',
  ACCESS_DENIED: 'Доступ запрещен',
  TOKEN_REQUIRED: 'Отсутствует токен авторизации',
  INVALID_TOKEN: 'Недействительный токен авторизации',
  INVALID_TOKEN_FORMAT: 'Неверный формат токена авторизации',
  SESSION_EXPIRED: 'Срок действия сессии истек. Пожалуйста, войдите снова',
  // Ошибки логов времени
  TIME_LOG_NOT_FOUND: (id: string) => `Лог времени ${id} не найден`,
  TIME_LOG_ALREADY_STARTED: 'Лог времени уже запущен',
  TIME_LOG_NOT_STARTED: 'Лог времени не запущен',
  TIME_LOG_ALREADY_STOPPED: 'Лог времени уже остановлен',
  LATEST_TIME_LOG_NOT_FOUND: (id: string) =>
    `Последняя временная отметка для задачи с ID "${id}" не найдена.`,
  TIME_LOG_ID_REQUIRED: (id: string) => `Лог ${id} не найден`,
  // Ошибки сервера
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  BAD_REQUEST: 'Неверный запрос',
  NO_RESULTS_FOUND: 'Ничего не найдено',
  // Ограничения
  USER_ROLE_LIMIT_EXCEEDED:
    'Превышен лимит ролей пользователя для этого проекта',
  // Доступ
  ACCESS_FORBIDDEN: (roles: string) =>
    `У вас нет разрешения на доступ к этому ресурсу. Необходимая роль: ${roles}`,
  // Ошибки тегов
  TAG_NOT_FOUND: (id: string) => `Тег ${id} не найден`,
  TAG_ALREADY_EXISTS: (name: string) => `Тег с именем "${name}" уже существует`,
};
