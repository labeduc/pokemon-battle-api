# -*- coding: utf-8 -*-
from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Any, Literal, Optional
from enum import Enum


class Result(BaseModel):
    status: str = Field(title="Status", description="The status of the request")
    message: str = Field(title="Message", description="The message of the request")
    data: list[Any] = Field(title="Data", description="The data of the request")


class Pokemon(BaseModel):
    name_or_id: str | int
    level: int = 1
    moves: Any = []
    gender: str
    ability: Any | None = None
    nature: str = None
    cur_hp: int = None
    stats_actual: Any = None
    ivs: Any = None
    evs: Any = None
    item: str = None
    status: str = None
    nickname: str = None
    friendship: int = 0
    id: int = None


class Treinador(BaseModel):
    nome: str
    pokemons: list[str]


class Batalha(BaseModel):
    treinador_1: Treinador
    treinador_2: Treinador
