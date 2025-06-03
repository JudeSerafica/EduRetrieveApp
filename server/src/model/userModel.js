const { db } = require('../config/firebaseAdminConfig');
const admin = require('firebase-admin');
const adminDb = admin.firestore();

/**
 * Fetches a user document from Firestore.
 * @param {string} userId The UID of the user.
 * @returns {Promise<Object|null>} The user data or null if not found.
 */
async function getUserById(userId) {
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      return { id: userDocSnap.id, ...userDocSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Could not fetch user profile.');
  }
}

/**
 * Creates or updates a user document in Firestore.
 * @param {string} userId The UID of the user.
 * @param {Object} userData The data to set/update.
 * @returns {Promise<void>}
 */
async function updateUserProfile(userId, userData) {
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.set(userData, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Could not update user profile.');
  }
}


/**
 * Saves a new chat entry as a sub-collection document under a user's document.
 * @param {string} userId - The ID of the user.
 * @param {string} prompt - The user's input prompt.
 * @param {string} response - The AI's generated response.
 * @param {string} conversationId - The ID of the conversation this chat belongs to.
 * @param {Object} clientTimestamp - The timestamp from the client ({_seconds, _nanoseconds}).
 * @returns {Promise<FirebaseFirestore.DocumentReference>} A promise that resolves to the new document reference.
 */
const saveChatEntry = async (userId, prompt, response, conversationId, clientTimestamp) => {
  try {
    const userDocRef = db.collection('users').doc(userId);
    const chatHistoryCollectionRef = userDocRef.collection('chatHistory');

    const firestoreTimestamp = new admin.firestore.Timestamp(clientTimestamp._seconds, clientTimestamp._nanoseconds);

    const newChatRef = await chatHistoryCollectionRef.add({
      prompt: prompt,
      response: response,
      timestamp: firestoreTimestamp,
      conversationId: conversationId,
    });

    console.log(`Chat entry saved for user ${userId} with ID: ${newChatRef.id}`);
    return newChatRef;
  } catch (error) {
    console.error(`Error saving chat entry for user ${userId}:`, error);
    throw new Error('Failed to save chat entry to Firestore.');
  }
};

/**
 * Retrieves all chat history entries for a specific user, ordered by timestamp.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of chat entry objects.
 */
const getChatHistory = async (userId) => {
  try {
    const chatHistoryCollectionRef = db.collection('users').doc(userId).collection('chatHistory');
    const snapshot = await chatHistoryCollectionRef.orderBy('timestamp', 'desc').get();

    const chatEntries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: {
        _seconds: doc.data().timestamp.seconds,
        _nanoseconds: doc.data().timestamp.nanoseconds
      }
    }));
    return chatEntries;
  } catch (error) {
    console.error(`Error retrieving chat history for user ${userId}:`, error);
    throw new Error('Failed to retrieve chat history from Firestore.');
  }
};

/**
 * Deletes all chat entries for a specific user associated with a given conversation ID.
 * @param {string} userId - The ID of the user.
 * @param {string} conversationId - The ID of the conversation to delete.
 * @returns {Promise<number>} A promise that resolves to the number of documents deleted.
 */
const deleteChatEntriesByConversationId = async (userId, conversationId) => {
  try {
    const chatHistoryCollectionRef = db.collection('users').doc(userId).collection('chatHistory');

    const querySnapshot = await chatHistoryCollectionRef.where('conversationId', '==', conversationId).get();

    if (querySnapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.size} chat messages for conversation ID: ${conversationId} for user ${userId}.`);
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error deleting chat history for user ${userId}, conversation ${conversationId}:`, error);
    throw new Error('Failed to delete chat history from Firestore.');
  }
};

const checkEmail = async ( email ) => {
    try {
    const usersRef = db.collection('users');
    const q = usersRef.where('email', '==', email).limit(1);
    const querySnapshot = await q.get();

    return !querySnapshot.empty; 
  } catch (error) {
    console.error('Error checking user email on server:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = {
  getUserById,
  updateUserProfile,
  saveChatEntry,
  getChatHistory,
  deleteChatEntriesByConversationId,
  checkEmail
};