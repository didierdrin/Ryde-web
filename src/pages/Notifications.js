import React, { useCallback, useEffect, useState } from 'react';
import {
    Bell,
    BellOff,
    Car,
    CheckCircle,
    CreditCard,
    Info,
    Loader,
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const formatLabel = (value) => {
    if (!value) return 'Notification';
    return String(value)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const formatWhen = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
};

const notificationIcon = (type) => {
    const normalized = String(type || '').toUpperCase();
    if (normalized.includes('TRIP')) return Car;
    if (normalized.includes('PAYMENT')) return CreditCard;
    if (normalized === 'SYSTEM') return Info;
    if (normalized.includes('ACCEPTED') || normalized.includes('COMPLETED')) return CheckCircle;
    return Bell;
};

const normalizeNotification = (row) => ({
    id: row.notificationId || row.notification_id,
    title: row.title || 'Notification',
    message: row.message || '',
    type: row.notificationType || row.notification_type || 'SYSTEM',
    isRead: row.isRead === true || row.is_read === true,
    sentAt: row.sentAt || row.sent_at,
});

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const isRead = filter === 'unread' ? false : filter === 'read' ? true : null;
            const { notifications: list } = await api.getNotifications(isRead);
            setNotifications((list || []).map(normalizeNotification));
        } catch (err) {
            setError(err.message || 'Failed to load notifications');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAsRead = async (notification) => {
        if (notification.isRead) return;
        try {
            await api.markNotificationAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notification.id ? { ...item, isRead: true } : item
                )
            );
            window.dispatchEvent(new CustomEvent('ryde:notifications-updated'));
        } catch (err) {
            alert(err.message || 'Could not mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await api.markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
            window.dispatchEvent(new CustomEvent('ryde:notifications-updated'));
        } catch (err) {
            alert(err.message || 'Could not mark all as read');
        } finally {
            setMarkingAll(false);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Notifications"
                subtitle="Stay updated on trips, payments, and system alerts"
            />

            <div className="max-w-3xl mx-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex gap-2">
                        {['all', 'unread', 'read'].map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium btn-tab ${
                                    filter === key ? 'btn-tab-active' : ''
                                }`}
                            >
                                {key === 'all' ? 'All' : key === 'unread' ? 'Unread' : 'Read'}
                            </button>
                        ))}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            disabled={markingAll}
                            className="flex items-center gap-2 px-4 py-2 btn-outline-primary rounded-lg text-sm disabled:opacity-50"
                        >
                            {markingAll ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Mark all as read
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader size={32} className="animate-spin text-gray-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <BellOff size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600 font-medium">No notifications</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {filter === 'unread'
                                ? 'You have read everything.'
                                : 'New alerts will appear here.'}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map((notification) => {
                            const Icon = notificationIcon(notification.type);
                            return (
                                <li key={notification.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleMarkAsRead(notification)}
                                        className={`w-full text-left bg-white rounded-xl border p-4 transition-colors hover:border-gray-300 ${
                                            notification.isRead
                                                ? 'border-gray-200 opacity-90'
                                                : 'border-blue-200 bg-blue-50/40'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div
                                                className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                                                    notification.isRead
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p
                                                        className={`font-semibold text-gray-900 ${
                                                            notification.isRead ? 'font-medium' : ''
                                                        }`}
                                                    >
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                                    {notification.message}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                                                        {formatLabel(notification.type)}
                                                    </span>
                                                    <span>{formatWhen(notification.sentAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Notifications;
