import { Pokemon } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getAllPokemonNames(): Promise<{ name: string; url: string }[]> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=1025`);
  const data = await response.json();
  return data.results;
}

export async function getPokemonDetails(nameOrId: string): Promise<Pokemon> {
  const res = await fetch(`${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`);
  if (!res.ok) throw new Error('Pokemon not found');
  const data = await res.json();

  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  const genUrl = speciesData.generation.url;
  const genId = parseInt(genUrl.split('/').filter(Boolean).pop() || '1');

  const stats: { [key: string]: number } = {};
  data.stats.forEach((s: any) => {
    stats[s.stat.name] = s.base_stat;
  });

  return {
    name: data.name,
    url: `${BASE_URL}/pokemon/${data.id}`,
    id: data.id,
    types: data.types.map((t: any) => t.type.name),
    weight: data.weight / 10, // convert to kg
    height: data.height / 10, // convert to m
    generation: genId,
    color: speciesData.color.name,
    imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    isLegendary: speciesData.is_legendary,
    isMythical: speciesData.is_mythical,
    isBaby: speciesData.is_baby,
    stats,
    shape: speciesData.shape?.name || '',
  };
}

export function validatePokemon(pokemon: Pokemon, rowCat: any, colCat: any): boolean {
  const check = (cat: any) => {
    switch (cat.type) {
      case 'type':
        return pokemon.types.includes(cat.value);
      case 'gen':
        return pokemon.generation === cat.value;
      case 'weight':
        if (cat.value === 'heavy') return pokemon.weight > 100;
        if (cat.value === 'light') return pokemon.weight < 10;
        return true;
      case 'height':
        if (cat.value === 'tall') return pokemon.height > 2;
        if (cat.value === 'short') return pokemon.height < 0.5;
        return true;
      case 'color':
        return pokemon.color === cat.value;
      case 'attribute':
        if (cat.value === 'legendary') return pokemon.isLegendary || pokemon.isMythical;
        if (cat.value === 'baby') return pokemon.isBaby;
        return true;
      case 'stat':
        return pokemon.stats[cat.value] > 100;
      case 'shape':
        return pokemon.shape === cat.value;
      default:
        return true;
    }
  };

  return check(rowCat) && check(colCat);
}
