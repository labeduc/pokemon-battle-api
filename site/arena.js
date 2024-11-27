document.addEventListener("DOMContentLoaded", () => {
  const csvUpload = document.getElementById("csv-upload");
  const processCsvButton = document.getElementById("process-csv");
  const battleListSection = document.getElementById("battle-list-section");
  const battleList = document.getElementById("battle-list");
  const startBattlesButton = document.getElementById("start-battles");
  const roundsModal = document.getElementById("rounds-modal");
  const closeModal = document.getElementById("close-modal");
  const roundsContent = document.getElementById("rounds-content");
  const results = [];

  let battles = []; // Lista de batalhas carregadas do CSV

  // Processar o arquivo CSV
  processCsvButton.addEventListener("click", () => {
    if (!csvUpload.files.length) {
      alert("Por favor, selecione um arquivo CSV.");
      return;
    }

    const file = csvUpload.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const lines = event.target.result.split("\n");
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
      });

      battleListSection.classList.remove("hidden");
      startBattlesButton.classList.remove("hidden");
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

  // Fechar modal
  closeModal.addEventListener("click", () => {
    roundsModal.style.display = "none";
  });
});
