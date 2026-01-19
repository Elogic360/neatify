/**
 * NotificationsPage - Full page view of all notifications
 */
import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useNotificationStore } from '../stores/featuresStore';
import { Notification } from '../types/features';

// Simple time ago function
const timeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

type FilterType = 'all' | 'unread' | 'order' | 'promo' | 'price_alert' | 'stock_alert' | 'system';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'promo':
        return '🎉';
      case 'price_alert':
        return '💰';
      case 'stock_alert':
        return '✨';
      case 'system':
      default:
        return '📢';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.data && notification.data.url) {
      window.location.href = notification.data.url as string;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-600">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-gray-400" />
        {[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'order', label: 'Orders' },
          { value: 'promo', label: 'Promotions' },
          { value: 'price_alert', label: 'Price Alerts' },
          { value: 'stock_alert', label: 'Stock Alerts' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as FilterType)}
            className={clsx(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 p-6">
              <div className="h-5 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="mt-16 text-center">
          <Bell className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {filter === 'all' ? 'No notifications yet' : 'No matching notifications'}
          </h2>
          <p className="mt-2 text-gray-500">
            {filter === 'all'
              ? "We'll notify you about orders, promotions, and more."
              : 'Try changing the filter to see other notifications.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                'group relative rounded-xl border transition-all',
                notification.is_read
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50'
              )}
            >
              <button
                onClick={() => handleNotificationClick(notification)}
                className="w-full p-4 text-left"
              >
                <div className="flex gap-4">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={clsx(
                          'font-medium',
                          notification.is_read ? 'text-gray-700' : 'text-gray-900'
                        )}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Actions */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-full bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 hover:text-green-600"
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
