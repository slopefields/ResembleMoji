const MODEL_PATH = '/models/face-api';

export class ExpressionModel
{
    async loadFaceExpressionModel()
    {
        try
        {
            // Load all required models from face-api
            await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_PATH);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH);
            console.log("All required models for face expression loaded");
        }
        catch(error)
        {
            console.error("Error loading face-api models: ", error);
        }
    }

    async attemptDetection(image)
    {
        const detectionWithExpressions = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceExpressions();
        return detectionWithExpressions;
    }

    async predictExpression(detectionWithExpressions)
    {
        const expressions = detectionWithExpressions.expressions;
        console.log("expressions: ", expressions);
        for (const key in expressions)
        {
            if (expressions[key] > 0.05)
                console.log(`Detected with over 5% confidence: ${key}, with score of ${expressions[key]}`)
        }
        return this.findExpressionEmoji(expressions);
    }

    findExpressionEmoji(expressions)
    {
        /*
        category names:
        neutral
        happy
        sad
        angry
        fearful
        disgusted
        surprised
        */

        const primaryEmojiMap = {
            angry: "😠",
            disgusted: "🤢",
            fearful: "😨",
            happy: "😃",
            neutral: "😐",
            sad: "😢",
            surprised: "😲"
        }

        let highestScore = 0;
        let highestExpression = '';
        for (const expression in expressions)
        {
            if (expressions[expression] > highestScore)
            {
                highestScore = expressions[expression];
                highestExpression = expression;
            }
        }
        return primaryEmojiMap[highestExpression];
    }
};