import { useEffect } from 'react';

export const VIDEO_PIXELS = 224;

const CameraComponent = ({ gameState, videoRef, setCameraReady }) => {
    useEffect(() => {
        const videoElement = videoRef.current;

        const enableWebcam = async () => {
            if (!videoElement) {
                console.error("Error: videoElement is not defined.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                videoElement.srcObject = stream;

                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = () => {
                        console.log("Video metadata loaded!");
                        if (videoElement.readyState >= 2) {
                            console.log("Ready state >= 2!");
                            setCameraReady(true);
                        }
                        resolve();
                    };
                });

                console.log("Webcam is ready!");
            } catch (error) {
                console.error("Error accessing webcam: ", error);
            }
        }
        enableWebcam();


        // Cleanup
        return () => {
            if (videoElement && videoElement.srcObject) {
                const stream = videoElement.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoElement.srcObject = null;
            }
        }
    }, []);

    return (
        <>
            <video id="webcam" ref={videoRef} autoPlay playsInline />
        </>
    );
}

export default CameraComponent;