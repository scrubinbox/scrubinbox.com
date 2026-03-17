<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, userEmail } from '../stores/authStore.js';
  import { addLog } from '../stores/progressStore.js';
  import { initGoogleLibraries, requestAccessToken, revokeToken } from '../gmail/auth.js';
  import { getProfile } from '../gmail/api.js';
  import { getErrorMessage } from '../errors.js';

  let authReady = false;
  let authBtnDisabled = false;
  let authBtnText = 'Sign in with Google';

  onMount(async () => {
    try {
      await initGoogleLibraries();
      authReady = true;
    } catch (error) {
      addLog(`Failed to load Google libraries: ${getErrorMessage(error)}`, 'error');
    }
  });

  async function signIn() {
    if (authBtnDisabled) return;

    authBtnDisabled = true;
    authBtnText = 'Authenticating...';

    try {
      await requestAccessToken();
      $isAuthenticated = true;
      try {
        const profile = await getProfile();
        $userEmail = profile.emailAddress || '';
      } catch (e) {
        $userEmail = '';
      }
      addLog('Successfully authenticated with Gmail!', 'success');
    } catch (error) {
      addLog(`Authentication failed: ${getErrorMessage(error)}`, 'error');
    } finally {
      authBtnDisabled = false;
      authBtnText = 'Sign in with Google';
    }
  }

  async function signOut() {
    try {
      await revokeToken();
      $isAuthenticated = false;
      $userEmail = '';
      addLog('Signed out from Gmail', 'info');
    } catch (error) {
      addLog(`Sign out error: ${getErrorMessage(error)}`, 'error');
    }
  }
</script>

<div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100/50 hover:shadow-2xl transition-shadow duration-300">
  <div class="flex items-center justify-between mb-6">
    <div class="flex-1">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Authentication Status</h2>
      <p class="text-gray-600" class:text-green-600={$isAuthenticated} class:font-semibold={$isAuthenticated}>
        {$isAuthenticated ? 'Connected to Gmail' : 'Not connected to Gmail'}
      </p>
    </div>
    {#if $isAuthenticated}
      <div class="text-right">
        <span class="text-green-600 font-semibold">&#10003; Connected</span>
        {#if $userEmail}
          <p class="text-sm text-gray-500 mt-1">{$userEmail}</p>
        {/if}
      </div>
    {/if}
  </div>

  {#if $isAuthenticated}
    <button
      on:click={signOut}
      class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
    >
      Sign Out
    </button>
  {:else}
    <button
      on:click={signIn}
      disabled={!authReady || authBtnDisabled}
      class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {#if !authReady}
        Loading...
      {:else}
        {authBtnText}
      {/if}
    </button>

    <!-- Info -->
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        This app runs entirely in your browser. Your Gmail data never leaves your device.
        Click "Sign in with Google" to grant temporary access to scan and clean your inbox.
      </p>
    </div>
  {/if}
</div>
