import {addIngreident, selectedIngredients, update} from "./index.js"
import {model} from "./modelSelector.js";
import {createIngredient} from "./index.js"

const suggestions = document.getElementById("suggestion")

export function renderIngredients(suggestedIngredients) {

    console.log("running render ingreidents");

    suggestions.innerHTML = ""



    
    suggestedIngredients.forEach(ingredient => {
        let div = createIngredient("", ingredient)
        suggestions.appendChild(div)
    })


}

const infoElement = document.getElementById("info")



export async function showSuggestions(transformed_data) {

    const sum = transformed_data.reduce((partialSum, a) => partialSum + a, 0)


    if (sum !== 0) {

        const label = model.predict(transformed_data)

        const currentModelDesc = model.model_desc

        const labelInfo = `
          <p>Showing ingredients from LABEL: ${label}</p>
        `;

        infoElement.innerHTML = labelInfo;

        const ingredients =  await fetchIngredients(currentModelDesc, label)

        

        renderIngredients(ingredients)

        setupListernesForIngridents()
    } else {
        renderIngredients([])
    }
}



function setupListernesForIngridents() {
    const ingredientElements = suggestions.querySelectorAll('.ingredient');
    ingredientElements.forEach(element => {
        element.addEventListener('click', (event) => {
            // Handle click event here
            selectedIngredients.add(event.currentTarget.textContent.trim())
            update()
        });
    });
}




async function fetchIngredients(model_desc, label){

    const res = await fetch(`assets/data/${model_desc}/clusters/${label}_unique_ingredients.csv`)

    const csvText = await res.text();

    
    let rows = csvText.split(/\r?\n/);

    rows.shift() // removes first desc row in csv.
    rows = rows.filter(row => !selectedIngredients.has(row.split(',')[0]) )    

    return rows.map(row => row.split(',')[0])
}





