import { ExpressionModel } from './expression_detection.js';
import { ObjectModel } from './object_detection.js';
import { Camera, VIDEO_PIXELS } from './camera.js';
import { imageDisplay, displayObjectPredictions, clearResults } from './script.js';

export class Game
{
    isRunning; 
    cameraPaused;
    expressionModel;
    objectModel;
    camera;


    constructor()
    {
        this.isRunning = true;
        this.cameraPaused = false;
        this.objectModel = new ObjectModel();
        this.expressionModel = new ExpressionModel();
        this.camera = new Camera();
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

    async loadModels() {
        await this.expressionModel.loadFaceExpressionModel();
        await this.objectModel.load();
    }

    async startGame()
    {
        if (this.camera.checkWebcamSupport()) {
            console.log("Webcam support valid");
            await this.camera.enableWebcam();
            
            // Wait until the video is actually loaded
            if (this.camera.videoElement.readyState >= 2) {
                console.log("Video is loaded, starting predictions...");
                this.makePrediction();
            } else {
                console.error("Error: Video element is not ready.");
            }
        } else {
            console.log("Webcam support invalid");
        }

        /* Old
        if (this.camera.checkWebcamSupport())
        {
            console.log("Webcam support valid");
            await this.camera.enableWebcam();
            this.makePrediction();
        }
        else
        {
            console.log("Webcam support invalid");
        }
        */
    }
}