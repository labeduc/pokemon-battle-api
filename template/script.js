document.getElementById('battle-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const trainerName = document.getElementById('trainer-name').value;
    const pokemon1 = document.getElementById('pokemon1').value;
    const pokemon2 = document.getElementById('pokemon2').value;
    const pokemon3 = document.getElementById('pokemon3').value;

    const log = document.getElementById('log');
    log.innerHTML = ''; // Limpa o log antes de uma nova batalha

    const messages = [
        `Treinador ${trainerName} entrou na batalha com ${pokemon1}, ${pokemon2} e ${pokemon3}.`,
        `${pokemon1} usou um ataque poderoso em Pamparuga!`,
        `Pamparuga se defendeu e contra-atacou com uma investida brutal!`,
        `${pokemon2} entrou em ação e usou um golpe especial!`,
        `Pamparuga parece estar enfurecido, mas ${pokemon3} não se intimida e lança seu melhor ataque!`,
        `Após uma batalha épica, Pamparuga recua, permitindo ao treinador ${trainerName} vencer!`
    ];

    messages.forEach((message, index) => {
        setTimeout(() => {
            log.innerHTML += message + '\n';
            log.scrollTop = log.scrollHeight;
        }, index * 1000); // Mensagens surgem a cada segundo
    });
});

// URLs da API
const apiURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";
const pokemonImageBaseURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";

// Função para buscar os dados dos Pokémon e preencher os dropdowns
async function fetchAndPopulatePokemon() {
    try {
        const response = await fetch(apiURL);
      const pokemonResponse = await response.json();
      const pokemonList = pokemonResponse.data;

        const dropdowns = [document.getElementById("pokemon1"), document.getElementById("pokemon2"), document.getElementById("pokemon3")];
        
        dropdowns.forEach(dropdown => {
            pokemonList.forEach(pokemon => {
                const option = document.createElement("option");
                option.value = pokemon.id;
                option.textContent = pokemon.nome;
                dropdown.appendChild(option);
            });

            // Adiciona um listener para exibir a imagem ao selecionar o Pokémon
            dropdown.addEventListener("change", function() {
                const selectedPokemonId = dropdown.value;
                const imageElement = document.getElementById(dropdown.id + "-image");
                imageElement.src = `${pokemonImageBaseURL}/${selectedPokemonId}/picture`;
            });
        });
    } catch (error) {
        console.error("Erro ao buscar dados dos Pokémon:", error);
    }
}

// Chama a função para buscar e popular os dropdowns ao carregar a página
window.addEventListener("DOMContentLoaded", fetchAndPopulatePokemon);
const imageElement1 = document.getElementById("pokemon1-image");
imageElement1.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement2 = document.getElementById("pokemon2-image");
imageElement2.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement3 = document.getElementById("pokemon3-image");
imageElement3.src = `${pokemonImageBaseURL}/1/picture`;