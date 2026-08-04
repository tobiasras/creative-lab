import {Birch, GMM, KMeans, availableModels} from './models.js'
import {update} from './index.js'

export let model = {}

const selectorElement = document.getElementById("model-selector")

selectorElement.addEventListener("input", (event) => {
    const model_desc = selectorElement.value
    const data_url = availableModels[model_desc]
    const model_type = model_desc.split('_')[0]


    switch (model_type){
        case "birch":
            model = new Birch(data_url, model_desc)
            break;
        case "gmm":
            model = new GMM(data_url, model_desc)
            break
        case "kmeans":
            model = new KMeans(data_url, model_desc)
            break

        default:
            throw new Error("model not recognized")

    }


    // bad fix, sets time to let models fetch the data needed
    setTimeout(() => {
        update()
    }, 1000);


})



// init load
const model_desc = selectorElement.value
const data_url = availableModels[model_desc]
model = new Birch(data_url, model_desc)


