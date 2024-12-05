document.addEventListener("DOMContentLoaded", () => {
  const csvUpload = document.getElementById("csv-upload");
  const processCsvButton = document.getElementById("process-csv");
  const battleListSection = document.getElementById("battle-list-section");
  const battleList = document.getElementById("battle-list");
  const startBattlesButton = document.getElementById("start-battles");
  const clearBattlesButton = document.getElementById("clear-battles");
  const battleResults = document.getElementById("show-results");
  const roundsModal = document.getElementById("rounds-modal");
  const closeModal = document.getElementById("close-modal");
  const roundsContent = document.getElementById("rounds-content");
  const results = [];
  const jogadores = {};

  let battles = []; // Lista de batalhas carregadas do CSV

  // Função para fechar a modal
  function closeCModal() {
    const modal = document.getElementById('customModal');
    const backdrop = document.getElementById('modalBackdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  function showModalWithSortedKeys(data) {
    // Ordena as chaves do objeto com base nos valores em ordem decrescente
    const sortedKeys = Object.keys(data).sort((a, b) => data[b] - data[a]);

    // Cria o conteúdo para exibir na modal
    const modalContent = `
        <div id="customModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 1000;">
            <h2>Sorted Keys</h2>
            <ul>
                ${sortedKeys.map(key => `<li>${key}: ${data[key]}</li>`).join('')}
            </ul>
            <button id="closeCButton">Close</button>
        </div>
        <div id="modalBackdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 999;"></div>
    `;

    // Insere a modal no corpo da página
    document.body.insertAdjacentHTML('beforeend', modalContent);
    document.getElementById('closeCButton').addEventListener('click', closeCModal);
  }


  // Processar o arquivo CSV
  processCsvButton.addEventListener("click", () => {
    if (!csvUpload.files.length) {
      alert("Por favor, selecione um arquivo CSV.");
      return;
    }

    const file = csvUpload.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const lines = event.target.result.split("\r\n");
      battles = lines
        .map(line => line.split(","))
        .filter(cols => cols.length === 8); // Garantir que tenha todas as colunas
      console.log(battles);
      // Exibir a lista de batalhas
      battleList.innerHTML = "";
      battles.forEach((battle, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
                    <span><strong>Batalha ${index + 1}:</strong> ${battle[0]} vs ${battle[1]}</span>
                    <a href="#" class="view-rounds" data-index="${index}">Ver Rounds</a>
                `;
        battleList.appendChild(li);
        jogadores[battle[0]] = 0;
        jogadores[battle[1]] = 0;
      });

      battleListSection.classList.remove("hidden");
      startBattlesButton.classList.remove("hidden");
      clearBattlesButton.classList.remove("hidden");
      battleResults.classList.remove("hidden");
    };

    console.log(file);
    reader.readAsText(file);
  });

  // Iniciar todas as batalhas
  startBattlesButton.addEventListener("click", async () => {
    for (const [index, battle] of battles.entries()) {
      const response = await fetch("https://batalha-pokemon-cbc1c71b98dd.herokuapp.com/batalha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treinador_1: {
            nome: battle[0],
            pokemons: [battle[2], battle[3], battle[4]]
          },
          treinador_2: {
            nome: battle[1],
            pokemons: [battle[5], battle[6], battle[7]]
          }
        })
      });

      const result = await response.json();
      const li = battleList.children[index];
      const vencedor = result['data'][result['data'].length - 1];

      jogadores[vencedor.replace(' wins!', '')] += 3;

      results.push(result['data']);
      li.innerHTML += `<span>Resultado: ${vencedor}</span>`;
    }

  });

  // Exibir rounds da batalha
  battleList.addEventListener("click", (event) => {
    if (event.target.classList.contains("view-rounds")) {
      event.preventDefault();
      const index = event.target.dataset.index;

      roundsContent.textContent = `Detalhes da Batalha ${+index + 1}:\n${JSON.stringify(
        results[index],
        null,
        2
      )}`;
      roundsModal.style.display = "block";
    }
  });

  // Exibir resultados
  battleResults.addEventListener("click", () => {
    showModalWithSortedKeys(jogadores);
  });

  // Limpar batalhas
  clearBattlesButton.addEventListener("click", () => {
    battles = [];
    battleList.innerHTML = "";
    battleListSection.classList.add("hidden");
    startBattlesButton.classList.add("hidden");
    clearBattlesButton.classList.add("hidden");
    battleResults.classList.add("hidden");
  });

  // Fechar modal
  closeModal.addEventListener("click", () => {
    roundsModal.style.display = "none";
  });
});
