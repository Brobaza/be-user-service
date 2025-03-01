export enum RedisKey {
  USERNAMES = 'usernames',
  AVAILABLE_USERNAMES = 'available_usernames',

  PHONES = 'phones',
  AVAILABLE_PHONES = 'available_phones',

  EMAILS = 'emails',
  AVAILABLE_EMAILS = 'available_emails',

  // * locking
  USER_ORDER_LOCKING = 'user-order-locking',
  USER_TRANSACTION_LOCKING = 'user-transaction-locking',
  WALLET_TRANSACTION_LOCKING = 'wallet-transaction-locking',
  ORDER_TRANSACTION_LOCKING = 'order-transaction-locking',
  EVENT_DRAWING_LOCKING = 'event-drawing-locking',

  VERIFICATION_TIMEOUT = 'verification_timeout',
  VERIFICATIONS = 'verifications',
  BLACK_LIST_VERIFICATIONS = 'black_list_verifications',
  LIMIT_EMAIL_REGISTER_VERIFICATIONS = 'limit_email_register_verifications',
  LIMIT_EMAIL_RESET_PASSWORD_VERIFICATIONS = 'limit_email_reset_password_verifications',

  ACCESS_SESSIONS = 'access_sessions',
  REFRESH_SESSIONS = 'refresh_sessions',
  SESSIONS = 'sessions',
  BLACK_LIST_SESSIONS = 'black_list_sessions',
  BLACK_LIST_REFRESH_TOKENS = 'black_list_refresh_tokens',
  BLACK_LIST_ACCESS_TOKENS = 'black_list_access_tokens',

  DAILY_EVENT_ACCESS = 'daily-event-access',
  DAILY_EVENT_NOT_ACCESS = 'daily-event-not-access',
  DAILY_EVENT_PARTICIPATED = 'daily-event-participated',
  DAILY_EVENT_SETTINGS = 'daily-event-settings',
  DAILY_EVENT_STATUS = 'daily-event-status',
  DAILY_EVENT_PURCHASE_POINTS = 'daily-event-purchase-points',
  DAILY_EVENT_USER_POINTS = 'daily-event-user-points',
  DAILY_EVENT_ORDER_LOCKING = 'daily-event-order-locking',

  DEPOSIT_REQUEST_CREATED = 'deposit-request-created',
  DEPOSIT_REQUEST_PENDING = 'deposit-request-pending',
  DEPOSIT_REQUEST_CANCEL = 'deposit-request-cancel',
  DEPOSIT_REQUEST_COMPLETE = 'deposit-request-complete',

  EVENT = 'event',
  EVENTS = 'events',
  NOTFOUND_EVENTS = 'notfound-events',
  EVENT_OPEN = 'event-open',
  EVENT_NOT_ORDERABLE = 'event-not-orderable',
  EVENT_DRAWING = 'event-drawing',
  EVENT_COMPLETED = 'event-completed',

  EVENT_PURCHASE_POINTS = 'event-purchase-points',
  EVENT_RESERVATION_POINTS = 'event-reservation-points',
  EVENT_ORDER_LOCKING = 'event-order-locking',

  DAILY_JACKPOT_DRAWING_LOOKING = 'daily-jackpot-drawing-looking',
  DAILY_JACKPOT_DRAWING = 'daily-jackpot-drawing',
  DAILY_JACKPOT_SOLD_OUT = 'daily-jackpot-sold-out',
  DAILY_JACKPOT_COMPLETED = 'daily-jackpot-completed',
  DAILY_JACKPOT_RESERVATION_POINTS = 'daily-jackpot-reservation-points',
  DAILY_JACKPOT_OPEN = 'daily-jackpot-open',
  DAILY_JACKPOT_NOT_FOUND = 'daily-jackpot-not-found',
  DAILY_JACKPOT = 'daily-jackpot',
  DAILY_JACKPOT_ACCESS = 'daily-jackpot-access',
  DAILY_JACKPOT_NOT_ACCESS = 'daily-jackpot-not-access',
  DAILY_JACKPOT_SETTINGS = 'daily-jackpot-settings',
  DAILY_JACKPOT_STATUS = 'daily-jackpot-status',
  DAILY_JACKPOT_PURCHASE_POINTS = 'daily-jackpot-purchase-points',
  DAILY_JACKPOT_USER_POINTS = 'daily-jackpot-user-points',
  DAILY_JACKPOT_ORDER_LOCKING = 'daily-jackpot-order-locking',

  WEEKLY_JACKPOT_DRAWING_LOOKING = 'weekly-jackpot-drawing-looking',
  WEEKLY_JACKPOT_DRAWING = 'weekly-jackpot-drawing',
  WEEKLY_JACKPOT_SOLD_OUT = 'weekly-jackpot-sold-out',
  WEEKLY_JACKPOT_COMPLETED = 'weekly-jackpot-completed',
  WEEKLY_JACKPOT_RESERVATION_POINTS = 'weekly-jackpot-reservation-points',
  WEEKLY_JACKPOT_OPEN = 'weekly-jackpot-open',
  WEEKLY_JACKPOT_NOT_FOUND = 'weekly-jackpot-not-found',
  WEEKLY_JACKPOT = 'weekly-jackpot',
  WEEKLY_JACKPOT_ACCESS = 'weekly-jackpot-access',
  WEEKLY_JACKPOT_NOT_ACCESS = 'weekly-jackpot-not-access',
  WEEKLY_JACKPOT_SETTINGS = 'weekly-jackpot-settings',
  WEEKLY_JACKPOT_STATUS = 'weekly-jackpot-status',
  WEEKLY_JACKPOT_PURCHASE_POINTS = 'weekly-jackpot-purchase-points',
  WEEKLY_JACKPOT_USER_POINTS = 'weekly-jackpot-user-points',
  WEEKLY_JACKPOT_ORDER_LOCKING = 'weekly-jackpot-order-locking',

  MONTHLY_JACKPOT_DRAWING_LOOKING = 'monthly-jackpot-drawing-looking',
  MONTHLY_JACKPOT_DRAWING = 'monthly-jackpot-drawing',
  MONTHLY_JACKPOT_SOLD_OUT = 'monthly-jackpot-sold-out',
  MONTHLY_JACKPOT_COMPLETED = 'monthly-jackpot-completed',
  MONTHLY_JACKPOT_RESERVATION_POINTS = 'monthly-jackpot-reservation-points',
  MONTHLY_JACKPOT_OPEN = 'monthly-jackpot-open',
  MONTHLY_JACKPOT_NOT_FOUND = 'monthly-jackpot-not-found',
  MONTHLY_JACKPOT = 'monthly-jackpot',
  MONTHLY_JACKPOT_ACCESS = 'monthly-jackpot-access',
  MONTHLY_JACKPOT_NOT_ACCESS = 'monthly-jackpot-not-access',
  MONTHLY_JACKPOT_SETTINGS = 'monthly-jackpot-settings',
  MONTHLY_JACKPOT_STATUS = 'monthly-jackpot-status',
  MONTHLY_JACKPOT_PURCHASE_POINTS = 'monthly-jackpot-purchase-points',
  MONTHLY_JACKPOT_USER_POINTS = 'monthly-jackpot-user-points',
  MONTHLY_JACKPOT_ORDER_LOCKING = 'monthly-jackpot-order-locking',
}
