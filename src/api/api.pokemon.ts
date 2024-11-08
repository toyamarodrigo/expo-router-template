import axios from "axios";

import { pokemonApiConfig } from "./api.config";

import { Pokemon, PokemonList } from "@models/pokemon.type";

type GetPokemonListParams = {
  limit: number;
  offset: number;
};

export const pokemonApi = {
  getPokemon: async (id: number) => {
    const result = await axios.get<Pokemon>(`${pokemonApiConfig.baseURL}/pokemon/${id}`);

    return result.data;
  },
  getPokemonList: async ({ limit, offset }: GetPokemonListParams) => {
    const result = await axios.get<PokemonList>(`${pokemonApiConfig.baseURL}/pokemon?limit=${limit}&offset=${offset}`);

    return result.data;
  },
};
