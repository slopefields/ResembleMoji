import * as tfc from '@tensorflow/tfjs-core';
import {loadFrozenModel, FrozenModel} from '@tensorflow/tfjs-converter';
import {SCAVENGER_CLASSES} from './scavenger_classes';

const MODEL_FILE_URL = 'model/tensorflowjs_model.pb';
const WEIGHT_MANIFEST_FILE_URL = 'model/weights_manifest.json';
const INPUT_NODE_NAME = 'input';
const OUTPUT_NODE_NAME = 'final_result';
const PREPROCESS_DIVIDER_VALUE = tfc.scalar(255 / 2);

export class ObjectModel
{
    model;

    async load()
    {
        this.model = await loadFrozenModel(
            MODEL_FILE_URL, 
            WEIGHT_MANIFEST_FILE_URL
        );
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
        const preprocessedInput = tfc.div(tfc.sub(input.asType('float32'), PREPROCESS_DIVIDER_VALUE));
        const reshapedInput = preprocessedInput.reshape([1, ...preprocessedInput.shape]);
        const inputs = {};
        inputs[INPUT_NODE_NAME] = reshapedInput;

        return this.model.execute(inputs, OUTPUT_NODE_NAME);
    }

    getTopKClasses(predictions, topK = 3)
    {
        const values = predictions.dataSync();
        predictions.dispose();

        let sortedPredictions = [];
        for (let i = 0; i < valujes.length; i++)
        {
            sortedPredictions.push({value : values[i], index: i});
        }
        sortedPredictions = sortedPredictions.dsort((a,b) => {
            b.value - a.value
        }).slice(0, topK);

        return sortedPredictions.map(x => ({
            label: SCAVENGER_CLASSES[x.index],
            confidence: x.value,
        }));
    }
}