import { DEFAULT_NOTIFICATION_APP_SETTINGS, SellerNotificationEventKey } from '@/lib/notification-settings';
import { prisma } from '@/lib/prisma';

type NotificationVariables = Record<string, string | number | boolean | null | undefined>;

type SendSellerNotificationInput = {
  key: SellerNotificationEventKey;
  to: string;
  variables?: NotificationVariables;
};

const DEFAULT_NOTIFICATION_VALUES = new Map(
  DEFAULT_NOTIFICATION_APP_SETTINGS.map((setting) => [setting.key, setting.value])
);

function renderTemplate(template: string, variables: NotificationVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = variables[token];
    if (value === null || value === undefined) return '';
    return String(value);
  });
}

async function readNotificationSettings(keys: string[]): Promise<Map<string, string>> {
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });

  const map = new Map<string, string>();
  keys.forEach((key) => {
    map.set(key, DEFAULT_NOTIFICATION_VALUES.get(key) ?? '');
  });

  settings.forEach((setting) => {
    map.set(setting.key, setting.value);
  });

  return map;
}

export async function sendSellerNotification({
  key,
  to,
  variables = {},
}: SendSellerNotificationInput): Promise<{ sent: boolean; reason?: string }> {
  const enabledKey = `${key}_enabled`;
  const importantKey = `${key}_important`;
  const subjectKey = `${key}_subject`;
  const templateKey = `${key}_template`;
  const fromKey = 'notification_from_email';

  const values = await readNotificationSettings([
    enabledKey,
    importantKey,
    subjectKey,
    templateKey,
    fromKey,
  ]);

  if (values.get(enabledKey) !== 'true') {
    return { sent: false, reason: 'disabled' };
  }

  const subject = renderTemplate(values.get(subjectKey) ?? '', variables);
  const body = renderTemplate(values.get(templateKey) ?? '', variables);
  const from = values.get(fromKey) ?? '';
  const important = values.get(importantKey) === 'true';

  const payload = {
    eventKey: key,
    important,
    from,
    to,
    subject,
    text: body,
  };

  const webhookUrl = process.env.NOTIFICATION_EMAIL_WEBHOOK_URL;
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NOTIFICATION_EMAIL_WEBHOOK_TOKEN
          ? { 'x-notification-token': process.env.NOTIFICATION_EMAIL_WEBHOOK_TOKEN }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Notification webhook failed for ${key} (${response.status})`);
    }
  } else {
    console.log('Seller notification (no webhook configured):', payload);
  }

  return { sent: true };
}
