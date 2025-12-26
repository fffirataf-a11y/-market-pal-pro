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

// --- GEMINI API FUNCTIONS ---

// Helper to get key
const getApiKey = () => process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;


// 1. Generate Recipe
exports.generateRecipe = functions.https.onCall(async (data, context) => {
  // Auth check (optional but recommended)
  // if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');

  const { dishName, language } = data;
  if (!dishName) throw new functions.https.HttpsError('invalid-argument', 'Dish name is required');

  const apiKey = getApiKey();
  if (!apiKey) throw new functions.https.HttpsError('failed-precondition', 'API Key not configured');

  const isTurkish = language === 'tr';
  const prompt = isTurkish
    ? `"${dishName}" için kısa tarif oluştur. Sadece JSON döndür (başka hiçbir şey yazma):
{"name":"yemek adı","servings":4,"time":"X dk","difficulty":"Kolay","ingredients":[{"name":"malzeme","quantity":"miktar"}]}

ÖNEMLI: Tüm metinler TÜRKÇE olmalı!`
    : `Create a short recipe for "${dishName}". Return ONLY this JSON (nothing else):
{"name":"dish name","servings":4,"time":"X mins","difficulty":"Easy","ingredients":[{"name":"ingredient","quantity":"amount"}]}

IMPORTANT: All text must be in ENGLISH!`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const result = await response.json();
    return result; // Return raw Gemini response to frontend to handle parsing
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new functions.https.HttpsError('internal', 'AI generation failed', error.message);
  }
});

// 2. Generate Ideas
exports.generateIdeas = functions.https.onCall(async (data, context) => {
  const { ingredients, language } = data;
  if (!ingredients) throw new functions.https.HttpsError('invalid-argument', 'Ingredients are required');

  const apiKey = getApiKey();
  if (!apiKey) throw new functions.https.HttpsError('failed-precondition', 'API Key not configured');

  const isTurkish = language === 'tr';
  const prompt = isTurkish
    ? `"${ingredients}" ile tarif yap. Sadece JSON döndür:
{"name":"yemek","servings":2,"time":"X dk","difficulty":"Kolay","ingredients":[{"name":"x","quantity":"y"}],"suggestions":["Yemek 1","Yemek 2","Yemek 3"]}

ÖNEMLI: Tüm metinler TÜRKÇE olmalı!`
    : `Recipe with: "${ingredients}". Return ONLY JSON:
{"name":"dish","servings":2,"time":"X mins","difficulty":"Easy","ingredients":[{"name":"x","quantity":"y"}],"suggestions":["Dish 1","Dish 2","Dish 3"]}

IMPORTANT: All text must be in ENGLISH!`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Gemini Ideas Error:', error);
    throw new functions.https.HttpsError('internal', 'AI generation failed', error.message);
  }
});


