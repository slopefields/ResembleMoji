import * as tfc from "@tensorflow/tfjs-core";

import { useRef, useState, useEffect } from 'react';
import { ExpressionModel } from "./js/expression_detection";
import { ObjectModel } from "./js/object_detection";
import { VIDEO_PIXELS } from "./components/CameraComponent";

import Header from './components/Header';
import Camera from './components/CameraComponent';
import CountdownDisplay from './components/CountdownDisplay';
import TimerDisplay from './components/TimerDisplay';
import Game from './components/Game.jsx';

function App() {
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const expressionModel = useRef(null);
  const objectModel = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const handleCountdownFinished = () => {
    setGameState('playing');
  };

  const handleTimerFinished = () => {
    setGameState('finished');
  };

  useEffect(() => {
    if (gameState === 'loadingCamera' && cameraReady) {
      setGameState('countdown');
    }
  }, [gameState, cameraReady]);

  useEffect(() => {
    const loadModels = async () => {
      console.log("Loading models in App.jsx...");
      expressionModel.current = new ExpressionModel();
      objectModel.current = new ObjectModel();

      await expressionModel.current.loadFaceExpressionModel();
      console.log("Expression model loaded");
      await objectModel.current.load();
      console.log("Object model loaded");

      // Warms up both models
      console.log("Warming up models...");
      // Create a dummy tensor with expected input shape for object detection model
      const dummyImage = tfc.zeros([VIDEO_PIXELS, VIDEO_PIXELS, 3]);
      await Promise.all([
        objectModel.current.predict(dummyImage),
        expressionModel.current.attemptDetection(document.createElement("canvas"))
      ]);
      dummyImage.dispose();
      console.log("Models warmed up!");

      setModelsLoaded(true);
    }
    loadModels();
  }, []);

  return (
    <div>
      <Header />

      {/* Menu */}
      {gameState === 'menu' && (
        <button onClick={() => setGameState('loadingCamera')}>Start</button>
      )}

      {/* Camera Loading/Countdown/Playing */}
      {(gameState === 'loadingCamera' || gameState === 'countdown' || gameState === 'playing') && (
        <>
          {gameState === 'loadingCamera' && <p>Preparing camera...</p>}
          <Camera gameState={gameState} videoRef={videoRef} setCameraReady={setCameraReady} />
        </>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && (
        <CountdownDisplay
          startCountdown={true}
          initialCount={3}
          delay={1000}
          setCountdownFinished={handleCountdownFinished}
        />
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <>
          <Game
            videoRef={videoRef}
            cameraReady={cameraReady}
            expressionModel={expressionModel.current}
            objectModel={objectModel.current} />
          <TimerDisplay
            startTimer={true}
            initialTimer={30}
            delay={1000}
            setTimerFinished={handleTimerFinished}
          />
        </>
      )}

      {/* Timer over */}
      {gameState === 'finished' && (
        // TODO: Handle game over logic
        <p>Game Finished</p>
      )}

    </div>
  );
}

export default App;