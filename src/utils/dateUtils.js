export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateForHeader = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
};

export const groupMessagesByDate = (messages) => {
    if (!messages) return {};

    // Sort messages by date first to ensure order
    const sortedMessages = [...messages].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.at || a.timestamp);
        const dateB = new Date(b.createdAt || b.at || b.timestamp);
        return dateA - dateB;
    });

    const groups = {};
    sortedMessages.forEach(msg => {
        const dateVal = msg.createdAt || msg.at || msg.timestamp;
        if (!dateVal) return;

        const dateKey = formatDateForHeader(dateVal);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
    });
    return groups;
};

export const formatConversationDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return formatTime(dateString);
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
};
