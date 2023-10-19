import { useQuery } from "@tanstack/react-query";
import { pokemonKeys } from "@api/query-factory";

const usePokemonList = () => {
  const { data, isLoading, isError, error } = useQuery(
    pokemonKeys.pokemon.list([], 20, 0)
  );

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

const usePokemonDetail = (id: number) => {
  const { data, isLoading, isError, error } = useQuery(
    pokemonKeys.pokemon.detail(id)
  );

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export { usePokemonList, usePokemonDetail };
