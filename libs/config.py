# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

# Initialize the variables

THROTTLE_RATE = 100
THROTTLE_RATE_EXT = 50
THROTTLE_TIME = 60

POKEMON_IMAGE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{}.png"
POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/{}"

# Load the environment variables
load_dotenv()


# -------------------------------------------------
# API Documentation
# -------------------------------------------------

tags_metadata = [
    {
        "name": "Status",
        "description": "Endpoint para exibir o status da API.",
    },
    {
        "name": "Pokemons",
        "description": "Endpoints para acessar dados dos pokemons.",
    },
    {
        "name": "Batalhas",
        "description": "Endpoints para executar batalhas.",
    },
]
