import { getCSRFTOKEN } from "@/utils/csrfInterceptor";

export function patchGlobalFetch(): void {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const method = init?.method?.toUpperCase() ?? "GET";

    const headers = new Headers(init?.headers);
    const csrfToken = getCSRFTOKEN();

    // ✅ Inject CSRF only for unsafe methods
    if (
      csrfToken &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(method)
    ) {
      headers.set("x-csrf-token", csrfToken);
    }

    return originalFetch(input, {
      ...init,
      headers,
      credentials: "include", // ✅ Required for cookie
    });
  };
}
