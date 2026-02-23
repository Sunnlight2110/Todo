/**
 * Generate a UUID v4 string
 * Used for chat session IDs to group messages together
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a session UUID for chat
 * Stores in localStorage to persist across page refreshes
 * @returns {string} UUID for the current chat session
 */
export function getOrCreateSessionUUID() {
  const STORAGE_KEY = 'chatSessionUUID';
  
  let sessionUUID = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionUUID) {
    sessionUUID = generateUUID();
    localStorage.setItem(STORAGE_KEY, sessionUUID);
  }
  
  return sessionUUID;
}

/**
 * Clear the session UUID (call this when starting a new chat session)
 */
export function clearSessionUUID() {
  localStorage.removeItem('chatSessionUUID');
}

/**
 * Update session UUID from backend response
 * Backend returns a new session_uuid after each message
 * @param {string} newUUID - New session UUID from backend
 */
export function updateSessionUUID(newUUID) {
  if (newUUID) {
    localStorage.setItem('chatSessionUUID', newUUID);
  }
}
