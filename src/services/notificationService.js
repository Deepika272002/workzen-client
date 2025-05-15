import { db, firebase } from '../config/firebase';

export const sendMeetingNotifications = async (userIds, meetingCode, meetingTitle) => {
  try {
    const batch = db.batch();
    
    userIds.forEach(userId => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId,
        type: 'meeting_invitation',
        title: 'Meeting Invitation',
        message: `You've been invited to join a meeting: ${meetingTitle}`,
        meetingCode,
        isRead: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    // If you have real-time notifications via socket.io
    userIds.forEach(userId => {
      socket.emit('send-notification', {
        userId,
        notification: {
          type: 'meeting_invitation',
          title: 'Meeting Invitation',
          message: `You've been invited to join a meeting: ${meetingTitle}`,
          meetingCode
        }
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await db.collection('notifications').doc(notificationId).update({
      isRead: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
