import { ExpressionModel } from './expression_detection.js';
import { ObjectModel } from './object_detection.js';
import { Camera, VIDEO_PIXELS } from './camera.js';
import { shuffleArray } from './utils.js';
import { EMOJIS_LVL_1, EMOJIS_LVL_2, EMOJIS_LVL_3, EMOJIS_LVL_4, EMOJIS_LVL_5 } from './game_levels.js';
import { ui } from './ui.js';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true});

export class Game
{
    isRunning; 
    cameraPaused;
    expressionModel;
    objectModel;
    camera;
    
    delay;
    countdown;
    timer;
    timerInterval;
    
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
        this.isRunning = false;
        this.cameraPaused = false;
        this.objectModel = new ObjectModel();
        this.expressionModel = new ExpressionModel();
        this.camera = new Camera();

        // 1000 ms for countdown and timer decrement (1 second)
        this.delay = 1000;
        // 3 second beginning countdown
        this.countdown = 3;
        // 20 second beginning timer
        this.timer = 20;

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

    async loadModels() 
    {
        await this.expressionModel.loadFaceExpressionModel();
        await this.objectModel.load();
    }

    async warmupModels()
    {
         // Create a dummy tensor with expected input shape for object detection model
        const dummyImage = tf.zeros([VIDEO_PIXELS, VIDEO_PIXELS, 3]);

        // Run a single prediction each to load models into memory
        await Promise.all([
            this.objectModel.predict(dummyImage),
            this.expressionModel.attemptDetection(canvas)
        ]);

        // Dispose of the dummy tensor to free memory
        dummyImage.dispose();

        console.log("Models warmed up!");
    }

    async makePrediction()
    {
        ui.clearResults();

        if (this.isRunning)
        {
            let pixelsCropped;
            let predictions;

            
            /* Cropping the center of the image, for use in live camera*/
            const videoElement = this.camera.videoElement;
            
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            const detectionWithExpressions = await this.expressionModel.attemptDetection(canvas);
            if (detectionWithExpressions) 
            {
                console.log("Expressions detected!");
                const expressionEmoji = await this.expressionModel.predictExpression(detectionWithExpressions);
                console.log(`Predicted emoji: ${expressionEmoji}`);
                ui.displayExpressionPredictions(detectionWithExpressions.expressions);
                this.checkExpressionMatch(detectionWithExpressions.expressions);
            }
            else
            {
                /* Prevent memory leak with tidy */
                const results = tf.tidy(() => {
                    // TODO: Figure out whatever browser is
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

                /* Get top two results */
                const topK = this.objectModel.getTopKClasses(results, 2);
                console.log(topK);
                ui.displayObjectPredictions(topK);
                this.checkObjectMatch(topK[0].label, topK[1].label);
            };
            console.log(tf.memory());
            requestAnimationFrame(() => this.makePrediction());
        };
    }

    checkExpressionMatch(expressions)
    {
        if (this.currentEmoji.name === expressions.name)
        {
            console.log("Expression matched!");
        }
    }

    checkObjectMatch(prediction1, prediction2)
    {
        if (this.currentEmoji.name === prediction1 || this.currentEmoji.name === prediction2)
        {
            this.emojiFound();
        }
    }

    emojiFound()
    {
        this.pauseGame();
        console.log("Match found, with timer of ", this.timer);
        this.progressLevel();
    }

    pauseGame()
    {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    async prepareCamera()
    {
        if (this.camera.checkWebcamSupport()) {
            await this.camera.enableWebcam();
            
            // Wait until the video is actually loaded
            if (this.camera.videoElement.readyState >= 2) {
                console.log("Video is loaded, starting game...");
                this.initGame();
            } else {
                console.error("Error: Video element is not ready.");
            }
        } else {
            console.log("Webcam support invalid");
        }
    }

    async handleGameCountdown()
    {
        while (this.countdown > 0)
        {
            console.log("Countdown: ", this.countdown);
            await new Promise(resolve => setTimeout(resolve, this.delay));
            this.countdown--;
            ui.updateCountdown(this.countdown);
        }
    }

    handleGameTimer()
    {
        if (this.timer > 0) 
        {
            this.timer--;
        }
        else
        {
            /* Stop timer */
            console.error("Timer reached 0, stopping timer...")
            clearInterval(this.timerInterval); 
        }
        console.log("Timer: ", this.timer);
        ui.updateTimer(this.timer);
    }

    async initGame()
    {
        ui.showGameScreen();
        /* Display countdown and timer number */
        ui.updateCountdown(this.countdown);
        ui.updateTimer(this.timer);

        /* Warmup models */
        await this.warmupModels();

        /* Start game countdown */
        await this.handleGameCountdown();

        console.log("Finished countdown! Starting game timer and making predictions...")

        /* Start game once countdown finishes */
        await this.startGame();
    }

    async startGame()
    {
        this.isRunning = true;
        this.makePrediction();
        console.log("Timer: ", this.timer);
        this.timerInterval = window.setInterval(() => {
            this.handleGameTimer();
        }, this.delay);
    }

    progressLevel()
    {
        this.currentLevelIndex++;
        this.currentDifficulty = this.gameDifficulty[this.currentLevelIndex];
        this.currentEmoji = this.levelLookup[this.currentDifficulty].shift();
        console.log("Current emoji, now that level is done: ", this.currentEmoji);
    }
}