import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ZodError } from "zod";

import { pokemonApi } from "./api.pokemon";
import { HttpError } from "./http";

const bulbasaur = {
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  sprites: {
    front_default: "https://example.com/sprites/1.png",
    other: {
      "official-artwork": {
        front_default: "https://example.com/artwork/1.png",
      },
    },
  },
  types: [
    { slot: 1, type: { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" } },
    { slot: 2, type: { name: "poison", url: "https://pokeapi.co/api/v2/type/4/" } },
  ],
  abilities: [{ ability: { name: "overgrow", url: "" }, is_hidden: false, slot: 1 }],
  stats: [
    { base_stat: 45, effort: 0, stat: { name: "hp", url: "" } },
    { base_stat: 49, effort: 0, stat: { name: "attack", url: "" } },
    { base_stat: 49, effort: 0, stat: { name: "defense", url: "" } },
    { base_stat: 65, effort: 1, stat: { name: "special-attack", url: "" } },
    { base_stat: 65, effort: 0, stat: { name: "special-defense", url: "" } },
    { base_stat: 45, effort: 0, stat: { name: "speed", url: "" } },
  ],
};

const pokemonList = {
  count: 1302,
  next: "https://pokeapi.co/api/v2/pokemon?offset=2&limit=2",
  previous: null,
  results: [
    { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
    { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
  ],
};

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<typeof fetch>();

function respondWith(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe("pokemonApi", () => {
  beforeEach(() => {
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = originalFetch;
  });

  it("transforms a valid Pokemon response", async () => {
    respondWith(bulbasaur);

    const pokemon = await pokemonApi.getPokemon(1);

    expect(fetchMock).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/1");
    expect(pokemon.name).toBe("bulbasaur");
    expect(pokemon.type).toBe("grass");
    expect(pokemon.image).toBe("https://example.com/artwork/1.png");
    expect(pokemon.stats).toEqual({
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
    });
  });

  it("returns a null image when the artwork is missing", async () => {
    respondWith({
      ...bulbasaur,
      sprites: { ...bulbasaur.sprites, other: { "official-artwork": { front_default: null } } },
    });

    const pokemon = await pokemonApi.getPokemon(1);

    expect(pokemon.image).toBeNull();
  });

  it("rejects with HttpError on a 404 status", async () => {
    respondWith({ detail: "Not found." }, 404);

    const error = await pokemonApi.getPokemon(99999).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(404);
  });

  it("rejects with a Zod error on an invalid body", async () => {
    respondWith({ ...bulbasaur, types: [] });

    await expect(pokemonApi.getPokemon(1)).rejects.toBeInstanceOf(ZodError);
  });

  it("returns a valid paginated Pokemon list", async () => {
    respondWith(pokemonList);

    const list = await pokemonApi.getPokemonList({ limit: 2, offset: 0 });

    expect(fetchMock).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon?limit=2&offset=0");
    expect(list.previous).toBeNull();
    expect(list.results).toEqual(pokemonList.results);
  });
});
