import { useMemo } from "react";

type TimeLeft = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getTimeLeft(date: Date): TimeLeft {
  const now = new Date();
  const targetDate = new Date(date);
  targetDate.setMonth(targetDate.getMonth() + 3);
  if (targetDate <= now) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = targetDate.getTime() - now.getTime();

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));

  return { months, days, hours, minutes, seconds };
}

export default function UsernameCountdown({
  nextAllowed,
}: {
  nextAllowed: Date;
}) {
  const timeLeft: TimeLeft = useMemo(() => {
    return getTimeLeft(nextAllowed);
  }, [nextAllowed]);
  return (
    <div className="font-mono text-sm text-accent-100">
      {timeLeft.seconds > 0 && "You’ll be able to update your username after "}
      <b>
        {timeLeft.months > 0 &&
          `${timeLeft.months} month${timeLeft.months > 1 ? "s" : ""}`}
        {timeLeft.days > 0 &&
          ` ${timeLeft.days} day${timeLeft.days > 1 ? "s" : ""}`}
        {timeLeft.days == 0 &&
          timeLeft.months == 0 &&
          timeLeft.hours > 0 &&
          ` ${timeLeft.hours} hour${timeLeft.hours > 1 ? "s" : ""}`}
        {timeLeft.days == 0 &&
          timeLeft.months == 0 &&
          timeLeft.minutes > 0 &&
          ` ${timeLeft.minutes} minute${timeLeft.minutes > 1 ? "s" : ""}`}
        {timeLeft.hours == 0 &&
          timeLeft.months == 0 &&
          timeLeft.seconds > 0 &&
          ` ${timeLeft.seconds} second${timeLeft.seconds > 1 ? "s" : ""}`}
      </b>
      {timeLeft.seconds > 0 && "."}
      {timeLeft.seconds <= 0 && "Please try now."}
    </div>
  );
}
