/* ========= DOM-OPSLAG & INITIALISERING ========= */
const resultsEl = document.getElementById("results");
const searchInput = document.getElementById("search-input");
const maxPriceField = document.getElementById("max-price");
const maxPriceOutput = document.getElementById("max-price-output");
const searchBtn = document.getElementById("search-btn");
const viewToggle = document.getElementById("view-toggle");

let dishes = [];
let viewMode = "list";

const gridIcon = `<i class="fa fa-th"></i>`;
const listIcon = `<i class="fa fa-list"></i>`;

/* ========= RENDERING AF RESULTATER ========= */
function renderResults(filteredDishes) {
  if (filteredDishes.length) {
    if (viewMode === "grid") {
      resultsEl.innerHTML =
        `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">` +
        filteredDishes
          .map(dish => {
            const icons =
              (dish.vegansk ? `<i class="fa fa-leaf text-green-500 ml-1"></i>` : "") +
              (dish.glutenfri ? `<i class="fa fa-bread-slice text-yellow-500 ml-1"></i>` : "");
            return `
          <button onclick="window.location.href='dish.html?id=${dish.id}'" class="w-full text-left bg-white rounded-lg shadow p-4 flex flex-col relative focus:outline-none hover:shadow-lg">
            <img src="${dish.image ? dish.image : 'img/No_Image_Available.jpg'}" alt="${dish.name}" class="h-32 w-32 object-cover mb-2 rounded">
            <h3 class="text-xl font-bold mb-2">${dish.name} - ${dish.price} kr</h3>
            <div class="absolute top-0 right-0 mt-2 mr-4">${icons}</div>
            <p class="text-sm text-gray-500">Opskrift for ${dish.servings} personer</p>
            <p class="text-gray-600 mb-4">${dish.description}</p>
          </button>`;
          })
          .join('') +
        `</div>`;
    } else {
      resultsEl.innerHTML =
        `<div class="flex flex-col gap-4">` +
        filteredDishes
          .map(dish => {
            const icons =
              (dish.vegansk ? `<i class="fa fa-leaf text-green-500"></i>` : "") +
              (dish.glutenfri ? `<i class="fa fa-bread-slice text-yellow-500"></i>` : "");
            return `
          <button onclick="window.location.href='dish.html?id=${dish.id}'" class="w-full text-left bg-white rounded-lg shadow p-4 flex items-center relative focus:outline-none hover:shadow-lg">
            <img src="${dish.image ? dish.image : 'img/No_Image_Available.jpg'}" alt="${dish.name}" class="h-32 w-32 object-cover mr-4 rounded">
            <div class="flex-grow">
              <h3 class="text-xl font-bold mb-2">${dish.name} - ${dish.price} kr</h3>
              <p class="text-sm text-gray-500">Opskrift for ${dish.servings} personer</p>
              <p class="text-gray-600">${dish.description}</p>
            </div>
            <div class="absolute top-0 right-0 mt-2 mr-4">${icons}</div>
          </button>`;
          })
          .join('') +
        `</div>`;
    }
  } else {
    resultsEl.innerHTML = `<p class="p-2 text-center">Ingen ret fundet.</p>`;
  }
}

/* ========= DATAHENTNING & FILTERING ========= */
function loadDishes() {
  fetch("json/dishes.json")
    .then(response => response.json())
    .then(data => {
      dishes = data.map((dish, index) => ({ ...dish, id: index + 1 }));
      dishes.sort((a, b) => a.name.localeCompare(b.name));
      renderResults(dishes);
    })
    .catch(error => console.error("Fejl ved henting af data:", error));
}

function updateResults() {
  const query = searchInput.value.trim().toLowerCase();
  const maxPrice = maxPriceField.value ? parseInt(maxPriceField.value, 10) : Infinity;
  const diet = document.getElementById("diet-filter").value;

  const filtered = dishes
    .filter(dish => {
      const matchesQuery =
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query);
      let matchesDiet = true;
      if (diet === "vegansk") {
        matchesDiet = dish.vegansk;
      } else if (diet === "glutenfri") {
        matchesDiet = dish.glutenfri;
      }
      const matchesPrice = parseInt(dish.price, 10) <= maxPrice;
      return matchesQuery && matchesDiet && matchesPrice;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  renderResults(filtered);
}

/* ========= EVENT LISTENERS ========= */
searchBtn.addEventListener("click", updateResults);

maxPriceField.addEventListener("input", () => {
  const sliderValue = maxPriceField.value;
  maxPriceOutput.textContent = sliderValue + " kr";
  updateResults();
});

document.getElementById("diet-filter").addEventListener("change", updateResults);

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    updateResults();
  }
});

viewToggle.addEventListener("click", () => {
  viewMode = viewMode === "grid" ? "list" : "grid";
  viewToggle.innerHTML = viewMode === "grid" ? listIcon : gridIcon;
  updateResults();
});

viewToggle.innerHTML = gridIcon;

window.addEventListener("load", loadDishes);
