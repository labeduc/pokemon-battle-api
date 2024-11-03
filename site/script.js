const apiURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";
const pokemonImageBaseURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";
const battleApiURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/batalha";

// Estrutura dos dados a serem enviados
var battleData = {
  "treinador_1": {
    "nome": "",
    "pokemons": []
  },
  "treinador_2": {
    "nome": "Equipe Rocket",
    "pokemons": ["pamparuga"]
  }
};

// Função para inicializar Choices.js nas dropdowns após carregá-las com dados
function initializeChoices() {
  const dropdowns = [document.getElementById("pokemon1"), document.getElementById("pokemon2"), document.getElementById("pokemon3")];

  dropdowns.forEach(dropdown => {
    new Choices(dropdown, {
      placeholderValue: "Selecione um Pokémon",
      searchPlaceholderValue: "Buscar Pokémon...",
      itemSelectText: "", // Remove o texto "Pressione para selecionar" (opcional)
      renderSelectedChoices: 'auto'
    });
  });
}

async function batalha(e) {
  e.preventDefault();
  const trainerName = document.getElementById('trainer-name').value;
  const pokemon1 = document.getElementById('pokemon1').selectedOptions[0].textContent;
  const pokemon2 = document.getElementById('pokemon2').selectedOptions[0].textContent;
  const pokemon3 = document.getElementById('pokemon3').selectedOptions[0].textContent;  

  battleData.treinador_1.nome = trainerName;
  battleData.treinador_1.pokemons = [pokemon1, pokemon2, pokemon3];

  try {
    console.log(battleData);
    // Envia a requisição para a API de batalha
    const response = await fetch(battleApiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(battleData)
    });

    if (!response.ok) {
      throw new Error("Erro ao iniciar a batalha");

    }

    // Obtém os dados da resposta (passos da batalha)
    const battleSteps = await response.json();
    console.log(battleSteps);
    const messages = battleSteps.data;

    const log = document.getElementById('log');
    log.innerHTML = ''; // Limpa o log antes de uma nova batalha


    messages.forEach((message, index) => {
      setTimeout(() => {
        log.innerHTML += message + '\n';
        log.scrollTop = log.scrollHeight;
      }, index * 1000); // Mensagens surgem a cada segundo
    });
  } catch (error) { console.log(error) }
}  

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
               initializeChoices();
    } catch (error) {
        console.error("Erro ao buscar dados dos Pokémon:", error);
    }
}

// Função para exibir o modal com detalhes do Pokémon em forma de tabela
async function showPokemonDetails(pokemonName) {
    try {
        const response = await fetch(`http://localhost:8000/pokemons/${pokemonName.toLowerCase()}`);
        const data = await response.json();

        document.getElementById("pokemon-name").textContent = pokemonName.toUpperCase();

        // Limpa o conteúdo anterior
        const detailsContainer = document.getElementById("pokemon-details");
        detailsContainer.innerHTML = "";

        // Cria uma tabela para exibir as informações
        const table = document.createElement("table");
        table.classList.add("pokemon-details-table");

      // Itera sobre cada campo de data e adiciona uma linha à tabela
       const excludedKeys = ["name_or_id","cur_hp", "ivs", "evs", "status", "nickname", "friendship", "item"];
      for (const [key, value] of Object.entries(data.data[0])) {
        if (excludedKeys.includes(key)) continue;
          
        if (key === "stats_actual") {
          const statsTitles = ["HP", "Attack", "Defense", "Sp.Defense", "Sp.Attack", "Speed"];
                
          value.forEach((stat, index) => {
            const row = document.createElement("tr");

            const keyCell = document.createElement("td");
            keyCell.textContent = statsTitles[index];
            keyCell.classList.add("table-key");

            const valueCell = document.createElement("td");
            valueCell.textContent = stat;
            valueCell.classList.add("table-value");

            row.appendChild(keyCell);
            row.appendChild(valueCell);
            table.appendChild(row);
          });
        } else {
          const row = document.createElement("tr");

          const keyCell = document.createElement("td");
          keyCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitaliza a chave
          keyCell.classList.add("table-key");

          const valueCell = document.createElement("td");
          valueCell.textContent = value;
          valueCell.classList.add("table-value");

          row.appendChild(keyCell);
          row.appendChild(valueCell);
          table.appendChild(row);
        }
      }

        // Adiciona a tabela ao modal
        detailsContainer.appendChild(table);

        // Exibe o modal
        const modal = document.getElementById("pokemon-modal");
        modal.style.display = "block";
    } catch (error) {
        console.error("Erro ao buscar informações do Pokémon:", error);
    }
}

// Função para exibir o modal com a imagem do Pamparuga
function showPamparugaImage() {
    const detailsContainer = document.getElementById("pokemon-details");
    detailsContainer.innerHTML = ""; // Limpa o conteúdo anterior

    const image = document.createElement("img");
    image.src = "Pamparuga.jpeg";
    image.alt = "Imagem de Pamparuga";
    image.style.width = "100%"; // Ajusta a largura da imagem no modal

    detailsContainer.appendChild(image);

    document.getElementById("pokemon-name").textContent = "";
    document.getElementById("pokemon-modal").style.display = "block";
}

document.getElementById('battle-form').addEventListener('submit', batalha);

// Evento para exibir o modal ao passar o mouse sobre a imagem
document.querySelectorAll(".pokemon-image").forEach(img => {
    img.addEventListener("click", () => {
        const pokemonName = img.previousElementSibling.selectedOptions[0].textContent;
        showPokemonDetails(pokemonName);
    });
});

// Evento para exibir o modal com a imagem do Pamparuga ao clicar
document.getElementById("pamparuga-image").addEventListener("click", showPamparugaImage);

// Evento para fechar o modal ao clicar no botão "X"
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("pokemon-modal").style.display = "none";
});

// Chama a função para buscar e popular os dropdowns ao carregar a página
window.addEventListener("DOMContentLoaded", fetchAndPopulatePokemon);
const imageElement1 = document.getElementById("pokemon1-image");
imageElement1.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement2 = document.getElementById("pokemon2-image");
imageElement2.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement3 = document.getElementById("pokemon3-image");
imageElement3.src = `${pokemonImageBaseURL}/1/picture`;