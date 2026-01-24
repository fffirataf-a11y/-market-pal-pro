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
