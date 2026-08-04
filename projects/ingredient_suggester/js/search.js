import {addIngreident} from "./index.js"

const items = [];
export const validIngredientsSet = new Set();

fetch("assets/data/filtered_ingredients.txt")
    .then(response => response.text())
    .then(text => {
        const fetchedItems = text.split('\n').map(word => word.trim()).filter(Boolean);

        fetchedItems.sort((a, b) => a.length - b.length);

        items.push(...fetchedItems);
        fetchedItems.forEach(item => validIngredientsSet.add(item));
    })
    .catch(error => {
        console.error("Failed to fetch ingredients:", error);
    });



export const input = document.getElementById("searchInput");
const dropdown = document.getElementById("dropdown");


input.addEventListener('keypress', (event) => {
      if (event.key === "Enter") {
        addIngreident(input.value)
      }
    });



const element = document.getElementById("add-btn")

element.addEventListener('click', event => {
    addIngreident(input.value)
})


input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    dropdown.innerHTML = "";

    if (query === "") {
        dropdown.style.display = "none";
        return;
    }

    const filtered = items.filter(item =>
        item.toLowerCase().includes(query)
    );

    filtered.forEach(item => {
        const option = document.createElement("div");
        option.textContent = item;
        option.addEventListener("click", () => {
            input.value = item;
            dropdown.innerHTML = "";
            dropdown.style.display = "none";
        });
        dropdown.appendChild(option);
    });

    dropdown.style.display = filtered.length ? "block" : "none";
});

// Optional: hide dropdown when clicking outside
document.addEventListener("click", e => {
    if (!document.querySelector(".input").contains(e.target)) {
        dropdown.style.display = "none";
    }
});