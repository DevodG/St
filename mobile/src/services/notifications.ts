import PushNotification from 'react-native-push-notification';

export function configureNotifications(): void {
  PushNotification.configure({
    onNotification: () => undefined,
    requestPermissions: true,
  });

  PushNotification.createChannel(
    {
      channelId: 'stockly-alerts',
      channelName: 'StockLy Alerts',
      channelDescription: 'Price alerts, trade confirmations, and achievement unlocks',
      importance: 4,
      vibrate: true,
    },
    () => undefined,
  );
}

export function notifyLocal(title: string, message: string): void {
  PushNotification.localNotification({
    channelId: 'stockly-alerts',
    title,
    message,
  });
}
