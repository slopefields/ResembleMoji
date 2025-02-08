const imageUpload = document.getElementById('imageUpload');
const imageDisplay = document.getElementById('imageDisplay');
const predictButton = document.getElementById('predictButton');

const reader = new FileReader();

let mobileNetModel;
let faceMeshModel;
let faceDetectionModel;

async function loadFaceDetectionModel()
{
    faceDetectionModel = new FaceDetection({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
      }});

      faceDetectionModel.setOptions({
        modelSelection: 0,
        minDetectionConfidence: 0.5,
      });
    
    console.log("MediaPipe Face Detection model successfully loaded");
}

async function loadFaceMeshModel()
{
    faceMeshModel = new FaceMesh({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }});

      faceMeshModel.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
      });
      
    console.log("MediaPipe Face Mesh model successfully loaded");
}

async function loadMobileNetModel()
{
    mobileNetModel = await mobilenet.load();
    console.log("MobileNet model successfully loaded");
};

function displayPredictions(predictions)
{
    const predictionsDiv = document.getElementById('predictions');
    predictionsDiv.innerHTML = "";

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
    }
    else if (!mobileNetModel)
    {
        alert('MobileNet model still loading. Try again later.');
    }
    else
    {
        predictUsingMobileNet();
    }
    
});

document.addEventListener("DOMContentLoaded", () =>
{
    loadFaceDetectionModel();
    loadFaceMeshModel();
    loadMobileNetModel();
});