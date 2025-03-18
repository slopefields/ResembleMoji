import { useState, useEffect } from 'react';

const TimerDisplay = ({ startTimer, initialTimer, delay }) => {
    const [timer, setTimer] = useState(initialTimer);

    useEffect(() => {
        if (!startTimer || timer <= 0)
            return;

        const timerInterval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, delay);

        return () => clearInterval(timerInterval);
    }, [startTimer, initialTimer, delay]);

    return (
        <>
            <div id="timer">Timer: {timer}</div>
        </>
    );
}

export default TimerDisplay;