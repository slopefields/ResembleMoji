async function loadFaceExpressionModel()
{
    // Load all required models from face-api
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/face-api');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face-api');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models/face-api');
    console.log("All required APIs for face expression loaded");
}

async function predictExpression(detectionWithExpressions)
{
    const expressions = detectionWithExpressions.expressions;
    console.log("expressions: ", expressions);
    for (const key in expressions)
    {
        if (expressions[key] > 0.05)
            console.log(`Detected with over 5% confidence: ${key}, with score of ${expressions[key]}`)
    }
    return findExpressionEmoji(expressions);
}

function findExpressionEmoji(expressions)
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
};

export {loadFaceExpressionModel, predictExpression, findExpressionEmoji};