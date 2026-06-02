/**
 * Google Drive API Client-Side Integration Helper
 */

let tokenClient: any = null;
let accessToken: string | null = null;

// Initialize Google OAuth Token Client
export const initGoogleClient = (callback: (token: string) => void) => {
  if (typeof window === "undefined" || !(window as any).google) {
    console.error("Google SDK belum dimuat. Pastikan script index.html terpasang.");
    return;
  }

  const client = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse: any) => {
      if (tokenResponse.error !== undefined) {
        console.error("Google OAuth error:", tokenResponse.error);
        return;
      }
      accessToken = tokenResponse.access_token;
      localStorage.setItem("gdrive_access_token", tokenResponse.access_token);
      localStorage.setItem("gdrive_token_expires_at", String(Date.now() + tokenResponse.expires_in * 1000));
      callback(tokenResponse.access_token);
    },
  });
  tokenClient = client;
};

// Retrieve cached access token if it's still valid
export const getAccessToken = (): string | null => {
  const localToken = localStorage.getItem("gdrive_access_token");
  const expiresAt = localStorage.getItem("gdrive_token_expires_at");
  if (localToken && expiresAt && Date.now() < Number(expiresAt)) {
    accessToken = localToken;
    return localToken;
  }
  return null;
};

// Request token, triggering Google Auth popup if not cached or expired
export const requestGoogleToken = (callback: (token: string) => void) => {
  const activeToken = getAccessToken();
  if (activeToken) {
    callback(activeToken);
    return;
  }
  if (!tokenClient) {
    initGoogleClient(callback);
  }
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    console.error("Token client Google gagal diinisialisasi.");
  }
};

// Upload file to Google Drive REST API using multipart upload
export const uploadFileToGDrive = async (file: File, token: string): Promise<string> => {
  const parentFolderId = import.meta.env.NEXT_PUBLIC_GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const metadata = {
    name: `sipra_${Date.now()}_${file.name}`,
    mimeType: file.type,
    parents: parentFolderId ? [parentFolderId] : [],
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal upload ke Google Drive: ${response.statusText} - ${errText}`);
  }

  const result = await response.json();
  return result.id; // Google Drive File ID
};

// Helper to get Google Drive image source or fallback base64/url
export const getPhotoUrl = (foto?: string): string => {
  if (!foto) return "";
  if (foto.startsWith("data:") || foto.startsWith("blob:") || foto.startsWith("http")) {
    return foto;
  }
  // Construct direct media view URL using API Key
  const apiKey = import.meta.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  return `https://www.googleapis.com/drive/v3/files/${foto}?alt=media&key=${apiKey}`;
};
