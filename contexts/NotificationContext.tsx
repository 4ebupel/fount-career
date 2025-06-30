import React, {
    createContext,
    useState,
    useEffect,
    useRef,
    ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/lib/registerForPushNotificationsAsync";

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
    sendPushNotification: (expoPushToken: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);

    async function sendPushNotification(expoPushToken: string) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: 'Original Title',
            body: 'And here is the body!',
            data: { someData: 'goes here' },
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }

    // const notificationListener = useRef<EventSubscription | null>(null);
    // const responseListener = useRef<EventSubscription | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(
            (token) => setExpoPushToken(token ?? null),
            (error) => setError(error)
        );

        // notificationListener.current =
        //     Notifications.addNotificationReceivedListener((notification) => {
        //         console.log("🔔 Notification Received: ", notification);
        //         setNotification(notification);
        //     });

        // responseListener.current =
        //     Notifications.addNotificationResponseReceivedListener((response) => {
        //         console.log(
        //             "🔔 Notification Response: ",
        //             JSON.stringify(response, null, 2),
        //             JSON.stringify(response.notification.request.content.data, null, 2)
        //         );
        //         // Handle the notification response here
        //     });

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener) {
                notificationListener.remove();
            }
            if (responseListener) {
                responseListener.remove();
            }
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{ expoPushToken, notification, error, sendPushNotification }}
        >
            {children}
        </NotificationContext.Provider>
    );
};