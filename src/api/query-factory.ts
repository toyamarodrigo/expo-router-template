import { createQueryKeyStore } from "@lukemorales/query-key-factory";

import { pokemonApi } from "./api.pokemon";

export const pokemonKeys = createQueryKeyStore({
  pokemon: {
    detail: (id: number) => ({
      queryKey: [id],
      queryFn: () => pokemonApi.getPokemon(id),
    }),
    list: (limit: number, offset: number) => ({
      queryKey: [{ limit, offset }],
      queryFn: () => pokemonApi.getPokemonList({ limit, offset }),
    }),
  },
});
