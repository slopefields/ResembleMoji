import { game } from './utils.js';

class UiClass
{
    /* Screens */
    allScreens;
    mainScreen;
    gameScreen;

    statusElement;
    countdownElement;
    timerElement;
    predictionsDiv;
    expressionsDiv;

    constructor()
    {
        this.allScreens = document.querySelectorAll('.screen');
        this.mainScreen = document.getElementById('main-container');
        this.gameScreen = document.getElementById('game-container');

        this.statusElement = document.getElementById('status');
        this.countdownElement = document.getElementById('countdown');
        this.timerElement = document.getElementById('timer');
        this.predictionsDiv = document.getElementById('object-predictions');
        this.expressionsDiv = document.getElementById('expression-predictions');
    }

    showMainScreen()
    {
        this.allScreens.forEach(screen => {
            screen.classList.remove("active")
        })
        this.mainScreen.classList.add("active");
    }

    showGameScreen()
    {
        this.allScreens.forEach(screen => {
            console.log("removed active for", screen);
            screen.classList.remove("active");
        })
        this.gameScreen.classList.add("active");
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