export const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date?.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return "just now";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function getTimeLeft(date: Date) {
  const now = new Date();
  const targetDate = new Date(date);
  if (targetDate <= now) {
    return "Please try now.";
  }
  const diff = targetDate.getTime() - now.getTime();
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

  return `${months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""}${
    days > 0 ? ` ${days} day${days > 1 ? "s" : ""}` : ""
  }${hours > 0 ? ` ${hours} hour${hours > 1 ? "s" : ""}` : ""} ${
    minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : ""
  }${seconds > 0 && "."}`;
}
