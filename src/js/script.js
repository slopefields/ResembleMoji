    import { Game } from './game.js';
   
    const imageUpload = document.getElementById('image-upload');
    const imageDisplay = document.getElementById('image-display');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const predictButton = document.getElementById('predict-button');
    const predictionsDiv = document.getElementById('object-predictions');
    const expressionsDiv = document.getElementById('expression-predictions');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');
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

    function clearResults()
    {
        // Reset Object and Expression predictions
        predictionsDiv.innerHTML = "";
        expressionsDiv.innerHTML = "";
    }

    fab.addEventListener('click', () => {
        fabOptions.style.display = fabOptions.style.display === 'flex' ? 'none' : 'flex';
    });

    imageUpload.addEventListener('change', function()
    {
        // Get first file (only one image is allowed)
        const file = imageUpload.files[0];
        // If null or undefined, exit function
        if (!file) return;

        imageDisplay.classList.remove("hidden");
        game.camera.videoElement.classList.add("hidden");

        // Read file as a Data URL so it can be used as the source for the <img> tag
        reader.readAsDataURL(file);
    });

    reader.addEventListener("load", () =>
    {
        // Change imageDisplay's src to the file data, or Data URL (only happens after readAsDataURL is loaded)
        imageDisplay.src = reader.result;
    });

    predictButton.addEventListener('click', async function()
    {
        // Clear previous predictions before generating new ones
        clearResults();

        console.log("Predict button clicked");

        // Check for image attachment (either picture or webcam capture)
        if (!imageDisplay.src)
        {
            alert('Attach an image first!');
            return;
        }
        else if (!game.objectModel)
        {
            alert('Object detection model still loading. Try again later.');
            return;
        }
        else if (!game.expressionModel)
        {
            alert('Expression detection model still loading. Try again later.');
            return;
        }
        console.log("Trying to make prediction");
        await game.makePrediction();
    });

    startButton.addEventListener('click', () => {
        game.startGame();
    });

    document.addEventListener("DOMContentLoaded", async () =>
    {
        game = new Game();

        await game.loadModels(); 
        console.log("All models loaded from script.js")  
    });

    

    export { imageUpload, imageDisplay, enableWebcamButton, captureButton, 
        predictButton, predictionsDiv, expressionsDiv, fab, fabOptions, startButton, 
        displayObjectPredictions, clearResults };
