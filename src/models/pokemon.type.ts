export type Pokemon = {
  id: number;
  name: string;
  image: string;
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

export type PokemonApiResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
};

export type PokemonList = {
  count: number;
  next: string;
  previous: string;
  results: PokemonListItem[];
};

type PokemonListItem = {
  name: string;
  url: string;
};
