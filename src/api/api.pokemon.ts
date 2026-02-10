import axios from "axios";

import { pokemonApiConfig } from "./api.config";

import { Pokemon, PokemonApiResponse, PokemonList } from "@models/pokemon.type";

type GetPokemonListParams = {
  limit: number;
  offset: number;
};

function transformPokemonResponse(raw: PokemonApiResponse): Pokemon {
  const statMap = Object.fromEntries(raw.stats.map((s) => [s.stat.name, s.base_stat]));

  return {
    id: raw.id,
    name: raw.name,
    image: raw.sprites.other["official-artwork"].front_default,
    type: raw.types[0].type.name,
    height: raw.height,
    weight: raw.weight,
    abilities: raw.abilities.map((a) => a.ability.name),
    stats: {
      hp: statMap["hp"] ?? 0,
      attack: statMap["attack"] ?? 0,
      defense: statMap["defense"] ?? 0,
      specialAttack: statMap["special-attack"] ?? 0,
      specialDefense: statMap["special-defense"] ?? 0,
      speed: statMap["speed"] ?? 0,
    },
  };
}

export const pokemonApi = {
  getPokemon: async (id: number) => {
    const result = await axios.get<PokemonApiResponse>(`${pokemonApiConfig.baseURL}/pokemon/${id}`);

    return transformPokemonResponse(result.data);
  },
  getPokemonList: async ({ limit, offset }: GetPokemonListParams) => {
    const result = await axios.get<PokemonList>(`${pokemonApiConfig.baseURL}/pokemon?limit=${limit}&offset=${offset}`);

    return result.data;
  },
};
