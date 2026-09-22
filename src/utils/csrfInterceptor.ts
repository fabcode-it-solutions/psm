// utils/csrfInterceptor.ts
let csrfToken: string | null = null;

export async function setupCSRFInterceptor(): Promise<void> {
  if (csrfToken) return;

  const res = await fetch("/api/security/csrf", {
    credentials: "include",
  });

  const data: { token: string } = await res.json();
  csrfToken = data.token;
}

export function getCSRFTOKEN(): string | null {
  return csrfToken;
}
