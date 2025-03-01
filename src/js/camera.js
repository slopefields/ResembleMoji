import { enableWebcamButton, captureButton, webcamInput, imageDisplay } from "./script.js";

export const VIDEO_PIXELS = 224;

export class Camera
{
    checkWebcamSupport()
    {
        // Check if webcam access is supported
        if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
        {
            // Allow enable webcam button to be clicked if supported
            enableWebcamButton.addEventListener('click', this.enableWebcam);
            // Allow capture from webcam button to be clicked if supported
            captureButton.addEventListener('click', this.captureFromWebcam);
        }
        else
        {
            alert('getUserMedia() not supported by browser');
        }
    }

    // Attempt to enable webcam
    async enableWebcam()
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

    captureFromWebcam()
    {
        const canvas = document.createElement("canvas");
        canvas.width = webcamInput.videoWidth;
        canvas.height = webcamInput.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(webcamInput, 0, 0, canvas.width, canvas.height);
        imageDisplay.src = canvas.toDataURL("image/png");
    }
}
