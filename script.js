const container=document.querySelector(".container")
const changeButton=document.querySelector(".change")
let timeLeft = 0.2* 60; // 10 minutos en segundos
const timerElement = document.getElementById("timer");
let interval;
let score = 0;
const scoreElement = document.getElementById("score");
const modalFinal=document.querySelector(".modal");
const restartButtonModal=document.getElementById("restartButton");
const restartButton=document.getElementById("restartButtonHeader");
const showStatsButton = document.getElementById("showStatsButton");
const statsModal = document.getElementById("statsModal");
const closeStatsButton = document.getElementById("closeStatsButton");
const statsContent = document.getElementById("statsContent");
const soundCorrect = new Audio('./sounds/correct.mp3');
const soundWrong   = new Audio('./sounds/wrong.mp3');
let data;
const categories = [
    "animales",
    "paises",
    "ciudades",
    "deportes",
    "verbos",
    "nombres"
];

const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
class BSTNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
class SparseMatrix {
    constructor() {
        this.data = {}; // fila → columna → valor
    }

    // Guardar valor
    set(row, col, value) {
        if (!this.data[row]) this.data[row] = {};
        this.data[row][col] = value;
    }

    // Obtener valor (0 si no existe)
    get(row, col) {
        if (this.data[row] && this.data[row][col] !== undefined) {
            return this.data[row][col];
        }
        return 0;
    }

    // Incrementar valor
    increment(row, col, amount = 1) {
        const current = this.get(row, col);
        this.set(row, col, current + amount);
    }

    // Obtener todas las filas
    getRows() {
        return Object.keys(this.data);
    }

    // Obtener todas las columnas de una fila
    getCols(row) {
        if (!this.data[row]) return [];
        return Object.keys(this.data[row]);
    }
}
const stats = new SparseMatrix();
class BST {
    constructor() {
        this.root = null;
    }

    insert(value) {
        this.root = this._insertRecursive(this.root, value);
    }

    _insertRecursive(node, value) {
        if (!node) return new BSTNode(value);
        if (value < node.value) node.left = this._insertRecursive(node.left, value);
        else node.right = this._insertRecursive(node.right, value);
        return node;
    }

    exists(value) {
        return this._search(this.root, value);
    }

    _search(node, value) {
        if (!node) return false;
        if (node.value === value) return true;
        return value < node.value ? this._search(node.left, value)
                                  : this._search(node.right, value);
    }
}
async function loadCategory(url) {
  const response = await fetch(url);
  const json = await response.json();

  // Crear tabla hash: letra -> BST y contador
  const table = {};
  const counts = {};
  letters.forEach(l => {
    table[l] = new BST();
    counts[l] = 0;
  });

  // Insertar palabras al BST según letra inicial y contar
  json.items.forEach(wordRaw => {
    const word = String(wordRaw).trim();
    if (!word) return;
    const letter = word[0].toUpperCase();
    if (table[letter]) {
      table[letter].insert(word); // guarda en minúsculas para búsquedas
      counts[letter] += 1;
    }
  });

  // adjuntamos los conteos a la tabla para acceso posterior
  table._counts = counts;
  return table;
}
function showResultVisual(card, ok, message = "") {
  // limpiar posibles clases previas
  card.classList.remove("correct", "incorrect");
  const input = card.querySelector("input");
  if (input) {
    input.classList.remove("correct-border", "incorrect-border");
  }

  if (ok) {
    card.classList.add("correct");
    if (input) input.classList.add("correct-border");

    // mostrar mensaje breve dentro de la carta
    let fb = card.querySelector(".feedback");
    if (!fb) {
      fb = document.createElement("div");
      fb.className = "feedback";
      card.appendChild(fb);
    }
    fb.textContent = message || "✔ Correcto";

    // animación de salida y reemplazo de carta después de 700ms
    card.classList.add("card-replace");
    setTimeout(() => {
      card.classList.add("fade-out");
    }, 380);

    setTimeout(() => {
      changeButton.click()
    }, 600);
  } else {
    card.classList.add("incorrect");
    if (input) input.classList.add("incorrect-border");

    // vibración (si el dispositivo lo soporta)
    if (navigator.vibrate) {
      // patrón: breve-vib, pausa, breve-vib
      navigator.vibrate([80, 40, 80]);
    }

    // mostrar mensaje de error breve
    let fb = card.querySelector(".feedback");
    if (!fb) {
      fb = document.createElement("div");
      fb.className = "feedback";
      card.appendChild(fb);
    }
    fb.textContent = message || "✖ Incorrecto — intenta otra vez";

    // quitar la clase incorrect después de 900ms para permitir reintento visual limpio
    setTimeout(() => {
      card.classList.remove("incorrect");
      if (input) input.classList.remove("incorrect-border");
      // opcional: mantener el mensaje por 400ms y luego eliminarlo
      setTimeout(() => { if (fb) fb.remove(); }, 400);
    }, 900);
  }
}
async function loadAllCategories() {
    const categories = {
        animales: await loadCategory('./json/animales.json'),
        ciudades: await loadCategory('./json/ciudades.json'),
        paises:   await loadCategory('./json/paises.json'),
        nombres:  await loadCategory('./json/nombres.json'),
        verbos:   await loadCategory('./json/verbos.json'),
        deportes: await loadCategory('./json/deportes.json'),
    };

    return categories;
}
function updateDisplayTimer(){
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

        timerElement.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
function startTimer() {
        updateDisplayTimer()
        interval = setInterval(() => {

        // si se acaba el tiempo
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerElement.textContent = "00:00";
            gameOver();
            return;
        }

        timeLeft--;

        updateDisplayTimer()
    }, 1000);
}

