import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for countdown timer
 * @param {Date|string|number} targetDate - The target date to count down to
 * @returns {Object} { timeLeft, isExpired, formatTime }
 */
export function useCountdown(targetDate) {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const isExpired = timeLeft.total <= 0;

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, targetDate]);

  /**
   * Format time left as a string
   * @param {boolean} showSeconds - Whether to show seconds
   * @returns {string} Formatted time string
   */
  const formatTime = useCallback(
    (showSeconds = true) => {
      const { days, hours, minutes, seconds } = timeLeft;

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }

      const parts = [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0")];

      if (showSeconds) {
        parts.push(seconds.toString().padStart(2, "0"));
      }

      return parts.join(":");
    },
    [timeLeft]
  );

  return { timeLeft, isExpired, formatTime };
}

/**
 * Hook to determine contest status based on time
 * @param {Date|string} startTime - Contest start time
 * @param {Date|string} endTime - Contest end time
 * @returns {string} 'upcoming' | 'live' | 'ended'
 */
export function useContestStatus(startTime, endTime) {
  const [status, setStatus] = useState(() => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "ended";
  });

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (now < start) setStatus("upcoming");
      else if (now >= start && now <= end) setStatus("live");
      else setStatus("ended");
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return status;
}

export default useCountdown;
