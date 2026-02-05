/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");
const admin = require("firebase-admin");

admin.initializeApp();

// Define the secret key parameter
const apiKeySecret = defineSecret("GEMINI_API_KEY");

/**
 * AI Chef Proxy Function
 * 
 * Proxies requests to Google Gemini API securely.
 * The Client NEVER sees the API Key.
 */
exports.generateAIContent = onCall({ secrets: [apiKeySecret], region: "us-central1" }, async (request) => {
  // 🛡️ 1. Security & Auth Guard
  if (!request.auth) {
    console.warn("🚫 Unauthenticated attempt.");
    return {
      success: false,
      errorCode: "AUTH",
      message: "User must be logged in."
    };
  }

  // 🛡️ 2. Input Validation
  const { prompt } = request.data;
  if (!prompt) {
    return {
      success: false,
      errorCode: "INVALID_ARGUMENT",
      message: "Prompt is required."
    };
  }

  try {
    console.log(`👨‍🍳 Request by: ${request.auth.uid}`);

    // 🔑 3. Key Retrieval
    // 🔑 3. Key Retrieval
    let apiKey = apiKeySecret.value();
    if (!apiKey || apiKey === "") {
      // Fallback for dev/testing when secret is not set
      console.warn("⚠️ Secrets empty, using fallback API key.");
      apiKey = "AIzaSyCpC993waGdgVHnwXp57zPLIRXclC2uWYA";
    }

    if (!apiKey) {
      console.error("❌ Critical: API Key missing in secrets.");
      return {
        success: false,
        errorCode: "SERVER_CONFIG",
        message: "API Key not configured."
      };
    }

    // 🤖 4. Model Configuration (LOCKED: gemini-pro / v1)
    const targetModel = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    };

    // 🌐 5. External API Call
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      validateStatus: (status) => status < 500 // Handle 4xx gracefully
    });

    // 🔍 6. Response Validation
    if (response.status !== 200) {
      console.error(`⚠️ Gemini API returned ${response.status}:`, JSON.stringify(response.data, null, 2));

      // Map Gemini Errors to Client ErrorCodes
      let errorCode = "UNKNOWN";
      if (response.status === 403) errorCode = "PERMISSION"; // Quota or Key
      if (response.status === 404) errorCode = "MODEL_NOT_FOUND";
      if (response.status === 429) errorCode = "RATE_LIMIT";

      return {
        success: false,
        errorCode: errorCode,
        message: `Gemini API Error: ${response.status}`
      };
    }

    const candidates = response.data.candidates;
    if (!candidates || candidates.length === 0) {
      console.error("⚠️ Gemini returned no candidates.");
      return {
        success: false,
        errorCode: "NO_CONTENT",
        message: "The chef could not come up with a recipe."
      };
    }

    // ✅ 7. Success
    return {
      success: true,
      data: candidates[0]
    };

  } catch (error) {
    console.error("❌ Fatal AI Chef Error:", error.message);

    // Catch Axios Connection Errors / Timeouts
    return {
      success: false,
      errorCode: "INTERNAL",
      message: "The chef is having trouble communicating."
    };
  }
});

/**
 * Multilingual Notification Translations
 */
const translations = {
  tr: {
    friendRequest: {
      title: "Yeni Arkadaşlık İsteği! 👋",
      body: (name) => `${name} seninle arkadaş olmak istiyor.`
    },
    friendAccepted: {
      title: "Arkadaşlık İsteği Kabul Edildi! 🎉",
      body: (name) => `${name} arkadaşlık isteğini kabul etti.`
    },
    listItemAdded: {
      title: (listName) => `🛒 ${listName}`,
      body: (userName, itemName) => `${userName} "${itemName}" ekledi`
    },
    listItemDeleted: {
      title: (listName) => `🗑️ ${listName}`,
      body: (userName, itemName) => `${userName} "${itemName}" sildi`
    }
  },
  en: {
    friendRequest: {
      title: "New Friend Request! 👋",
      body: (name) => `${name} wants to be your friend.`
    },
    friendAccepted: {
      title: "Friend Request Accepted! 🎉",
      body: (name) => `${name} accepted your friend request.`
    },
    listItemAdded: {
      title: (listName) => `🛒 ${listName}`,
      body: (userName, itemName) => `${userName} added "${itemName}"`
    },
    listItemDeleted: {
      title: (listName) => `🗑️ ${listName}`,
      body: (userName, itemName) => `${userName} removed "${itemName}"`
    }
  }
};

/**
 * Get user's preferred language (defaults to 'en')
 */