function gameOver() {
    // aquí puedes reiniciar el juego o bloquear acciones
    modalFinal.classList.remove("hidden")

}
function restart(){

    modalFinal.classList.add("hidden");

    // 2️⃣ Reiniciar temporizador
    if (interval) clearInterval(interval)
    timeLeft =3 * 60; // 10 minutos
    startTimer();

    // 3️⃣ Limpiar puntuación
    scoreElement.textContent = "⭐ 0"; // o 0 según tu implementación

    // 4️⃣ Limpiar carta actual
    if (container.firstElementChild && !container.firstElementChild.classList.contains("change")) {
        container.removeChild(container.firstElementChild);
    }

    // 5️⃣ Generar primera carta
    changeButton.dispatchEvent(new Event("click"));
}
function addStars(amount) {
    score += amount;
    scoreElement.textContent = `⭐ ${score}`;
}
// cuando el usuario presiona ENTER, procesamos la respuesta
function validateWord(category,letter,userWord, data) { 
    // normalizar entrada
    const word = userWord.trim().toLowerCase();
    const requiredLetter = letter.toUpperCase();

    // 1. El usuario debe escribir algo
    if (word.length === 0) {
        return { valid: false, reason: "Debe escribir una palabra." };
    }

    // 2. Debe empezar por la letra correcta
    if (!word.startsWith(letter.toLowerCase())) {
        return { valid: false, reason: "La palabra no empieza por la letra requerida." };
    }

    // 3. Acceder a la tabla hash por categoría
    const table = data[category];
    if (!table) {
        return { valid: false, reason: "Categoría inválida." };
    }

    // 4. Obtener el BST correspondiente a la letra
    const bst = table[requiredLetter];
    if (!bst) {
        return { valid: false, reason: "La letra no existe dentro de esta categoría." };
    }

    // 5. Buscar en el BST
    if (bst.exists(word)) {
        return { valid: true };
    } else {
        return { valid: false, reason: "La palabra no está en el banco de palabras." };
    }
}
function getStarsForLetter(categoryKey, letter, data) {
    const table = data[categoryKey];
    const count = table._counts[letter] || 0;

    if (count <= 40) return 3;    // muy difícil
    if (count <= 120) return 2;   // medio
    return 1;                     // fácil
}
function pickWeightedLetterForCategory(categoryKey, data) {
  const table = data[categoryKey];
  if (!table || !table._counts) {
    // fallback: letra al azar si falta info
    return letters[Math.floor(Math.random() * letters.length)];
  }

  const counts = table._counts;
  const epsilon = 0; // evita prob 0 si quieres mínima probabilidad
  // construir arreglo de pares [letra, peso]
  const pairs = letters.map(l => [l, (counts[l] || 0) + epsilon]);

  // calcular suma y elegir por distribución acumulada
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let r = Math.random() * total;
  for (const [letter, weight] of pairs) {
    r -= weight;
    if (r <= 0) return letter;
  }
  // fallback (muy improbable)
  return pairs[pairs.length - 1][0];
}
function onSubmitSpecial(event, card, progress, data) {
    if(event.key !== "Enter") return;

    const input = event.target;
    const categoriesArr = JSON.parse(input.dataset.categories);
    let index = parseInt(input.dataset.categoryIndex);
    const letter = input.dataset.letter;

    const category = categoriesArr[index].toLowerCase();
    const word = input.value.trim();

    const result = validateWord(category, letter, word, data);

    if(result.valid){
        // incrementar progreso
        index++;
        const percentage = (index / categoriesArr.length) * 100;
        progress.style.width = percentage + "%";
        recordStats(category, letter, true);
        soundCorrect.currentTime = 0; // reinicia por si se tocó antes
        soundCorrect.play();

        // si quedan más categorías
        if(index < categoriesArr.length){
            input.value = "";
            input.dataset.categoryIndex = index;
            input.placeholder = `${categoriesArr[index]} con ${letter}...`;
        } else {
            // carta completa
            addStars(categoriesArr.length === 2 ? 5 : 7);
            card.classList.add("correct");

            // opcional: reemplazar carta después de un tiempo
            setTimeout(() => changeButton.click(), 800);
        }
    } else {
        // animación de error
        card.classList.add("incorrect");
        setTimeout(() => card.classList.remove("incorrect"), 500);
        recordStats(category, letter, false);
        soundWrong.currentTime = 0;
        soundWrong.play();
    }
}
function onSubmit(event, category, letter, data,numStars) {
  if (!(event.key === "Enter")) {
    return;
  }
  const inputEl = event.target;
  const word = inputEl.value;

  const result = validateWord(category, letter, word, data);

  // buscamos la carta padre para aplicar efectos
  const card = inputEl.closest(".card");

  if (result.valid) {
    console.log("✔ CORRECTO!");
    // visual + reemplazo
    recordStats(category, letter, true);
    soundCorrect.currentTime = 0; // reinicia por si se tocó antes
    soundCorrect.play();
    showResultVisual(card, true, "¡Bien hecho!");
    addStars(numStars)
  } else {
    console.log("❌ INCORRECTO:", result.reason);
    // visual + vibración
    showResultVisual(card, false, result.reason);
    recordStats(category, letter, false);
    soundWrong.currentTime = 0;
    soundWrong.play();
  }
}
function createSpecialCard(categoriesArr, data) {
    const card = document.createElement("div");
    card.className = "card";

    // ⭐ Contenedor de estrellas
    const starsContainer = document.createElement("div");
    starsContainer.className = "stars";

    const starCount = categoriesArr.length === 2 ? 5 : 7;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");
        star.className = "star";
        star.textContent = "⭐";
        starsContainer.appendChild(star);
    }

    // 📌 Barra de progreso
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-bar";

    const progress = document.createElement("div");
    progress.className = "progress";
    progress.style.width = "0%";

    progressContainer.appendChild(progress);

    // 📌 Contenedor de título (categorías + letra)
    const title = document.createElement("p");
    title.className = "card-title";

    // Escoger letra usando la primera categoría
    const firstCategory = categoriesArr[0].toLowerCase();
    const letter = pickWeightedLetterForCategory(firstCategory, data);

    let titleText = "";
    if (categoriesArr.length === 2) {
        titleText = `${categoriesArr[0]}, ${categoriesArr[1]} con ${letter}`;
    } else if (categoriesArr.length === 3) {
        titleText = `${categoriesArr[0]}, ${categoriesArr[1]}, ${categoriesArr[2]} con ${letter}`;
    }

