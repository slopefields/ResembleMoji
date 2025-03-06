    import { Game } from './game.js';
    import _ from 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm';

    const imageDisplay = document.getElementById('image-display');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const predictionsDiv = document.getElementById('object-predictions');
    const expressionsDiv = document.getElementById('expression-predictions');
    const startButton = document.getElementById('start-button');

    const reader = new FileReader();
    let game;

    function displayObjectPredictions(predictions)
    {
        predictions.forEach(prediction => {
            const temp = document.createElement('p');
            temp.textContent = `${prediction.label} : ${(prediction.confidence * 100).toFixed(2)}%`;
            predictionsDiv.appendChild(temp);
        });
    }

    function displayExpressionPredictions(predictions)
    {
        let temp;
        for (let emotion in predictions)
        {
            if (predictions.hasOwnProperty(emotion))
            {
                temp = document.createElement('p');
                temp.textContent = `${emotion} : ${(predictions[emotion] * 100).toFixed(2)}%`;
                expressionsDiv.appendChild(temp);
            }
        }
        temp.textContent = `Emoji: ${game.expressionModel.findExpressionEmoji(predictions)}`
    }

    function clearResults()
    {
        // Reset Object and Expression predictions
        predictionsDiv.innerHTML = "";
        expressionsDiv.innerHTML = "";
    }

    function shuffleArray(array)
    {
        return _.shuffle(array);
    }

    reader.addEventListener("load", () =>
    {
        // Change imageDisplay's src to the file data, or Data URL (only happens after readAsDataURL is loaded)
        imageDisplay.src = reader.result;
    });

    startButton.addEventListener('click', () => {
        game.prepareCamera();
    });

    document.addEventListener("DOMContentLoaded", async () =>
    {
        game = new Game();

        await game.loadModels(); 
        console.log("All models loaded from script.js")  
    });

    

    export { imageDisplay, enableWebcamButton, captureButton, 
        predictionsDiv, expressionsDiv, startButton, 
        displayObjectPredictions, displayExpressionPredictions, clearResults, shuffleArray };
