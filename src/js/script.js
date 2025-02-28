    import { ExpressionModel } from './expression_detection.js';
   
   const imageUpload = document.getElementById('image-upload');
    const webcamInput =  document.getElementById('webcam');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const imageDisplay = document.getElementById('image-display');
    const predictButton = document.getElementById('predict-button');
    const predictionsDiv = document.getElementById('mobilenet-predictions');
    const expressionsDiv = document.getElementById('expression-predictions');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');

    const reader = new FileReader();

    let mobileNetModel;
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

    async function loadMobileNetModel()
    {
        console.log("Awaiting MobileNet model loading...");
        mobileNetModel = await mobilenet.load();
        console.log("MobileNet model successfully loaded");
    };

    function displayMobileNetPredictions(predictions)
    {
        predictions.forEach(prediction => {
            const temp = document.createElement('p');
            temp.textContent = `${prediction.className} : ${(prediction.probability * 100).toFixed(2)}%`;
            predictionsDiv.appendChild(temp);
        });
    }

    async function predictUsingMobileNet()
    {
        const predictions = await mobileNetModel.classify(imageDisplay);
        console.log(predictions);
        displayMobileNetPredictions(predictions);
        console.log(findObjectEmoji(predictions));
    }

    function clearResults()
    {
        // Reset MobileNet and Expression predictions
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
        else if (!mobileNetModel)
        {
            alert('MobileNet model still loading. Try again later.');
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
            predictUsingMobileNet();
        }
    });

    document.addEventListener("DOMContentLoaded", () =>
    {
        loadMobileNetModel();
        expressionModel.loadFaceExpressionModel();
    });