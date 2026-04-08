import { Pokemon } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export async function getAllPokemonNames(): Promise<{ name: string; url: string }[]> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=10000`);
  const data = await response.json();
  
  return data.results.filter((p: any) => {
    const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
    
    // Especies base (1 a 1025+)
    if (id < 10000) return true;
    
    // Variantes y formas regionales (IDs >= 10000)
    const name = p.name;
    if (name.includes('-totem') || name.includes('-cap') || name.includes('-gmax') || name.includes('-mega')) {
      return false;
    }
    
    if (name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea')) {
      return true;
    }
    
    return false;
  });
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
  let bst = 0;
  data.stats.forEach((s: any) => {
    stats[s.stat.name] = s.base_stat;
    bst += s.base_stat;
  });

  const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  let region = REGIONS[genId - 1] || 'Desconocida';

  if (data.name.includes('-alola')) region = 'Alola';
  if (data.name.includes('-galar')) region = 'Galar';
  if (data.name.includes('-hisui')) region = 'Hisui';
  if (data.name.includes('-paldea')) region = 'Paldea';

  let evolutionStage = 'Básico';
  try {
    if (speciesData.evolution_chain) {
      const evoRes = await fetch(speciesData.evolution_chain.url);
      const evoData = await evoRes.json();
      
      const checkStage = (chain: any, target: string): string => {
        if (chain.species.name === target) return speciesData.is_baby ? 'Bebé' : 'Básico';
        for (const evo1 of chain.evolves_to) {
          if (evo1.species.name === target) return 'Fase 1';
          for (const evo2 of evo1.evolves_to) {
            if (evo2.species.name === target) return 'Fase 2';
          }
        }
        return 'Básico';
      };
      evolutionStage = checkStage(evoData.chain, speciesData.name);
    }
  } catch (e) {
    console.error("Error fetching evolution chain", e);
  }

  const PSEUDO_LEGENDARIES = ['dragonite', 'tyranitar', 'salamence', 'metagross', 'garchomp', 'hydreigon', 'goodra', 'kommo-o', 'dragapult', 'baxcalibur'];
  const PARADOX = ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon', 'iron-treads', 'iron-bundle', 'iron-hands', 'iron-jugulis', 'iron-moth', 'iron-thorns', 'iron-valiant', 'walking-wake', 'iron-leaves', 'gouging-fire', 'raging-bolt', 'iron-boulder', 'iron-crown'];
  const ULTRA_BEASTS = ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord', 'poipole', 'naganadel', 'stakataka', 'blacephalon'];

  let rarity = 'Común';
  if (speciesData.is_mythical) rarity = 'Mítico';
  else if (speciesData.is_legendary) rarity = 'Legendario';
  else if (PARADOX.includes(data.name)) rarity = 'Paradoja';
  else if (PSEUDO_LEGENDARIES.includes(data.name)) rarity = 'Pseudo-Leg.';
  else if (ULTRA_BEASTS.includes(data.name)) rarity = 'Ultraente';

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
    bst,
    evolutionStage,
    region,
    rarity,
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
