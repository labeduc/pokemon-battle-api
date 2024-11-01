import traceback
import poke_battle_sim as pb
import json
import random


def create_pokemon(name):
    try:
        pokemons = json.load(open("dados/pokemons.json", "r"))
        raw_pokemon = [x for x in pokemons if x["nome"] == name]
        if len(raw_pokemon) == 0:
            return None
        pokemon = pb.Pokemon(
            name_or_id=raw_pokemon[0]["nome"],
            level=raw_pokemon[0]["nivel"],
            moves=list(set(raw_pokemon[0]["movimentos"])),
            gender=raw_pokemon[0]["sexo"],
            ability=raw_pokemon[0]["habilidade"],
            nature=raw_pokemon[0]["natureza"],
            cur_hp=raw_pokemon[0]["cur_hp"],
            stats_actual=raw_pokemon[0]["stats"],
        )
        return pokemon
    except:
        print(raw_pokemon)
        print(traceback.format_exc())
        return None


def create_trainer(name: str, pokemon_names: list[str]):
    pokemons = [create_pokemon(p) for p in pokemon_names]
    return pb.Trainer(name, pokemons)


def do_battle(trainer1, trainer2):
    results = []
    battle = pb.Battle(trainer1, trainer2)
    battle.start()
    for item in battle.get_cur_text():
        results.append(item)

    while not battle.is_finished():
        t1m = random.choice(battle.t1.current_poke.moves)
        t2m = random.choice(battle.t2.current_poke.moves)
        battle.turn(["move", t1m.name], ["move", t2m.name])
        for item in battle.get_cur_text():
            results.append(item)

    results.append(battle.get_winner().name + " wins!")
    print(results)
    return results
