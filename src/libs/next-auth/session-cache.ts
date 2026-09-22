interface CachedUserData {
  id: number;
  isBlocked: boolean;
  role: string;
  isVerified: boolean;
  cachedAt: number;
}

const userCache = new Map<string, CachedUserData>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedUser = (email: string): CachedUserData | null => {
  const cached = userCache.get(email);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.cachedAt > CACHE_TTL) {
    userCache.delete(email);
    return null;
  }
  
  return cached;
};

export const setCachedUser = (
  email: string, 
  data: Omit<CachedUserData, 'cachedAt'>
): void => {
  userCache.set(email, {
    ...data,
    cachedAt: Date.now(),
  });
};

export const invalidateCachedUser = (email: string): void => {
  userCache.delete(email);
};

// Clear expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  userCache.forEach((value, key) => {
    if (now - value.cachedAt > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => userCache.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`🗑️ Cleared ${keysToDelete.length} expired cache entries`);
  }
}, 10 * 60 * 1000);