// Asignar al elemento title
title.textContent = titleText;

    // ✏️ Input
    const cardInput = document.createElement("div");
    cardInput.className = "card-input";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `${categoriesArr[0]} con ${letter}...`;
    input.dataset.categoryIndex = 0; // para saber en qué categoría va
    input.dataset.letter = letter;
    input.dataset.categories = JSON.stringify(categoriesArr);

    input.onkeyup = (event) => onSubmitSpecial(event, card, progress, data);

    cardInput.appendChild(input);
    card.style.backgroundColor="#d5f5c3ff"

    // ARMAR tarjeta
    card.appendChild(starsContainer);
    card.appendChild(progressContainer);
    card.appendChild(title);
    card.appendChild(cardInput);

    return card;
}
// Incrementar estadísticas
function recordStats(category, letter, correct) {
    let current = stats.get(category, letter);
    if (!current || typeof current !== "object") {
        current = { aciertos: 0, intentos: 0 };
    }
    current.intentos += 1;
    if (correct) current.aciertos += 1;

    stats.set(category, letter, current);
}
function fillStatsModal() {
    statsContent.innerHTML = "";
    const rows = stats.getRows();
    if (rows.length === 0) {
        statsContent.textContent = "Aún no hay estadísticas.";
        return;
    }

    rows.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.marginBottom = "10px";
        const cols = stats.getCols(row);
        const colText = cols.map(col => {
            const val = stats.get(row, col);
            return `${col}: ${val.aciertos || 0}✔ / ${val.intentos || 0}✖`;
        }).join(", ");
        rowDiv.textContent = `${row} → ${colText}`;
        statsContent.appendChild(rowDiv);
    });
}
function createCard(category, letter, data) {

    const card = document.createElement("div");
    card.className = "card";

    // ⭐ CONTENEDOR DE ESTRELLAS
    const starsContainer = document.createElement("div");
    starsContainer.className = "stars";

    const numStars = getStarsForLetter(category.toLowerCase(), letter, data);
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement("span");
        star.className = "star";
        star.textContent = "⭐";
        starsContainer.appendChild(star);
    }

    // 📌 TÍTULO
    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = `${category} con ${letter}`;

    // ✏️ INPUT
    const cardInput = document.createElement("div");
    cardInput.className = "card-input hidden";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `${category} con ${letter}...`;
    input.onkeyup = (event) => onSubmit(event, category, letter, data,numStars);

    cardInput.appendChild(input);

    // ARMAR
    card.appendChild(starsContainer);
    card.appendChild(title);
    card.appendChild(cardInput);

    // CLICK EN TARJETA
    card.addEventListener("click", () => {
        starsContainer.classList.add("hidden"); // ocultar estrellas
        cardInput.classList.remove("hidden");   // mostrar input
        input.focus();
    });

    return card;
}

