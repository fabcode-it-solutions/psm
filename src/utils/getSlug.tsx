export const getSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-$/g, "")
    .replace(/^-/g, "")
    .trim();
};
