# -*- coding: utf-8 -*-
"""
    Main file to run the API
"""
from functools import wraps
from io import BytesIO
from time import time
from typing import Any

import json
import traceback

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import requests

from libs import config
from entities.base import Result, Pokemon, Batalha
from libs.battle import create_trainer, do_battle

app = FastAPI(
    title="LabEduc Pokemon Battle REST API",
    version="0.1.0",
    openapi_tags=config.tags_metadata,
)


# -------------------------------------------------
# Adding Middlewares
# -------------------------------------------------
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def time_call(request: Request, call_next):
    start_time = time()
    response = await call_next(request)
    process_time = time()
    response.headers["X-Process-Time"] = str(process_time - start_time)
    return response


def rate_limited(max_calls: int, time_frame: int):
    """
    :param max_calls: Maximum number of calls allowed in the specified time frame.
    :param time_frame: The time frame (in seconds) for which the limit applies.
    :return: Decorator function.
    """

    def decorator(func):
        calls = []

        @wraps(func)
        async def wrapper(*args, **kwargs):
            now = time()
            calls_in_time_frame = [call for call in calls if call > now - time_frame]
            if len(calls_in_time_frame) >= max_calls:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded.",
                )
            calls.append(now)
            return await func(*args, **kwargs)

        return wrapper

    return decorator


# -------------------------------------------------
# Endpoints
# -------------------------------------------------
@app.get("/", tags=["Status"], response_model=Result, operation_id="get_api_status")
async def get_api_status() -> Any:
    return {
        "status": "OK",
        "message": "LabEduc Pokemon Battle REST API está online.",
        "data": [{"version": "0.1.0"}],
    }


@app.get(
    "/pokemons",
    tags=["Pokemons"],
    response_model=Result,
    operation_id="get_all_pokemons",
)
@rate_limited(config.THROTTLE_RATE, config.THROTTLE_TIME)
async def get_all_pokemons() -> Any:
    pokemons = json.load(open("dados/pokemons.json", "r"))
    if len(pokemons) == 0:
        return {
            "status": "ERROR",
            "message": "Pokemons não encontrados.",
            "data": [],
        }

    return {
        "status": "OK",
        "message": "Pokemons listados com sucesso.",
        "data": pokemons,
    }


@app.get(
    "/pokemons/{pokemon_name_or_id}",
    tags=["Pokemons"],
    response_model=Result,
    operation_id="get_pokemons",
)
@rate_limited(config.THROTTLE_RATE, config.THROTTLE_TIME)
async def get_pokemons(pokemon_name: str) -> Any:
    pokemons = json.load(open("dados/pokemons.json", "r"))
    raw_pokemon = [x for x in pokemons if x["nome"] == pokemon_name]
    if len(raw_pokemon) == 0:
        return {
            "status": "ERROR",
            "message": "Pokemon não encontrado.",
            "data": [],
        }
    pokemon = Pokemon(
        name_or_id=raw_pokemon[0]["nome"],
        level=raw_pokemon[0]["nivel"],
        moves=raw_pokemon[0]["movimentos"],
        gender=raw_pokemon[0]["sexo"],
        ability=raw_pokemon[0]["habilidade"],
        nature=raw_pokemon[0]["natureza"],
        cur_hp=raw_pokemon[0]["cur_hp"],
        stats_actual=raw_pokemon[0]["stats"],
        image=raw_pokemon[0]["imagem"],
        id=raw_pokemon[0]["id"],
    )

    return {
        "status": "OK",
        "message": "Pokemons listados com sucesso.",
        "data": [json.loads(pokemon.model_dump_json())],
    }


@app.get(
    "/pokemons/{pokemon_id}/picture",
    tags=["Pokemons"],
    operation_id="get_pokemon",
)
@rate_limited(config.THROTTLE_RATE, config.THROTTLE_TIME)
async def get_pokemon_image(pokemon_id: int) -> Any:
    url = config.POKEMON_IMAGE_URL.format(pokemon_id)
    response = requests.get(url)

    return StreamingResponse(
        BytesIO(response.content), media_type=response.headers["content-type"]
    )


@app.post(
    "/batalha",
    tags=["Batalha"],
    operation_id="do_battle",
)
@rate_limited(config.THROTTLE_RATE, config.THROTTLE_TIME)
async def run_battle(batalha: Batalha) -> Any:
    try:
        # Battle logic here
        p1 = create_trainer(batalha.treinador_1.nome, batalha.treinador_1.pokemons)
        p2 = create_trainer(batalha.treinador_2.nome, batalha.treinador_2.pokemons)
        results = do_battle(p1, p2)
        print(results)
        return {
            "status": "OK",
            "message": "Batalha realizada com sucesso.",
            "data": results,
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "status": "ERROR",
            "message": "Erro ao realizar a batalha.",
            "data": [],
        }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
