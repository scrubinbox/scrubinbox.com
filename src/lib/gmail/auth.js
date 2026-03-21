/**
 * Google Identity Services (GIS) + gapi.client initialization
 *
 * Manages the two-library ready state and OAuth token lifecycle.
 * GIS automatically sets the access token in gapi.client after auth.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://mail.google.com/';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

/**
 * Load a script tag and return a promise that resolves when loaded.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Wait for a global variable to be defined (handles async script loading).
 */
function waitForGlobal(name, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (window[name]) {
      resolve(window[name]);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window[name]) {
        clearInterval(interval);
        resolve(window[name]);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for ${name} to load`));
      }
    }, 50);
  });
}

/**
 * Initialize both gapi.client and GIS. Call once on app startup.
 * Returns when both libraries are ready for use.
 */
export async function initGoogleLibraries() {
  // Load both scripts in parallel
  await Promise.all([
    loadScript('https://apis.google.com/js/api.js'),
    loadScript('https://accounts.google.com/gsi/client'),
  ]);

  // Wait for globals to be available
  await Promise.all([
    waitForGlobal('gapi'),
    waitForGlobal('google'),
  ]);

  // Initialize gapi.client
  await new Promise((resolve) => gapi.load('client', resolve));
  await gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;

  // Initialize GIS token client
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // Set per-request in requestAccessToken()
  });
  gisInited = true;
}

/**
 * Request an access token via GIS popup.
 * GIS automatically sets the token in gapi.client.
 * Returns a promise that resolves with the token response.
 */
export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google libraries not initialized. Call initGoogleLibraries() first.'));
      return;
    }

    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error !== undefined) {
        reject(new Error(tokenResponse.error));
        return;
      }
      // Token is automatically set in gapi.client by GIS
      resolve(tokenResponse);
    };

    tokenClient.error_callback = (err) => {
      reject(new Error(err.type || 'Authorization failed'));
    };

    // First time: show consent screen. Returning user: skip chooser.
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * Revoke the current access token and clear it from gapi.client.
 */
export function revokeToken() {
  return new Promise((resolve) => {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
        resolve();
      });
    } else {
      resolve();
    }
  });
}

