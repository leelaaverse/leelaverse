import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../store/slices/notificationSlice';
import { FiCheck, FiCheckCircle, FiHeart, FiMessageCircle, FiUserPlus, FiBell, FiImage, FiVideo } from 'react-icons/fi';

const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'like': return <FiHeart size={14} color="#ef4444" />;
        case 'comment': case 'reply': return <FiMessageCircle size={14} color="#3b82f6" />;
        case 'follow': return <FiUserPlus size={14} color="#22c55e" />;
        case 'post': return <FiImage size={14} color="#9b6cf8" />;
        case 'ai_generation_complete': return <FiVideo size={14} color="#f59e0b" />;
        default: return <FiBell size={14} color="#6b7280" />;
    }
};

const NotificationDropdown = ({ isOpen, onClose, onNavigate, isDarkMode }) => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, loading, hasMore, page } = useSelector(s => s.notifications);
    const listRef = useRef(null);
    const hasFetched = useRef(false);

    // Fetch on first open
    useEffect(() => {
        if (isOpen && !hasFetched.current) {
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
            hasFetched.current = true;
        }
    }, [isOpen, dispatch]);

    // Re-fetch when opened again
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications({ page: 1, limit: 20 }));
        }
    }, [isOpen, dispatch]);

    const handleMarkAllRead = useCallback(() => {
        dispatch(markAllNotificationsAsRead());
    }, [dispatch]);

    const handleNotificationClick = useCallback((notif) => {
        if (!notif.isRead) {
            dispatch(markNotificationAsRead(notif.id));
        }
        // Navigate based on type
        if (notif.postId && onNavigate) {
            onNavigate('post', notif.postId);
        }
        onClose();
    }, [dispatch, onNavigate, onClose]);

    const handleScroll = useCallback(() => {
        const el = listRef.current;
        if (!el || loading || !hasMore) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
            dispatch(fetchNotifications({ page: page + 1, limit: 20 }));
        }
    }, [dispatch, loading, hasMore, page]);

    if (!isOpen) return null;

    const bg = isDarkMode ? 'rgba(17,17,19,0.98)' : 'rgba(255,255,255,0.98)';
    const border = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDarkMode ? '#fff' : '#111';
    const textSecondary = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const hoverBg = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const unreadBg = isDarkMode ? 'rgba(155,108,248,0.06)' : 'rgba(155,108,248,0.04)';

    return (
        <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 360,
            maxHeight: 480,
            background: bg,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${border}`,
            borderRadius: 16,
            boxShadow: isDarkMode
                ? '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 16px 48px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            zIndex: 9999,
            fontFamily: "'Inter', -apple-system, sans-serif",
            animation: 'ndSlideIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}>
            <style>{`
                @keyframes ndSlideIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .nd-item:hover { background: ${hoverBg} !important; }
            `}</style>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: `1px solid ${border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: textPrimary, fontSize: 14, fontWeight: 700 }}>Notifications</span>
                    {unreadCount > 0 && (
                        <span style={{
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                            background: 'rgba(155,108,248,0.15)', color: '#9b6cf8'
                        }}>{unreadCount}</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9b6cf8', fontSize: 12, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                        borderRadius: 8, transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,108,248,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <FiCheckCircle size={13} /> Mark all read
                    </button>
                )}
            </div>

            {/* List */}
            <div
                ref={listRef}
                onScroll={handleScroll}
                style={{
                    maxHeight: 400, overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} transparent`
                }}
            >
                {notifications.length === 0 && !loading ? (
                    <div style={{
                        padding: '40px 20px', textAlign: 'center',
                        color: textSecondary, fontSize: 13
                    }}>
                        <FiBell size={28} style={{ marginBottom: 10, opacity: 0.3 }} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <button
                            key={notif.id}
                            className="nd-item"
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                padding: '12px 16px', border: 'none', cursor: 'pointer',
                                width: '100%', textAlign: 'left',
                                background: notif.isRead ? 'transparent' : unreadBg,
                                transition: 'background 0.15s',
                                borderBottom: `1px solid ${border}`,
                            }}
                        >
                            {/* Avatar or icon */}
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                            }}>
                                {notif.sender?.avatar ? (
                                    <img src={notif.sender.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <div style={{
                                    display: notif.sender?.avatar ? 'none' : 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    width: '100%', height: '100%',
                                }}>
                                    {getNotificationIcon(notif.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    color: textPrimary, fontSize: 13, fontWeight: notif.isRead ? 400 : 500,
                                    lineHeight: 1.4, marginBottom: 3,
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                }}>
                                    {notif.sender && (
                                        <span style={{ fontWeight: 600 }}>
                                            {notif.sender.username || notif.sender.firstName}{' '}
                                        </span>
                                    )}
                                    {notif.message}
                                </div>
                                <span style={{ color: textSecondary, fontSize: 11 }}>
                                    {getTimeAgo(notif.createdAt)}
                                </span>
                            </div>

                            {/* Unread dot */}
                            {!notif.isRead && (
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#9b6cf8', flexShrink: 0, marginTop: 6
                                }} />
                            )}
                        </button>
                    ))
                )}

                {loading && (
                    <div style={{ padding: '16px', textAlign: 'center', color: textSecondary, fontSize: 12 }}>
                        Loading...
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
