
class Model {
    constructor() {}
    predict(recipe){}
    async setup(){}
}




export class Birch extends Model {
    constructor(data_url, model_desc){
        super()

        this.data_url = data_url
        this.model_desc = model_desc
        this.setup().then()
    }

    async setup() {
        const res = await fetch(this.data_url)
        this.centers  = await res.json()
    }

    predict(input_recipe) {
        let minDistance = Infinity;
        let predictedLabel = -1;

        this.centers.forEach((center, idx) => {
            const dist = euclideanDistance(input_recipe, center);
            if (dist < minDistance) {
                minDistance = dist;
                predictedLabel = idx;
            }
        });
        return predictedLabel;
    }


}

/**
 * Works the same way as birch model:
 */
export class KMeans extends Birch {
    constructor(data_url, model_desc) {
        super(data_url, model_desc)
    }
    predict(recipe) {
        return super.predict(recipe);
    }
}


export class GMM extends Model {
    constructor(data_url, model_desc) {
        super();
        this.data_url = data_url
        this.model_desc = model_desc
        this.setup()
    }
    async setup() {
        const res = await fetch(this.data_url)
        this.modelParams  = await res.json()
    }
    predict(recipe) {
        const { means, covariances, weights } = this.modelParams
        const probs = means.map((mean, i) => {
            return weights[i] * gaussianPDF(recipe, mean, covariances[i]);
        });

        const total = probs.reduce((a, b) => a + b, 0);
        
        const normalized = probs.map(p => p / total);

        console.log("Props:")
        let index = 0
        normalized.forEach(val => {
            console.log(index + ":\t" + Number(val).toFixed(8))
            index += 1
        })

        return probs.indexOf(Math.max(...probs));
    }
}



export const availableModels = {
    "birch_1_3": "assets/data/birch_1_3/birch_centers_1_3.json",
    "birch_1_7": "assets/data/birch_1_7/birch_centers_1_7.json",
    "gmm_10": "assets/data/gmm_10/gmm_model.json",
    "kmeans_3": "assets/data/kmeans_3/kmeans_centers.json"
}




// helper functions:

function euclideanDistance(point1, point2) {
    return Math.sqrt(point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0));
}

function gaussianPDF(x, mean, covDiag) {
    const dim = x.length;
    let exponent = 0;
    let det = 1;
    for (let i = 0; i < dim; i++) {
        const diff = x[i] - mean[i];
        exponent += (diff ** 2) / covDiag[i];
        det *= covDiag[i];
    }
    const normConst = 1 / Math.sqrt((2 * Math.PI) ** dim * det);
    return normConst * Math.exp(-0.5 * exponent);
}