const getUserLanguage = (userData) => {
  const lang = userData?.preferredLanguage || userData?.language || 'en';
  return translations[lang] ? lang : 'en';
};

/**
 * Trigger: New Friend Request
 * Sends a notification to the recipient when a new friend request is created.
 */
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");

exports.onFriendRequestCreated = onDocumentCreated("friendRequests/{requestId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const request = snapshot.data();
  const toUserId = request.toUserId;
  const fromUserName = request.fromUserName;

  try {
    const userDoc = await admin.firestore().collection("users").doc(toUserId).get();
    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    const lang = getUserLanguage(userData);
    const t = translations[lang].friendRequest;

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: t.title,
          body: t.body(fromUserName),
        },
        data: {
          type: "friend_request",
          url: "/profile"
        }
      });
      console.log(`\uD83D\uDD14 Notification sent to ${toUserId} (${lang})`);
    }
  } catch (error) {
    console.error("\u274C Notification error:", error);
  }
});

/**
 * Trigger: Friend Request Accepted
 * Sends a notification to the sender when their request is accepted.
 */
exports.onFriendRequestAccepted = onDocumentUpdated("friendRequests/{requestId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // Only run if status changed to 'accepted'
  if (before.status !== 'accepted' && after.status === 'accepted') {
    const fromUserId = after.fromUserId;
    const toUserName = after.toUserName;

    try {
      const userDoc = await admin.firestore().collection("users").doc(fromUserId).get();
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      const lang = getUserLanguage(userData);
      const t = translations[lang].friendAccepted;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: t.title,
            body: t.body(toUserName),
          },
          data: {
            type: "friend_accepted",
            url: "/profile"
          }
        });
        console.log(`\uD83D\uDD14 Notification sent to ${fromUserId} (${lang})`);
      }
    } catch (error) {
      console.error("\u274C Notification error:", error);
    }
  }
});

/**
 * Trigger: Shopping List Updated
 * Sends notifications when items are added or deleted from shared lists.
 */
exports.onShoppingListUpdated = onDocumentUpdated("shoppingLists/{listId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (!before || !after) return;

  const beforeItems = before.items || [];
  const afterItems = after.items || [];
  const listName = after.name || "Shopping List";
  const listId = event.params.listId;

  // Determine what changed
  let notificationType = null;
  let changedItemName = "";
  let changerUserId = null;
  let changerUserName = "";

  if (afterItems.length > beforeItems.length) {
    // Item was added
    notificationType = "list_item_added";

    // Find the new item (last added)
    const newItem = afterItems.find(item =>
      !beforeItems.some(oldItem => oldItem.id === item.id)
    );

    if (newItem) {
      changedItemName = newItem.name || "item";
      changerUserId = newItem.addedBy;
      changerUserName = newItem.addedByName || "Someone";
    }
  } else if (afterItems.length < beforeItems.length) {
    // Item was deleted
    notificationType = "list_item_deleted";

    // Find the deleted item
    const deletedItem = beforeItems.find(item =>
      !afterItems.some(newItem => newItem.id === item.id)
    );

    if (deletedItem) {
      changedItemName = deletedItem.name || "item";
      changerUserId = after.lastModifiedBy || before.ownerId;
      changerUserName = after.lastModifiedByName || "Someone";
    }
  }

  if (!notificationType) return;

  // Get users to notify (sharedWith + owner, excluding the one who made the change)
  const usersToNotify = [];

  // Add owner if not the changer
  if (after.ownerId && after.ownerId !== changerUserId) {
    usersToNotify.push(after.ownerId);
  }

  // Add shared users if not the changer
  if (after.sharedWith && Array.isArray(after.sharedWith)) {
    after.sharedWith.forEach(userId => {
      if (userId !== changerUserId && !usersToNotify.includes(userId)) {
        usersToNotify.push(userId);
      }
    });
  }

  if (usersToNotify.length === 0) return;

  // Send notifications to all relevant users (with their preferred language)
  const notifications = usersToNotify.map(async (userId) => {
    try {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      const lang = getUserLanguage(userData);

      // Get translated message
      const translationKey = notificationType === "list_item_added" ? "listItemAdded" : "listItemDeleted";
      const t = translations[lang][translationKey];

      const title = t.title(listName);
      const body = t.body(changerUserName, changedItemName);

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: { title, body },
          data: {
            type: notificationType,
            listId: listId,
            url: `/lists/${listId}`
          }
        });
        console.log(`\uD83D\uDD14 List notification sent to ${userId} (${lang})`);
      }
    } catch (error) {
      console.error(`\u274C Notification error for ${userId}:`, error);
    }
  });

  await Promise.all(notifications);
});


