export type NotificationSettingType = 'TEXT' | 'BOOLEAN';

export type NotificationSettingSeed = {
  key: string;
  value: string;
  label: string;
  description?: string;
  type: NotificationSettingType;
  category: 'notifications';
};

export type SellerNotificationEventKey =
  | 'seller_account_activation'
  | 'seller_account_verified'
  | 'seller_status_updated';

type SellerNotificationEvent = {
  key: SellerNotificationEventKey;
  label: string;
  description: string;
  defaultEnabled: boolean;
  defaultImportant: boolean;
  defaultSubject: string;
  defaultTemplate: string;
};

export const SELLER_NOTIFICATION_EVENTS: SellerNotificationEvent[] = [
  {
    key: 'seller_account_activation',
    label: 'Seller Account Activation',
    description: 'Sent when a seller account is created and requires email activation.',
    defaultEnabled: true,
    defaultImportant: true,
    defaultSubject: 'Activate your ZuriKaribu seller account',
    defaultTemplate: `Hello {{seller_name}},

Welcome to ZuriKaribu Sellers. Your account has been created, but you need to activate it before signing in.

Activate your account using this secure link:
{{activation_url}}

This activation link expires on {{activation_expires_at}}.

If you did not create this account, please ignore this message.`,
  },
  {
    key: 'seller_account_verified',
    label: 'Seller Account Verified',
    description: 'Sent after a seller successfully activates their account.',
    defaultEnabled: true,
    defaultImportant: false,
    defaultSubject: 'Your ZuriKaribu seller account is now active',
    defaultTemplate: `Hello {{seller_name}},

Your email has been verified and your seller account is now active.

You can sign in here:
{{login_url}}

Thank you for joining ZuriKaribu Sellers.`,
  },
  {
    key: 'seller_status_updated',
    label: 'Seller Status Updated',
    description: 'Sent whenever an admin changes a seller account status.',
    defaultEnabled: true,
    defaultImportant: true,
    defaultSubject: 'Your seller account status has been updated',
    defaultTemplate: `Hello {{seller_name}},

Your seller account status has changed from {{previous_status}} to {{current_status}}.

If you have any questions, please contact {{support_email}}.`,
  },
];

export const DEFAULT_NOTIFICATION_APP_SETTINGS: NotificationSettingSeed[] = [
  {
    key: 'notification_from_email',
    value: 'no-reply@zurikaribu.com',
    label: 'Notification Sender Email',
    description: 'Email address used as sender for seller notifications.',
    type: 'TEXT',
    category: 'notifications',
  },
  ...SELLER_NOTIFICATION_EVENTS.flatMap((event) => [
    {
      key: `${event.key}_enabled`,
      value: event.defaultEnabled ? 'true' : 'false',
      label: `${event.label} Enabled`,
      description: `Enable or disable this notification: ${event.description}`,
      type: 'BOOLEAN' as const,
      category: 'notifications' as const,
    },
    {
      key: `${event.key}_important`,
      value: event.defaultImportant ? 'true' : 'false',
      label: `${event.label} Important`,
      description: 'Mark this notification as important for operational priority.',
      type: 'BOOLEAN' as const,
      category: 'notifications' as const,
    },
    {
      key: `${event.key}_subject`,
      value: event.defaultSubject,
      label: `${event.label} Subject`,
      description: 'Subject line template for this notification.',
      type: 'TEXT' as const,
      category: 'notifications' as const,
    },
    {
      key: `${event.key}_template`,
      value: event.defaultTemplate,
      label: `${event.label} Template`,
      description: 'Body template for this notification email. Use {{placeholder}} values.',
      type: 'TEXT' as const,
      category: 'notifications' as const,
    },
  ]),
];
