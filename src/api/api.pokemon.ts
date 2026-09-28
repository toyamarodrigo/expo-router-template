import { pokemonApiConfig } from "./api.config";
import { getJson } from "./http";

import { Pokemon, PokemonApiResponse, pokemonApiResponseSchema, pokemonListSchema } from "@models/pokemon.type";

type GetPokemonListParams = {
  limit: number;
  offset: number;
};

export function transformPokemonResponse(raw: PokemonApiResponse): Pokemon {
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
    const raw = await getJson(`${pokemonApiConfig.baseURL}/pokemon/${id}`, pokemonApiResponseSchema);

    return transformPokemonResponse(raw);
  },
  getPokemonList: ({ limit, offset }: GetPokemonListParams) =>
    getJson(`${pokemonApiConfig.baseURL}/pokemon?limit=${limit}&offset=${offset}`, pokemonListSchema),
};
