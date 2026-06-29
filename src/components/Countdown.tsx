import { useEffect, useState } from 'react';

interface CountdownProps {
  weddingDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function Countdown({ weddingDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(weddingDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(weddingDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!timeLeft) {
    return (
      <div className="countdown">
        <p className="countdown-complete">Today is the day!</p>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="countdown">
      <p className="countdown-label">Counting down to our special day</p>
      <div className="countdown-grid">
        {units.map(({ label, value }) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-value">{label === 'Days' ? value : pad(value)}</span>
            <span className="countdown-unit-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
