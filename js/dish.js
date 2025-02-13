/* ========= Hent URL-parametre og referencer til DOM-elementer ========= */
const params = new URLSearchParams(window.location.search);
const dishId = params.get('id');
const container = document.getElementById("dish-details");

/* ========= Hvis en ret er valgt, så hent og vis data ========= */
if (dishId) {
  fetch("json/dishes.json")
    .then(response => response.json())
    .then(data => {
      const dishesWithId = data.map((dish, index) => ({
        ...dish,
        id: (index + 1).toString()
      }));
      const dish = dishesWithId.find(item => item.id === dishId);

      if (dish) {
        container.innerHTML = `
          <button onclick="window.print()" class="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <i class="fa fa-print"></i>
          </button>
          <div class="flex items-start">
            <div class="mr-4">
              <img src="${dish.image ? dish.image : 'img/No_Image_Available.jpg'}" alt="${dish.name}" class="h-64 w-64 object-cover rounded">
            </div>
            <div>
              <h2 class="text-2xl font-bold mb-4">${dish.name}</h2>
              <p class="text-gray-700 mb-2"><strong>Pris:</strong> ${dish.price} kr</p>
              <p class="text-gray-700 mb-2"><strong>Antal personer:</strong> ${dish.servings}</p>
              <p class="text-gray-700 mb-4">${dish.description}</p>
              ${dish.ingredients ? `
                <div class="mt-4">
                  <h3 class="text-xl font-bold mb-2">Ingredienser:</h3>
                  <ul class="list-disc ml-6">
                    ${dish.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                  </ul>
                </div>
              ` : ""}
              ${dish.steps ? `
                <div class="mt-4">
                  <h3 class="text-xl font-bold mb-2">Fremgangsmåde:</h3>
                  <ol class="list-decimal ml-6">
                    ${dish.steps.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                </div>
              ` : ""}
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `<p class="text-center text-red-600">Madretten blev ikke fundet.</p>`;
      }
    })
    .catch(error => {
      container.innerHTML = `<p class="text-center text-red-600">Fejl ved indlæsning af data.</p>`;
      console.error("Error fetching dish data:", error);
    });
} else {
  container.innerHTML = `<p class="text-center text-red-600">Ingen ret valgt.</p>`;
}

/* ========= Funktion til at generere stjerneikoner for bedømmelsen ========= */
function getStarIcons(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    i < rating
      ? '<i class="fa fa-star text-yellow-500"></i>'
      : '<i class="fa fa-star-o text-yellow-500"></i>'
  ).join('');
}

/* ========= Håndter indsendelse af kommentarformularen ========= */
document.getElementById('commentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nameText = document.getElementById('commentName').value.trim();
  const ratingValue = document.getElementById('commentRating').value.trim();
  const commentText = document.getElementById('commentText').value.trim();

  if (!nameText || !ratingValue || !commentText) return;

  const commentsList = document.getElementById('commentsList');
  const starsHTML = getStarIcons(parseInt(ratingValue));

  const commentEl = document.createElement('div');
  commentEl.className = "w-full p-2";
  commentEl.innerHTML = `
    <div class="bg-gray-50 p-4 rounded shadow mb-4">
      <p class="font-bold mb-2">${nameText} - ${starsHTML}</p>
      <p>${commentText}</p>
    </div>
  `;
  commentsList.appendChild(commentEl);

/* ========= Nulstil formularfelterne ========= */
  document.getElementById('commentName').value = "";
  document.getElementById('commentRating').selectedIndex = 0;
  document.getElementById('commentText').value = "";
});
