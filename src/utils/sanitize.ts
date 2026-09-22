import sanitizeHtml from "sanitize-html";

export function safeHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "title", "target"],
    },
  });
}
