const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Arkadaş isteği gönderildiğinde notification
exports.onFriendRequestSent = functions.firestore
  .document('friendRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    console.log('🔔 Friend request sent:', request);
    
    try {
      const userDoc = await admin.firestore().collection('users').doc(request.toUserId).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      
      if (!fcmToken || !userData?.notificationsEnabled) return null;
      
      const message = {
        notification: {
          title: '👋 New Friend Request',
          body: `${request.fromUserName} wants to be your friend`,
        },
        token: fcmToken,
      };
      
      return await admin.messaging().send(message);
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  });

// Arkadaş isteği kabul edildiğinde notification
exports.onFriendRequestAccepted = functions.firestore
  .document('friendRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== 'pending' || after.status !== 'accepted') return null;
    
    try {
      const userDoc = await admin.firestore().collection('users').doc(after.fromUserId).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      
      if (!fcmToken || !userData?.notificationsEnabled) return null;
      
      const message = {
        notification: {
          title: '✅ Friend Request Accepted',
          body: `${after.toUserName} accepted your friend request!`,
        },
        token: fcmToken,
      };
      
      return await admin.messaging().send(message);
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  });
