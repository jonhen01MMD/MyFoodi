document.addEventListener("DOMContentLoaded", async () => {
    /* ========= Elementer og tilstandsvariabler ========= */
        const table = document.getElementById("mealplanTable");
        const weeklyPriceEl = document.getElementById("weekly-price");
        const groceryListEl = document.querySelector("#grocery-list ul");
        let dishesData = [];
      
    /* ========= Hjælpefunktioner ========= */
        const removeSuggestion = (cell) => {
          if (cell._suggestionBox) {
            document.body.removeChild(cell._suggestionBox);
            cell._suggestionBox = null;
          }
        };
      
        const showSuggestions = (cell, text) => {
          removeSuggestion(cell);
          if (!text.trim()) return;
      
          const suggestions = dishesData.filter(dish =>
            dish.name.toLowerCase().includes(text.trim().toLowerCase())
          );
          if (suggestions.length === 0) return;
      
          const container = document.createElement("div");
          container.className = "suggestion-box bg-white border rounded shadow p-2";
          container.style.position = "absolute";
          const rect = cell.getBoundingClientRect();
          container.style.top = (rect.bottom + window.scrollY) + "px";
          container.style.left = (rect.left + window.scrollX) + "px";
          container.style.zIndex = 1000;
      
          suggestions.forEach(dish => {
            const item = document.createElement("div");
            item.className = "cursor-pointer hover:bg-gray-100 p-1";
            item.textContent = `${dish.name} - ${dish.price} kr`;
            item.addEventListener("mousedown", (e) => {
              e.preventDefault();
              cell.textContent = dish.name;
              removeSuggestion(cell);
              savePlan();
            });
            container.appendChild(item);
          });
      
          document.body.appendChild(container);
          cell._suggestionBox = container;
        };
      
        const recalcTotals = () => {
          let totalPrice = 0;
          const ingredientsSet = new Set();
      
          table.querySelectorAll("td[contenteditable]").forEach(cell => {
            const dishName = cell.textContent.trim();
            if (dishName) {
              const dish = dishesData.find(d => d.name.toLowerCase() === dishName.toLowerCase());
              if (dish) {
                totalPrice += parseInt(dish.price, 10);
                dish.ingredients.forEach(ing => ingredientsSet.add(ing));
              }
            }
          });
      
          weeklyPriceEl.textContent = `Total Pris: ${totalPrice} kr`;
          groceryListEl.innerHTML = Array.from(ingredientsSet)
            .map(ing => `<li>${ing}</li>`)
            .join("");
        };
      
        const savePlan = () => {
          const plan = {};
          table.querySelectorAll("td[contenteditable]").forEach(cell => {
            const day = cell.getAttribute("data-day");
            const meal = cell.getAttribute("data-meal");
            plan[`${day}-${meal}`] = cell.textContent.trim();
          });
          localStorage.setItem("mealPlan", JSON.stringify(plan));
          recalcTotals();
        };
      
        const loadPlan = () => {
          const savedPlan = JSON.parse(localStorage.getItem("mealPlan") || "{}");
          table.querySelectorAll("td[contenteditable]").forEach(cell => {
            const day = cell.getAttribute("data-day");
            const meal = cell.getAttribute("data-meal");
            const key = `${day}-${meal}`;
            if (savedPlan[key]) {
              cell.textContent = savedPlan[key];
            }
          });
          recalcTotals();
        };
      
    /* ========= Hent data for retterne ========= */
        try {
          const response = await fetch("json/dishes.json");
          dishesData = await response.json();
          recalcTotals();
        } catch (error) {
          console.error("Error loading dishes:", error);
        }
      
    /* ========= Event listeners for redigerbare celler ========= */
        table.querySelectorAll("td[contenteditable]").forEach(cell => {
          cell.addEventListener("blur", () => {
            setTimeout(() => removeSuggestion(cell), 200);
            savePlan();
          });
          cell.addEventListener("input", (e) => {
            showSuggestions(cell, e.target.textContent);
          });
        });
      
    /* ========= Indlæs gemt plan ========= */
        loadPlan();
      });
      