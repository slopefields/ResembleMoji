    import { ExpressionModel } from './expression_detection.js';
    import { ObjectModel } from './object_detection.js';
   
   const imageUpload = document.getElementById('image-upload');
    const webcamInput =  document.getElementById('webcam');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const imageDisplay = document.getElementById('image-display');
    const predictButton = document.getElementById('predict-button');
    const predictionsDiv = document.getElementById('object-predictions');
    const expressionsDiv = document.getElementById('expression-predictions');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');

    const reader = new FileReader();

    let objectModel = new ObjectModel();
    let expressionModel = new ExpressionModel();

    // Check if webcam access is supported
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
    {
        // Allow enable webcam button to be clicked if supported
        enableWebcamButton.addEventListener('click', enableWebcam);
        // Allow capture from webcam button to be clicked if supported
        captureButton.addEventListener('click', captureFromWebcam);
    }
    else
    {
        alert('getUserMedia() not supported by browser');
    }

    // Attempt to enable webcam
    async function enableWebcam()
    {
        webcamInput.classList.remove("hidden");
        imageDisplay.classList.add("hidden");

        try
        {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            webcamInput.srcObject = stream;
        }
        catch(error)
        {
            console.error("Error accessing webcam: ", error);
        }
    }

    function captureFromWebcam()
    {
        const canvas = document.createElement("canvas");
        canvas.width = webcamInput.videoWidth;
        canvas.height = webcamInput.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(webcamInput, 0, 0, canvas.width, canvas.height);
        imageDisplay.src = canvas.toDataURL("image/png");
    }

    function displayObjectPredictions(predictions)
    {
        predictions.forEach(prediction => {
            const temp = document.createElement('p');
            temp.textContent = `${prediction.className} : ${(prediction.probability * 100).toFixed(2)}%`;
            predictionsDiv.appendChild(temp);
        });
    }

    function clearResults()
    {
        // Reset Object and Expression predictions
        predictionsDiv.innerHTML = "";
        expressionsDiv.innerHTML = "";
    }

    function findObjectEmoji(predictions)
    {
        predictions.forEach(prediction => {
            
        });
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
        webcamInput.classList.add("hidden");

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

        // Check for image attachment (either picture or webcam capture)
        if (!imageDisplay.src)
        {
            alert('Attach an image first!');
            return;
        }
        else if (!objectModel)
        {
            alert('Object detection model still loading. Try again later.');
            return;
        }

        const detectionWithExpressions = await faceapi.detectSingleFace(imageDisplay).withFaceLandmarks().withFaceExpressions();
        if (detectionWithExpressions) 
        {
            console.log("Expressions detected!");
            const expressionEmoji = await expressionModel.predictExpression(detectionWithExpressions);
            console.log(`Predicted emoji: ${expressionEmoji}`);
        }
        else
        {
            const VIDEO_PIXELS = 224;
            const image = new Image();
            image.src = imageDisplay.src;
            image.onload = async () => {
                console.log("Image loaded:", image.width, image.height);
                
                // Process the image once it's fully loaded
                const pixels = tf.browser.fromPixels(image);
                
                /* Cropping the center of the image, for use in live camera*/
                /*
                const centerHeight = pixels.shape[0] / 2
                const beginHeight = Math.max(0, centerHeight - VIDEO_PIXELS / 2);
                const centerWidth = pixels.shape[1] / 2;
                const beginWidth = Math.max(0, centerWidth - VIDEO_PIXELS / 2);
                const pixelsCropped = pixels.slice(
                    [beginHeight, beginWidth, 0],
                    [VIDEO_PIXELS, VIDEO_PIXELS, 3]
                );
                */
               
                /* Resize image into 224x224, for use in static images */
                const pixelsCropped = tf.image.resizeBilinear(pixels, [VIDEO_PIXELS, VIDEO_PIXELS]);
            
                console.log("Tensor created:", pixelsCropped);
                
            
                try {
                    console.log("Calling model prediction...");
                    console.log("Tensor shape:", pixelsCropped.shape);
                    const predictions = await objectModel.predict(pixelsCropped);
                    console.log("Predictions:", predictions);

                    const topK = objectModel.getTopKClasses(predictions, 10);
                    console.log(topK);
                } catch (error) {
                    console.error("Prediction error:", error);
                }

                
            };
        };
    });

    document.addEventListener("DOMContentLoaded", async () =>
    {
        console.log("Loading models...");
        await objectModel.load();
        await expressionModel.loadFaceExpressionModel();
    });