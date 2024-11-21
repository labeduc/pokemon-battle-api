import traceback
import poke_battle_sim as pb
import json
import random

pb.PokeSim._pokemon_stats.append(
    [
        494,
        "pamparuga",
        "ground",
        "grass",
        150,
        200,
        280,
        150,
        200,
        100,
        35,
        4000,
        670,
        1,
    ]
)
pb.PokeSim._pokemon_stats.append(
    [
        495,
        "posporuga",
        "ground",
        "grass",
        150,
        200,
        250,
        120,
        200,
        100,
        35,
        4000,
        670,
        1,
    ]
)

pb.PokeSim._name_to_id["pamparuga"] = 494


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

    turns = 0
    while not battle.is_finished():
        try:
            results.append(
                f"P1: {battle.t1.current_poke.id}: {battle.t1.current_poke.cur_hp} "
            )
            results.append(
                f"P2: {battle.t2.current_poke.id}: {battle.t2.current_poke.cur_hp}"
            )
            t1_avail_moves = battle.t1.current_poke.get_available_moves()
            t2_avail_moves = battle.t2.current_poke.get_available_moves()

            if t1_avail_moves:
                t1m = random.choice(t1_avail_moves)
            if t2_avail_moves:
                t2m = random.choice(t2_avail_moves)

            if t1m and t2m:
                battle.turn(["move", t1m.name], ["move", t2m.name])
                for item in battle.get_cur_text():
                    results.append(item)
            else:
                if not t1m:
                    results.append(
                        f"{battle.t1.current_poke.name} does not have moves!"
                    )

                if not t2m:
                    results.append(
                        f"{battle.t2.current_poke.name} does not have moves!"
                    )
        except:
            print(traceback.format_exc())
            if not battle.t1.can_use_move(t1m):
                results.append(f"{battle.t1.current_poke.name} is confused!")
            if not battle.t2.can_use_move(t2m):
                results.append(f"{battle.t2.current_poke.name} is confused!")
            turns += 1
            if turns == 5:
                break

    if turns == 5:
        results.append("The battle was a draw!")
    else:
        results.append(battle.get_winner().name + " wins!")

    return results
