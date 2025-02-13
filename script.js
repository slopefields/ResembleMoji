import {
    FaceDetector,
    FilesetResolver,
    FaceLandmarker
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
    
    const imageUpload = document.getElementById('imageUpload');
    const imageDisplay = document.getElementById('imageDisplay');
    const predictButton = document.getElementById('predictButton');
    const blendshapesList = document.getElementById('blendshapes');

    const reader = new FileReader();

    let mobileNetModel;
    let faceDetectionModel;
    let faceLandmarker;

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
        mobileNetModel = await mobilenet.load();
        console.log("MobileNet model successfully loaded");
    };

    function displayPredictions(predictions)
    {
        const predictionsDiv = document.getElementById('mobilenet-predictions');
        predictionsDiv.innerHTML = "";

        predictions.forEach(prediction => {
            const temp = document.createElement('p');
            temp.textContent = `${prediction.className} : ${(prediction.probability * 100).toFixed(2)}%`;
            predictionsDiv.appendChild(temp);
        });
    }

    function predictUsingFaceDetection()
    {
        let detectionResults = faceDetectionModel.detect(imageDisplay);
        
        if (detectionResults.detections.length > 0)
        {
            let faceDetectionScore = detectionResults.detections[0].categories[0].score;
            console.log("Face detection score: ", faceDetectionScore);
            return faceDetectionScore;
        }
        return 0;
    }

    function predictUsingFaceLandmarker()
    {
        let landmarkerResults = faceLandmarker.detect(imageDisplay);
        const blendshapeList = landmarkerResults.faceBlendshapes[0].categories;
        console.log(blendshapeList);

        for (let i = 0; i < blendshapeList.length; i++)
        {
            let li = document.createElement('li');
            let score = blendshapeList[i].score;
            li.appendChild(document.createTextNode(`${blendshapeList[i].categoryName}: Score: ${score.toFixed(10)}`));
            blendshapesList.appendChild(li);
        }
    }

    async function predictUsingMobileNet()
    {
        const predictions = await mobileNetModel.classify(imageDisplay);
        console.log(predictions);
        displayPredictions(predictions);
    }

    imageUpload.addEventListener('change', function()
    {
        // Get first file (only one image is allowed)
        const file = imageUpload.files[0];
        // If null or undefined, exit function
        if (!file) return;
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
        // If there are no files (length == 0)
        if (!imageUpload.files.length)
        {
            alert('Attach an image first!');
            return;
        }
        else if (!mobileNetModel)
        {
            alert('MobileNet model still loading. Try again later.');
            return;
        }

        if (predictUsingFaceDetection() > 0.7) 
        {
            console.log("Face detected with over 0.7 confidence");
            predictUsingFaceLandmarker();
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