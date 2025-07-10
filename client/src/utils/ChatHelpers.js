export const formatFirebaseTimestamp = (timestamp) => {
  let seconds;
  let nanoseconds;

  if (timestamp && typeof timestamp._seconds === 'number') {
    seconds = timestamp._seconds;
    nanoseconds = timestamp._nanoseconds;
  } else if (timestamp && typeof timestamp.seconds === 'number') {
    seconds = timestamp.seconds;
    nanoseconds = timestamp.nanoseconds || 0;
  } else {
    return 'Invalid Date';
  }

  const dateInMilliseconds = seconds * 1000 + nanoseconds / 1_000_000;
  const date = new Date(dateInMilliseconds);

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString(undefined, options);
};

export const generateUniqueId = () =>
  `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const serverBaseUrl = 'http://localhost:5000';

export const fetchChatHistoryApi = async (user) => {
  if (!user) {
    throw new Error("User not authenticated to fetch chat history.");
  }
  const idToken = await user.getIdToken();

  const res = await fetch(`${serverBaseUrl}/api/chat/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch chat history.');
  }

  const data = await res.json();

  const sessionsMap = new Map();
  if (data.chatHistory) {
    data.chatHistory.forEach(item => {
      const conversationId = item.conversationId || formatFirebaseTimestamp(item.timestamp).split(',')[0];

      if (!sessionsMap.has(conversationId)) {
        sessionsMap.set(conversationId, {
          id: conversationId,
          title: `Chat from ${formatFirebaseTimestamp(item.timestamp).split(',')[0]}`,
          messages: []
        });
      }

      sessionsMap.get(conversationId).messages.push({
        type: 'user',
        text: item.prompt,
        timestamp: item.timestamp,
      });

      sessionsMap.get(conversationId).messages.push({
        type: 'ai',
        text: item.response,
        timestamp: item.timestamp,
      });
    });
  }

  const sessions = Array.from(sessionsMap.values()).sort((a, b) => {
    const dateA = a.messages[0]?.timestamp ? new Date(a.messages[0].timestamp._seconds * 1000) : new Date(0);
    const dateB = b.messages[0]?.timestamp ? new Date(b.messages[0].timestamp._seconds * 1000) : new Date(0);
    return dateB - dateA;
  });

  return sessions;
};

export const saveChatEntryApi = async (user, chatData) => {
  if (!user) {
    throw new Error("User not authenticated to save chat.");
  }
  const idToken = await user.getIdToken();

  const res = await fetch(`${serverBaseUrl}/api/chat/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(chatData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to save chat entry to backend.');
  }

  return await res.json();
};

export const deleteChatSessionApi = async (user, sessionIdToDelete) => {
  if (!user) {
    throw new Error("User not authenticated to delete chats.");
  }
  const idToken = await user.getIdToken();

  const res = await fetch(`${serverBaseUrl}/api/chat/delete/${sessionIdToDelete}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete chat session from backend.');
  }

  return await res.json();
};

export const generateContentApi = async (user, prompt) => {
  if (!user) {
    throw new Error("User not authenticated to generate content.");
  }
  const idToken = await user.getIdToken();

  const res = await fetch(`${serverBaseUrl}/api/generate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Something went wrong generating content.');
  }

  return await res.json();
};
