import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

// VAPID public key — set this in your .env as VITE_VAPID_PUBLIC_KEY
// and generate a key pair in the server using web-push or similar.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

/**
 * Custom hook for PWA push notification subscription management.
 *
 * Usage:
 *   const { permission, isSubscribed, requestPermission, unsubscribe } = usePushNotifications();
 */
export default function usePushNotifications() {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if push is supported
    const isSupported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

    // Register the service worker on mount
    useEffect(() => {
        if (!isSupported) return;

        navigator.serviceWorker.register('/sw.js').then(reg => {
            setRegistration(reg);
            // Check if already subscribed
            reg.pushManager.getSubscription().then(sub => {
                setIsSubscribed(!!sub);
            });
        }).catch(err => {
            console.warn('SW registration failed:', err);
        });
    }, [isSupported]);

    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            setError('Push notifications are not supported in this browser.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== 'granted') {
                setError('Notification permission was not granted.');
                setIsLoading(false);
                return;
            }

            // Get the SW registration
            const reg = registration || await navigator.serviceWorker.ready;

            // If VAPID key is configured, create a real push subscription
            if (VAPID_PUBLIC_KEY) {
                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });

                // Send subscription to backend to store it
                await api.post('/notifications/subscribe', { subscription });
                setIsSubscribed(true);
            } else {
                // No VAPID key — still mark "subscribed" locally so UI updates
                // (notifications will fire from SW but won't use web-push server delivery)
                setIsSubscribed(true);
                console.info('[ElevateX] VAPID key not set — local SW notifications enabled only.');
            }
        } catch (err) {
            console.error('Push subscription error:', err);
            setError('Failed to enable push notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, registration]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported || !registration) return;
        setIsLoading(true);
        try {
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
                await sub.unsubscribe();
                // Notify backend to remove subscription
                try { await api.post('/notifications/unsubscribe', { endpoint: sub.endpoint }); } catch (_) { }
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error('Unsubscribe error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, registration]);

    return { permission, isSubscribed, isSupported, isLoading, error, requestPermission, unsubscribe };
}
