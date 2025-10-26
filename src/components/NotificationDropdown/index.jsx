import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoBell } from 'react-icons/go';
import { IoMdRefresh } from 'react-icons/io';
import { BiX } from 'react-icons/bi';
import { getNotificationsAction, markAsReadAction } from '../../store/slices/notifications/notificationSlice';
import { useAuthContext } from '../../context/authContext';
import moment from 'moment';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useAuthContext();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  // console.log(userData, '====userData===');
  useEffect(() => {
    // Fetch notifications on mount
    if (userData?.id) {
      dispatch(getNotificationsAction(userData.id));
    }
  }, [userData?.id, dispatch]);

  useEffect(() => {
    // Auto-refresh notifications every 30 seconds when dropdown is open
    let interval;
    if (isOpen && userData?.id) {
      interval = setInterval(() => {
        dispatch(getNotificationsAction(userData.id));
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, userData?.id, dispatch]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRefresh = () => {
    if (userData?.id) {
      dispatch(getNotificationsAction(userData.id));
    }
  };

  const handleMarkAsRead = (notification) => {
    if (notification.is_read === 0) {
      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('notification_id', notification.id);

      dispatch(markAsReadAction({ user_id: userData.id, notification_id: notification.id }));
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification);
    setIsOpen(false);
    // Navigate to inspection details if inspection_id exists
    if (notification.inspection_id) {
      navigate(`/app/inspections/${notification.inspection_id}`);
    }
  };

  const getTimeAgo = (dateString) => {
    return moment(dateString).fromNow();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <GoBell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                aria-label="Refresh notifications"
              >
                <IoMdRefresh size={20} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <BiX size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <IoMdRefresh size={24} className="text-gray-400 animate-spin" />
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <GoBell size={48} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.is_read === 0 ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.is_read === 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{notification.title}</h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {getTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>
                        {notification.inspection_id && (
                          <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                            Inspection #{notification.inspection_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate('/app/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
