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
    const apiKey = apiKeySecret.value();
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
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: "New Friend Request! \uD83D\uDC4B",
          body: `${fromUserName} wants to be your friend.`,
        },
        data: {
          type: "friend_request",
          url: "/profile"
        }
      });
      console.log(`\uD83D\uDD14 Notification sent to ${toUserId}`);
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
    const toUserName = after.toUserName; // Use toUserName stored in request

    try {
      const userDoc = await admin.firestore().collection("users").doc(fromUserId).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "Friend Request Accepted! \uD83C\uDF89",
            body: `${toUserName} accepted your friend request.`,
          },
          data: {
            type: "friend_accepted",
            url: "/profile"
          }
        });
        console.log(`\uD83D\uDD14 Notification sent to ${fromUserId}`);
      }
    } catch (error) {
      console.error("\u274C Notification error:", error);
    }
  }
});
