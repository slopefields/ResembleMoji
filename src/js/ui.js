import { game } from './script.js';

class UiClass
{
    statusElement;
    countdownElement;
    timerElement;
    predictionsDiv;
    expressionsDiv;

    constructor()
    {
        this.statusElement = document.getElementById('status');
        this.countdownElement = document.getElementById('countdown');
        this.timerElement = document.getElementById('timer');
        this.predictionsDiv = document.getElementById('object-predictions');
        this.expressionsDiv = document.getElementById('expression-predictions');
    }

    displayObjectPredictions(predictions)
    {
        predictions.forEach(prediction => {
            const temp = document.createElement('p');
            temp.textContent = `${prediction.label} : ${(prediction.confidence * 100).toFixed(2)}%`;
            this.predictionsDiv.appendChild(temp);
        });
    }

    displayExpressionPredictions(predictions)
    {
        let temp;
        for (let emotion in predictions)
        {
            if (predictions.hasOwnProperty(emotion))
            {
                temp = document.createElement('p');
                temp.textContent = `${emotion} : ${(predictions[emotion] * 100).toFixed(2)}%`;
                this.expressionsDiv.appendChild(temp);
            }
        }
        temp.textContent = `Emoji: ${game.expressionModel.findExpressionEmoji(predictions)}`
    }

    updateCountdown(countdown)
    {
        this.countdownElement.textContent = countdown;
    }

    updateTimer(timer)
    {
        this.timerElement.textContent = timer;
    }

    clearResults()
    {
        // Reset Object and Expression predictions
        this.predictionsDiv.innerHTML = "";
        this.expressionsDiv.innerHTML = "";
    }
}

export let ui = new UiClass();