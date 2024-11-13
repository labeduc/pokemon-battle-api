const apiURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";
const pokemonImageBaseURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons";
const battleApiURL = "https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/batalha";


// Função para inicializar Choices.js nas dropdowns após carregá-las com dados
function initializeChoices() {
  const dropdowns = [document.getElementById("pokemon1"), document.getElementById("pokemon2"), document.getElementById("pokemon3"), document.getElementById("pokemon4"), document.getElementById("pokemon5"), document.getElementById("pokemon6")];

  dropdowns.forEach(dropdown => {
    new Choices(dropdown, {
      placeholderValue: "Selecione um Pokémon",
      searchPlaceholderValue: "Buscar Pokémon...",
      itemSelectText: "", // Remove o texto "Pressione para selecionar" (opcional)
      renderSelectedChoices: 'auto'
    });
  });
}

// Função para abrir e atualizar a modal de batalha
function openBattleModal(battleData) {
  const modal = document.getElementById("battle-modal");
  modal.style.display = "block"; // Exibe a modal

  const logContent = document.getElementById("battle-log-content");
  logContent.innerHTML = ""; // Limpa o log de batalha

  // Itera sobre cada linha dos dados de batalha
  battleData.forEach((line, index) => {
    setTimeout(() => {
      // Atualiza as imagens e HP conforme a linha da batalha
      if (line.startsWith("P1:")) {
        const [_, pokemonIndex, hp] = line.split(": ");
        updateBattleStatus("pokemon1", pokemonIndex.trim(), hp.trim());
      } else if (line.startsWith("P2:")) {
        const [_, pokemonIndex, hp] = line.split(": ");
        updateBattleStatus("pokemon2", pokemonIndex.trim(), hp.trim());
      } else {
        const logEntry = document.createElement("p");
        logEntry.textContent = line;
        logContent.appendChild(logEntry); // Adiciona a linha ao log de batalha
      }
    }, index * 1000);
  });
}

// Função para atualizar o status do Pokémon em batalha
function updateBattleStatus(side, pokemonIndex, hp) {
  const imageElement = document.getElementById(`${side}-image1`);
  const hpElement = document.getElementById(`${side}-hp`);

  // Atualiza a imagem e HP do Pokémon em batalha
  imageElement.src = `https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/pokemons/${pokemonIndex}/picture`;
  hpElement.textContent = hp;
}

// Evento para fechar a modal de batalha
document.getElementById("close-battle-modal").addEventListener("click", () => {
  document.getElementById("battle-modal").style.display = "none";
});


async function batalha(e) {
  e.preventDefault();

  const trainerName = document.getElementById('trainer-name').value;
  const trainerName2 = document.getElementById('trainer-name2').value;
  const pokemon1 = document.getElementById('pokemon1').selectedOptions[0].textContent;
  const pokemon2 = document.getElementById('pokemon2').selectedOptions[0].textContent;
  const pokemon3 = document.getElementById('pokemon3').selectedOptions[0].textContent;
  const pokemon4 = document.getElementById('pokemon4').selectedOptions[0].textContent;
  const pokemon5 = document.getElementById('pokemon5').selectedOptions[0].textContent;
  const pokemon6 = document.getElementById('pokemon6').selectedOptions[0].textContent;

  // Estrutura dos dados a serem enviados
  var battleData = {
    "treinador_1": {
      "nome": trainerName,
      "pokemons": [pokemon1, pokemon2, pokemon3]
    },
    "treinador_2": {
      "nome": trainerName2,
      "pokemons": [pokemon4, pokemon5, pokemon6]
    }
  };

  try {
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
    const messages = battleSteps.data;

    openBattleModal(messages);
  } catch (error) {
    console.error("Erro ao iniciar a batalha:", error);
  }
}

// Função para buscar os dados dos Pokémon e preencher os dropdowns
async function fetchAndPopulatePokemon() {
  try {
    const response = await fetch(apiURL);
    const pokemonResponse = await response.json();
    const pokemonList = pokemonResponse.data;

    const dropdowns = [document.getElementById("pokemon1"), document.getElementById("pokemon2"), document.getElementById("pokemon3"), document.getElementById("pokemon4"), document.getElementById("pokemon5"), document.getElementById("pokemon6")];

    dropdowns.forEach(dropdown => {
      pokemonList.forEach(pokemon => {
        const option = document.createElement("option");
        option.value = pokemon.id;
        option.textContent = pokemon.nome;
        dropdown.appendChild(option);
      });

      // Adiciona um listener para exibir a imagem ao selecionar o Pokémon
      dropdown.addEventListener("change", function () {
        const selectedPokemonId = dropdown.value;
        const imageElement = document.getElementById(dropdown.id + "-image");
        imageElement.src = `${pokemonImageBaseURL}/${selectedPokemonId}/picture`;
      });

      // Adiciona um listener para exibir os detalhes do Pokémon ao clicar na imagem
      const imageElement = document.getElementById(dropdown.id + "-image");
      imageElement.addEventListener("click", () => {
        const pokemonName = dropdown.selectedOptions[0].textContent || "bulbasaur";
        showPokemonDetails(pokemonName);
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
    const response = await fetch(`${apiURL}/${pokemonName.toLowerCase()}`);
    const data = await response.json();

    document.getElementById("pokemon-name").textContent = pokemonName.toUpperCase();

    // Limpa o conteúdo anterior
    const detailsContainer = document.getElementById("pokemon-details");
    detailsContainer.innerHTML = "";

    // Cria uma tabela para exibir as informações
    const table = document.createElement("table");
    table.classList.add("pokemon-details-table");

    // Itera sobre cada campo de data e adiciona uma linha à tabela
    const excludedKeys = ["name_or_id", "cur_hp", "ivs", "evs", "status", "nickname", "friendship", "item"];
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

// Evento para enviar os dados da batalha ao clicar no botão "Batalhar"
document.getElementById('battle-form').addEventListener('submit', batalha);

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
const imageElement4 = document.getElementById("pokemon4-image");
imageElement4.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement5 = document.getElementById("pokemon5-image");
imageElement5.src = `${pokemonImageBaseURL}/1/picture`;
const imageElement6 = document.getElementById("pokemon6-image");
imageElement6.src = `${pokemonImageBaseURL}/1/picture`;