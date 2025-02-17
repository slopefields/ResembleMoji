import {
    FaceDetector,
    FilesetResolver,
    FaceLandmarker
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
    
    const imageUpload = document.getElementById('image-upload');
    const webcamInput =  document.getElementById('webcam');
    const enableWebcamButton = document.getElementById('enable-webcam');
    const captureButton = document.getElementById('capture-button');
    const imageDisplay = document.getElementById('image-display');
    const predictButton = document.getElementById('predict-button');
    const blendshapesList = document.getElementById('blendshapes');
    const predictionsDiv = document.getElementById('mobilenet-predictions');
    const fab = document.getElementById('fab');
    const fabOptions = document.getElementById('fab-options');

    const reader = new FileReader();

    let mobileNetModel;
    let faceDetectionModel;
    let faceLandmarker;

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

    async function loadFaceDetectionModel()
    {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        faceDetectionModel = await FaceDetector.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`
              },
              runningMode: "IMAGE"
            });
    }

    async function loadFaceLandmarker()
    {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        faceLandmarker = await FaceLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
                },
                runningMode: "IMAGE",
                outputFaceBlendshapes: true
            }
        )
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

    function predictUsingFaceDetection()
    {
        const detectionResults = faceDetectionModel.detect(imageDisplay);
        
        if (detectionResults.detections.length > 0)
        {
            const faceDetectionScore = detectionResults.detections[0].categories[0].score;
            console.log("Face detection score: ", faceDetectionScore);
            return faceDetectionScore;
        }
        return 0;
    }

    function predictUsingFaceLandmarker(landmarkerResults)
    {
        const blendshapeList = landmarkerResults.faceBlendshapes[0].categories;
        console.log(blendshapeList);

        for (let i = 0; i < blendshapeList.length; i++)
        {
            const li = document.createElement('li');
            const currentBlendshape = blendshapeList[i];
            li.appendChild(document.createTextNode(`${currentBlendshape.categoryName}: Score: ${currentBlendshape.score.toFixed(10)}`));
            blendshapesList.appendChild(li);
        }
    }

    async function predictUsingMobileNet()
    {
        const predictions = await mobileNetModel.classify(imageDisplay);
        console.log(predictions);
        displayMobileNetPredictions(predictions);
    }

    function clearResults()
    {
        // Reset MobileNet and Landmarker predictions
        predictionsDiv.innerHTML = "";
        blendshapesList.innerHTML = "";
    }

    fab.addEventListener('click', () => {
        console.log("flex");
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

        const landmarkerResults = faceLandmarker.detect(imageDisplay);
        // If Landmarker was able to analyze blendshapes
        if (landmarkerResults.faceBlendshapes.length > 0) 
        {
            console.log("Face blendshapes detected!");
            predictUsingFaceLandmarker(landmarkerResults);
        }
        else
        {
            predictUsingMobileNet();
        }
    });

    document.addEventListener("DOMContentLoaded", () =>
    {
        loadFaceDetectionModel();
        loadFaceLandmarker();
        loadMobileNetModel();
    });