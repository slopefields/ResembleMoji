/* 
Modified version of mobilenet.ts from github.com/google/emoji-scavenger-hunt/blob/main/src/js/mobilenet.ts
Notable modifications:
- Convert ts to js
- Remove unused JA Language
*/

import { SCAVENGER_CLASSES } from './scavenger_classes.js';

const MODEL_FILE_URL = '/models/scavenger/tensorflowjs_model.pb';
const WEIGHT_MANIFEST_FILE_URL = '/models/scavenger/weights_manifest.json';
const INPUT_NODE_NAME = 'input';
const OUTPUT_NODE_NAME = 'final_result';
const PREPROCESS_DIVIDER_VALUE = tf.scalar(255 / 2);

export class ObjectModel
{
    model;

    async load()
    {
        try
        {
            this.model = await tf.loadFrozenModel(
                MODEL_FILE_URL,
                WEIGHT_MANIFEST_FILE_URL,
            )
            console.log("Scavenger hunt model loaded successfully");
        }
        catch(error)
        {
            console.error("Error loading scavenger hunt model: ", error);
        }
    }

    dispose()
    {
        if (this.model) 
        {
            this.model.dispose();
        }
    }

    predict(inputTensor)
    {
        //console.log("Input tensor received: ", inputTensor);

        const preprocessedInput = tf.div(tf.sub(inputTensor.asType('float32'), PREPROCESS_DIVIDER_VALUE), PREPROCESS_DIVIDER_VALUE);
        //console.log("Preprocessed input: ", preprocessedInput);

        const reshapedInput = preprocessedInput.reshape([1, ...preprocessedInput.shape]);
        //console.log("Reshaped input: ", reshapedInput);

        const inputs = {};
        inputs[INPUT_NODE_NAME] = reshapedInput;

        const output = this.model.execute(inputs, OUTPUT_NODE_NAME);
        //console.log("Model output: ", this.model.execute(inputs, OUTPUT_NODE_NAME));

        return output;
    }

    getTopKClasses(predictions, topK = 3)
    {
        const values = predictions.dataSync();
        predictions.dispose();

        let sortedPredictions = [];
        for (let i = 0; i < values.length; i++)
        {
            sortedPredictions.push({value : values[i], index: i});
        }
        sortedPredictions = sortedPredictions.sort((a,b) => {
            return b.value - a.value;
        }).slice(0, topK);

        return sortedPredictions.map(x => ({
            label: SCAVENGER_CLASSES[x.index],
            confidence: x.value,
        }));
    }
}