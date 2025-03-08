    import _ from 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm';
    import { Game } from './game.js';

    const imageDisplay = document.getElementById('image-display');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const startButton = document.getElementById('start-button');
   
    const reader = new FileReader();

    let game;

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

    

    export { imageDisplay, enableWebcamButton, captureButton, startButton, shuffleArray, game };
