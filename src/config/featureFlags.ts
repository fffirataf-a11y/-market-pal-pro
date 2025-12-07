// Feature flags for runtime behavior that we can toggle later
// For now, ads are disabled so the UI remains hidden.
export const ADS_ENABLED = true;

// When ads are enabled, auto-play a rewarded ad once on app start for free users
export const ADS_AUTOPLAY_ON_START = true;

// Session key to avoid multiple auto-plays per session
export const ADS_SESSION_PLAY_KEY = "ads.session.autoplayed";