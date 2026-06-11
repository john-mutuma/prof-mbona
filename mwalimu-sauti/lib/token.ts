import { execSync } from "child_process";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Gets an Azure AD bearer token for the Paza API using the az CLI.
 * Caches the token and refreshes it when it expires (with 5min buffer).
 */
export function getPazaToken(): string {
  const now = Date.now();
  // Refresh if within 5 minutes of expiry
  if (cachedToken && now < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const scope =
    process.env.PAZA_TOKEN_SCOPE ||
    "api://f85d942a-d1eb-471b-b227-1f24ae629dc3/.default";

  try {
    const result = execSync(
      `az account get-access-token --scope "${scope}" --query "{token:accessToken,expires:expiresOn}" -o json`,
      { encoding: "utf-8", timeout: 15000 }
    );

    const parsed = JSON.parse(result);
    cachedToken = parsed.token;
    // Parse the expiry time (az CLI returns ISO date string)
    tokenExpiresAt = new Date(parsed.expires).getTime();

    return cachedToken!;
  } catch (error) {
    // If az CLI fails, check if we have a still-valid cached token
    if (cachedToken && now < tokenExpiresAt) {
      console.warn("az CLI token refresh failed, using cached token");
      return cachedToken;
    }
    throw new Error(
      `Failed to get Paza token via az CLI. Run 'az login' first. Error: ${error}`
    );
  }
}
