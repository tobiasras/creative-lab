import {validIngredientsSet} from "./search.js";
import "./suggestions.js"
import {transform} from "./data.js"
import {model} from "./modelSelector.js"
import {showSuggestions} from "./suggestions.js";



document.getElementById("reload").addEventListener('click', ev => {
    update()
})

export function update () {
    renderIngredients()
    const selectedIngredientsArray = Array.from(selectedIngredients);


    let selectedIngredientsTransformed = []
    try {
        selectedIngredientsTransformed = transform(selectedIngredientsArray)
    } catch (error){
        console.log(error);
    }

    showSuggestions(selectedIngredientsTransformed)
}




export function addIngreident(ingrident) {
    selectedIngredients.add(ingrident.toLowerCase())
    update()
}


export const selectedIngredients = new Set();


const ingredientContainer = document.getElementById("current-ingredients")

function renderIngredients() {
    ingredientContainer.innerHTML = ""
    selectedIngredients.forEach(ingredient => {
        let div = createIngredient("current", ingredient)
        ingredientContainer.appendChild(div)
    })

    setupListernesForIngridents()
} 

export function createIngredient(type, ingreidentText) {
    let className = ""

    if (!validIngredientsSet.has(ingreidentText)) {
        className = "ingredient error"
    } else {
        className = type === "current" ? "ingredient dark" : "ingredient light"
    }

    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = `<p>${ingreidentText}</p>`;
    return div
}







function setupListernesForIngridents() {
    const ingredientElements = ingredientContainer.querySelectorAll('.ingredient');
    ingredientElements.forEach(element => {
        element.addEventListener('click', (event) => {
            // Handle click event here
            selectedIngredients.delete(event.currentTarget.textContent.trim())
            update()
        });
    });
}






update()