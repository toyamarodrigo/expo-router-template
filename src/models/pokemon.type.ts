import { z } from "zod";

// PokeAPI response schemas. Only the fields the UI uses are validated.
export const pokemonApiResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  sprites: z.object({
    other: z.object({
      "official-artwork": z.object({
        front_default: z.string().nullable(),
      }),
    }),
  }),
  types: z.array(z.object({ type: z.object({ name: z.string() }) })).min(1),
  abilities: z.array(z.object({ ability: z.object({ name: z.string() }) })),
  stats: z.array(z.object({ base_stat: z.number(), stat: z.object({ name: z.string() }) })),
});

export const pokemonListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.object({ name: z.string(), url: z.string() })),
});

export type PokemonApiResponse = z.infer<typeof pokemonApiResponseSchema>;
export type PokemonList = z.infer<typeof pokemonListSchema>;

export type Pokemon = {
  id: number;
  name: string;
  image: string | null;
  type: string;
  height: number;
  weight: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};
