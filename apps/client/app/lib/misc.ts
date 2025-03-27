export function removeTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function getOrigin(requestInfo?: { origin?: string; path: string }) {
  return requestInfo?.origin ?? "https://mfoni.app";
}

function getUrl(requestInfo?: { origin: string; path: string }) {
  return removeTrailingSlash(
    `${getOrigin(requestInfo)}${requestInfo?.path ?? ""}`,
  );
}

export function typedBoolean<T>(
  value: T,
): value is Exclude<T, "" | 0 | false | null | undefined> {
  return Boolean(value);
}

export function getDisplayUrl(requestInfo?: { origin: string; path: string }) {
  return getUrl(requestInfo).replace(/^https?:\/\//, "");
}

/**
 * @returns domain URL (without a ending slash, like: https://mfoni.app)
 */
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export const getNameInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

export const isALink = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateLicense = (license: string) => {
  const validLicenses = ["ALL", "FREE", "PREMIUM"];
  return validLicenses.includes(license) ? license : "ALL";
};

export const validateOrientation = (orientation: string) => {
  const validOrientations = ["ALL", "LANDSCAPE", "PORTRAIT", "SQUARE"];
  return validOrientations.includes(orientation) ? orientation : "ALL";
};

export function isEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
