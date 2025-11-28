const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn");
const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#search-btn");
const pokemonsPerPage = 20;

let currentPage = 1;
let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemons = [];

async function cargarPokemons() {
    for (let i = 1; i <= 151; i++){
        try{
            const response = await fetch(URL + i);
            const data = await response.json();
            todosLosPokemons.push(data);
            
            mostrarPokemon(data);

        } catch (error) {
            console.error("Error cargando el Pokémon " + i, error);
        }
        
    } 
    mostrarListaPokemons(todosLosPokemons)
}

function buscarPokemon(){
    const texto = searchInput.value.toLowerCase().trim();

    if (texto == ""){
        mostrarListaPokemons(todosLosPokemons);
        return;
    }

    const resultado = todosLosPokemons.filter(poke =>
        poke.name.toLowerCase().includes(texto) ||
        poke.id.toString() === texto
    );
    mostrarListaPokemons(resultado);
}

searchBtn.addEventListener("click", buscarPokemon);

searchInput.addEventListener("keyup", (Event) => {
    if (Event.key === "Enter"){
        buscarPokemon();
    }
})


function mostrarListaPokemons(lista) {
    listaPokemon.innerHTML = "";
    
    const start = (currentPage - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;

    const pokemonsPagina = lista.slice(start, end);
    
    pokemonsPagina.forEach(poke => mostrarPokemon(poke));

    mostrarControles(lista.length);
}


function mostrarControles(totalPokemons){
    const paginacion = document.querySelector("#paginacion");
    paginacion.innerHTML = "";

    const totalPages = Math.ceil(totalPokemons / pokemonsPerPage);

    if (currentPage > 1){
        const btnPrev = document.createElement("button");
        btnPrev.textContent = "Anterior";
        btnPrev.classList.add("btn-paginacion");
        btnPrev.addEventListener("click", () => {
            currentPage--;
            mostrarListaPokemons(todosLosPokemons);
        });
        paginacion.appendChild(btnPrev);
    }

    const span = document.createElement("span");
    span.classList.add("pagina-info");
    span.textContent =  `Pagina ${currentPage} de ${totalPages}`;
    paginacion.appendChild(span);

    if (currentPage < totalPages){
        const btnNext = document.createElement("button");
        btnNext.textContent = "Siguiente";
        btnNext.classList.add("btn-paginacion");
        btnNext.addEventListener("click", () => {
            currentPage++;
            mostrarListaPokemons(todosLosPokemons);
        });
        paginacion.appendChild(btnNext);
    }
}

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name}">${type.type.name}</p>`).join('');
    let pokeId = poke.id.toString().padStart(3, "0");

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">    
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
                <button class="btn-favorito" data-id="${poke.id}">
                <i class="bi bi-star-fill"></i>
                </button>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}m</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
        </div>
    `;
    listaPokemon.append(div);
    
    const btnFav = div.querySelector(".btn-favorito");
    btnFav.addEventListener("click", () => toggleFavorito(poke));
}

function getFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function saveFavoritos(lista) {
    localStorage.setItem("favoritos", JSON.stringify(lista));
}

function toggleFavorito(poke) {
    let favoritos = getFavoritos();
    const existe = favoritos.find(p => p.id === poke.id);

    const btnIcon = document.querySelector(`button[data-id="${poke.id}"] i`);

    if (existe) {
        favoritos = favoritos.filter(p => p.id !== poke.id);
        btnIcon.classList.remove("favorito-activo")
    } else {
        favoritos.push(poke);
        btnIcon.classList.add("favorito-activo")
    }

    saveFavoritos(favoritos);
    mostrarFavoritos();
}

function mostrarFavoritos() {
    const listaFavoritos = document.querySelector("#listaFavoritos");
    listaFavoritos.innerHTML = "";

    const favoritos = getFavoritos();
    favoritos.forEach(poke => {
        let tipos = poke.types.map((type) => `<p class="${type.type.name}">${type.type.name}</p>`).join('');
        let pokeId = poke.id.toString().padStart(3, "0");

        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
            <p class="pokemon-id-back">#${pokeId}</p>
            <div class="pokemon-imagen">
                <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">    
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h2 class="pokemon-nombre">${poke.name}</h2>
                </div>
                <div class="pokemon-tipos">
                    ${tipos}
                </div>
                <div class="pokemon-stats">
                    <p class="stat">${poke.height}m</p>
                    <p class="stat">${poke.weight}kg</p>
                </div>
            </div>
        `;
        listaFavoritos.append(div);
    });
}

botonesHeader.forEach(boton => boton.addEventListener("click", (event) =>{
    const botonId = event.currentTarget.id; 

    if(botonId === "ver-todos"){
        mostrarListaPokemons(todosLosPokemons);
    } else {
        const filtrados = todosLosPokemons.filter(poke =>
            poke.types.some(type => type.type.name === botonId)
        );
        mostrarListaPokemons(filtrados);
    }
}));

cargarPokemons();
mostrarFavoritos();
