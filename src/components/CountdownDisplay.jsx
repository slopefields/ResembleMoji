import { useState, useEffect } from 'react';

const CountdownDisplay = ({ startCountdown, initialCount, delay, setCountdownFinished }) => {
    const [countdown, setCountdown] = useState(initialCount);

    useEffect(() => {
        if (!startCountdown || countdown <= 0)
            return;

        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                return prev - 1;
            });
        }, delay);

        return () => clearInterval(countdownInterval);
    }, [startCountdown]);

    useEffect(() => {
        if (countdown === 0) {
            setCountdownFinished();
            console.log("Finished countdown!!!");
        }
    }, [countdown]);

    return (
        <>
            <div id="countdown">Countdown: {countdown}</div>
        </>
    );
}

export default CountdownDisplay;