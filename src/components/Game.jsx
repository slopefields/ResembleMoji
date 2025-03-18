import * as tfc from "@tensorflow/tfjs-core";

import { useRef, useState, useEffect } from 'react';
import { EMOJIS_LVL_1, EMOJIS_LVL_2, EMOJIS_LVL_3, EMOJIS_LVL_4, EMOJIS_LVL_5 } from '../js/game_levels.js';
import { VIDEO_PIXELS } from "./CameraComponent.jsx";
import shuffle from 'lodash.shuffle';

const Game = ({ videoRef, cameraReady, expressionModel, objectModel }) => {
    // States
    const [gameRunning, setGameRunning] = useState(false);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [currentEmoji, setCurrentEmoji] = useState(null);

    // Constants
    const canvasRef = useRef(document.createElement("canvas"));
    const contextRef = useRef(canvasRef.current.getContext("2d", { willReadFrequently: true }));

    const delay = 1000;
    const gameDifficulty = '112122323445';

    // Levels
    const level1 = useRef(shuffle(EMOJIS_LVL_1));
    const level2 = useRef(shuffle(EMOJIS_LVL_2));
    const level3 = useRef(shuffle(EMOJIS_LVL_3));
    const level4 = useRef(shuffle(EMOJIS_LVL_4));
    const level5 = useRef(shuffle(EMOJIS_LVL_5));
    const levelLookup = useRef({
        '1': level1.current,
        '2': level2.current,
        '3': level3.current,
        '4': level4.current,
        '5': level5.current
    });



    // Runs when readyState >= 2
    useEffect(() => {
        if (cameraReady)
            setGameRunning(true);
    }, [cameraReady]);

    // Set new emoji every time currentLevelIndex changes
    useEffect(() => {
        setCurrentEmoji(levelLookup.current[gameDifficulty[currentLevelIndex]].shift());
    }, [currentLevelIndex]);

    // Makes prediction everytime videoRef is updated
    useEffect(() => {
        if (!gameRunning) {
            return;
        }

        let animationFrameId;

        const makePrediction = async () => {
            console.log("Making prediction");
            const videoElement = videoRef.current;
            if (!videoElement)
                return;
            const canvas = canvasRef.current;
            const context = contextRef.current;

            if (!canvas)
                console.error("Canvas is undefined!");

            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const detectionWithExpressions = await expressionModel.attemptDetection(canvas);
            if (detectionWithExpressions) {
                console.log("Expressions detected!");
                const expressionEmoji = await expressionModel.predictExpression(detectionWithExpressions);
                console.log(`Predicted emoji: ${expressionEmoji}`);
                // TODO: Display the predicted emoji and check expression match for game
            }
            else {
                // ELSE: use object detection model
                const results = tfc.tidy(() => {
                    const pixels = tfc.fromPixels(canvas);

                    const centerHeight = pixels.shape[0] / 2;
                    const beginHeight = Math.max(0, centerHeight - VIDEO_PIXELS / 2);
                    const centerWidth = pixels.shape[1] / 2;
                    const beginWidth = Math.max(0, centerWidth - VIDEO_PIXELS / 2);
                    const pixelsCropped = pixels.slice(
                        [beginHeight, beginWidth, 0],
                        [VIDEO_PIXELS, VIDEO_PIXELS, 3]
                    );

                    const predictions = objectModel.predict(pixelsCropped);
                    console.log("Predictions:", predictions);
                    return predictions;
                });
                const topK = objectModel.getTopKClasses(results, 2);
                console.log(topK);
                // TODO: Display topK predictions and check object match for game
            };
            console.log(tfc.memory());
        }

        // TODO: Figure out what this is and why it works
        const loop = async () => {
            await makePrediction();
            animationFrameId = requestAnimationFrame(loop);
        }

        // TODO: figure out why this works
        animationFrameId = requestAnimationFrame(loop);

        // Cleanup canvas and context
        return () => {
            // TODO: Actually clean predictions
            // TODO: figure out why this works

            cancelAnimationFrame(animationFrameId);
            console.log("Stopped animation frame loop");
        };
    }, [gameRunning, videoRef]);

    return (
        <div>
            <p>Game in session!</p>
        </div>
    );
}



export default Game;