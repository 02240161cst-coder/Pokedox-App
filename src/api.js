
const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemonDetails(id) {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error('Unable to load Pokémon details.');
  }

  return response.json();
}