import * as SecureStore from "expo-secure-store";
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  isCancelledResponse,
} from "react-native-nitro-google-signin";

import {
  GOOGLE_WEB_CLIENT_ID,
  API_BASE_URL,
} from "../config/auth";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export interface GoogleLoginResult {
  token: string;
  user: AuthUser;
}

interface BackendAuthResponse {
  access_token: string;
  user: AuthUser;
  message?: string;
}

const TOKEN_KEY = "civic_lens_access_token";

GoogleOneTapSignIn.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export async function googleLogin(): Promise<GoogleLoginResult | null> {
  await GoogleOneTapSignIn.checkPlayServices();

  let response = await GoogleOneTapSignIn.signIn();

  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount();
  }

  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.presentExplicitSignIn();
  }

  if (isCancelledResponse(response)) {
    return null;
  }

  if (!isSuccessResponse(response)) {
    throw new Error("Google sign-in could not be completed.");
  }

  const { idToken } = response.data;

  if (!idToken) {
    throw new Error("Google did not return an ID token.");
  }

  const result = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  const data: BackendAuthResponse = await result.json();

  if (!result.ok) {
    throw new Error(data.message || "Backend authentication failed.");
  }

  await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);

  return {
    token: data.access_token,
    user: data.user,
  };
}

export async function getSavedToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session expired.");
  }

  const user: AuthUser = await response.json();
  return user;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await GoogleOneTapSignIn.signOut();
}