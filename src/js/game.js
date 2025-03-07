import { ExpressionModel } from './expression_detection.js';
import { ObjectModel } from './object_detection.js';
import { Camera, VIDEO_PIXELS } from './camera.js';
import { displayExpressionPredictions, displayObjectPredictions, clearResults, shuffleArray } from './script.js';
import { EMOJIS_LVL_1, EMOJIS_LVL_2, EMOJIS_LVL_3, EMOJIS_LVL_4, EMOJIS_LVL_5 } from './game_levels.js';

export class Game
{
    isRunning; 
    cameraPaused;
    expressionModel;
    objectModel;
    camera;
    
    level1;
    level2;
    level3;
    level4;
    level5;
    levelLookup;

    gameDifficulty;
    currentDifficulty;
    currentLevelIndex;

    currentEmoji;

    constructor()
    {
        this.isRunning = true;
        this.cameraPaused = false;
        this.objectModel = new ObjectModel();
        this.expressionModel = new ExpressionModel();
        this.camera = new Camera();

        this.level1 = shuffleArray(EMOJIS_LVL_1);
        this.level2 = shuffleArray(EMOJIS_LVL_2);
        this.level3 = shuffleArray(EMOJIS_LVL_3);
        this.level4 = shuffleArray(EMOJIS_LVL_4);
        this.level5 = shuffleArray(EMOJIS_LVL_5);

        // 12 levels total
        this.gameDifficulty = '112122232345';
        this.currentLevelIndex = 0;
        this.currentDifficulty = this.gameDifficulty[this.currentLevelIndex];

        this.levelLookup = 
        {
            '1': this.level1,
            '2': this.level2,
            '3': this.level3,
            '4': this.level4,
            '5': this.level5
        }

        this.currentEmoji = this.levelLookup[this.currentDifficulty].shift();
        console.log("CURRENT EMOJI: ", this.currentEmoji);
    }

    async loadModels() {
        await this.expressionModel.loadFaceExpressionModel();
        await this.objectModel.load();
    }


    async makePrediction()
    {
        clearResults();

        if (this.isRunning)
        {
            let pixelsCropped;
            let predictions;

            
            /* Cropping the center of the image, for use in live camera*/
            const videoElement = this.camera.videoElement;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const detectionWithExpressions = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceExpressions();
            if (detectionWithExpressions) 
            {
                console.log("Expressions detected!");
                const expressionEmoji = await this.expressionModel.predictExpression(detectionWithExpressions);
                console.log(`Predicted emoji: ${expressionEmoji}`);
                displayExpressionPredictions(detectionWithExpressions.expressions);
            }
            else
            {
                // Prevent memory leak
                const results = tf.tidy(() => {
                    const pixels = tf.browser.fromPixels(canvas);

                    const centerHeight = pixels.shape[0] / 2;
                    const beginHeight = Math.max(0, centerHeight - VIDEO_PIXELS / 2);
                    const centerWidth = pixels.shape[1] / 2;
                    const beginWidth = Math.max(0, centerWidth - VIDEO_PIXELS / 2);
                    pixelsCropped = pixels.slice(
                        [beginHeight, beginWidth, 0],
                        [VIDEO_PIXELS, VIDEO_PIXELS, 3]
                    );
                    
                    predictions = this.objectModel.predict(pixelsCropped);
                    console.log("Predictions:", predictions);
                    return predictions;
                })

                const topK = this.objectModel.getTopKClasses(results, 10);
                console.log(topK);
                displayObjectPredictions(topK);
            };
        };
        console.log(tf.memory())
        requestAnimationFrame(() => this.makePrediction());
    }

    async prepareCamera()
    {
        if (this.camera.checkWebcamSupport()) {
            await this.camera.enableWebcam();
            
            // Wait until the video is actually loaded
            if (this.camera.videoElement.readyState >= 2) {
                console.log("Video is loaded, starting game...");
                this.startGame();
            } else {
                console.error("Error: Video element is not ready.");
            }
        } else {
            console.log("Webcam support invalid");
        }
    }

    startGame()
    {
        this.makePrediction();
    }

    progressLevel()
    {
        this.currentLevelIndex++;
        this.currentDifficulty = this.gameDifficulty[this.currentLevelIndex];
        this.currentEmoji = this.levelLookup[this.currentDifficulty].shift();
        console.log("Current emoji: ", this.currentEmoji);
    }
}