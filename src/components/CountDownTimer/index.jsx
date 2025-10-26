import { useEffect, useState } from 'react';
import moment from 'moment';

const CountDownTimer = ({ isoString = moment().toISOString() }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = moment(isoString); // Example future target date

    const interval = setInterval(() => {
      const now = moment();
      const difference = moment.duration(targetDate.diff(now));

      if (difference.asMilliseconds() <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: difference.days(),
          hours: difference.hours(),
          mins: difference.minutes(),
          secs: difference.seconds(),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex justify-evenly space-x-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex items-center">
          <div className="flex flex-col items-center">
            {value < 10 ? (
              <div className="flex items-center">
                <div className=" py-0 px-1 flex items-center justify-center rounded-md ">
                  <p className="text-black text-lg font-bold">{'0'}</p>
                </div>
                <div className=" py-0 px-1 flex items-center justify-center rounded-md ">
                  <span className="text-black text-lg font-bold">{value}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className=" py-0 px-1 flex items-center justify-center rounded-md ">
                  <span className="text-black text-lg font-bold">{value.toString()[0]}</span>
                </div>
                <div className=" py-0 px-1 flex items-center justify-center rounded-md ">
                  <span className="text-black text-lg font-bold">{value.toString()[1]}</span>
                </div>
              </div>
            )}
            <span className="text-xs mt-1 uppercase font-semibold">{unit}</span>
          </div>
          {unit != 'secs' && <span className="text-lg font-extrabold mb-2">:</span>}
        </div>
      ))}
    </div>
  );
};

export { CountDownTimer };
