import { createQueryKeyStore } from "@lukemorales/query-key-factory";

import { pokemonApi } from "./api.pokemon";

import { Pokemon } from "@models/pokemon.type";

export const pokemonKeys = createQueryKeyStore({
  pokemon: {
    detail: (id: number) => ({
      queryKey: [id],
      queryFn: () => pokemonApi.getPokemon(id),
    }),
    list: (filters: Pokemon[], limit: number, offset: number) => ({
      queryKey: [{ filters, limit, offset }],
      queryFn: () => pokemonApi.getPokemonList({ limit, offset }),
    }),
  },
});
