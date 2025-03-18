export const VIDEO_PIXELS = 224;

export class Camera
{
    videoElement;

    constructor()
    {
       this.videoElement = document.getElementById('webcam');
    }

    checkWebcamSupport()
    {
        // Check if webcam access is supported
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        {
            console.log("Webcam support valid");
            return true;
        }
        else
        {
            console.error('getUserMedia() not supported by browser');
            return false;
        }
    }

    // Attempt to enable webcam
    async enableWebcam()
    {
        if (!this.videoElement) {
            console.error("Error: videoElement is not defined.");
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            this.videoElement.srcObject = stream;
                
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    console.log("Video metadata loaded!");
                    resolve();
                };
            });
    
            console.log("Webcam is ready!");
        } catch (error) {
            console.error("Error accessing webcam: ", error);
        }
    }
}