showStatsButton.addEventListener("click", () => {
    fillStatsModal();
    statsModal.classList.remove("hidden");
});

closeStatsButton.addEventListener("click", () => {
    statsModal.classList.add("hidden");
});
restartButtonModal.addEventListener("click",()=>{
    restart()
})
restartButton.addEventListener("click",()=>{
    restart()
})
changeButton.addEventListener("click", () => {
    // Probabilidad 1/7 para carta especial
    const isSpecial = Math.floor(Math.random() * 7) === 0; // 0 a 6 -> solo si es 0

    let card;

    if (isSpecial) {
        // Elegir aleatoriamente 2 o 3 categorías para la carta especial
        const numCategories = Math.random() < 0.5 ? 2 : 3;
        const shuffled = categories.sort(() => 0.5 - Math.random()); // mezclar categorías
        const specialCategories = shuffled.slice(0, numCategories);

        card = createSpecialCard(specialCategories, data);

    } else {
        // Carta normal
        const category = categories[Math.floor(Math.random() * categories.length)];
        const letter = pickWeightedLetterForCategory(category.toLowerCase(), data);
        card = createCard(category, letter, data);
    }

    // Reemplazar o insertar carta
    if (container.children.length > 1) {
        container.replaceChild(card, container.firstElementChild);
    } else {
        container.insertBefore(card, changeButton);
    }
});
async function main() {
    data = await loadAllCategories(); // <-- AQUÍ ESTÁ EL CAMBIO IMPORTANTE
    changeButton.dispatchEvent(new Event("click"))
    
    // inicia automáticamente
    startTimer();

}
main()