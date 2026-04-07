export interface Pokemon {
  name: string;
  url: string;
  id: number;
  types: string[];
  weight: number;
  height: number;
  generation: number;
  color: string;
  imageUrl: string;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  stats: { [key: string]: number };
  shape: string;
}

export interface Category {
  id: string;
  label: string;
  type: 'type' | 'gen' | 'weight' | 'height' | 'color' | 'attribute' | 'stat' | 'shape';
  value: any;
}

export type Player = 'X' | 'O';

export interface CellState {
  player: Player | null;
  pokemon: Pokemon | null;
}

export const ALL_CATEGORIES: Category[] = [
  // Types
  { id: 'fire', label: 'Tipo Fuego', type: 'type', value: 'fire' },
  { id: 'water', label: 'Tipo Agua', type: 'type', value: 'water' },
  { id: 'grass', label: 'Tipo Planta', type: 'type', value: 'grass' },
  { id: 'electric', label: 'Tipo Eléctrico', type: 'type', value: 'electric' },
  { id: 'flying', label: 'Tipo Volador', type: 'type', value: 'flying' },
  { id: 'psychic', label: 'Tipo Psíquico', type: 'type', value: 'psychic' },
  { id: 'fighting', label: 'Tipo Lucha', type: 'type', value: 'fighting' },
  { id: 'poison', label: 'Tipo Veneno', type: 'type', value: 'poison' },
  { id: 'ground', label: 'Tipo Tierra', type: 'type', value: 'ground' },
  { id: 'rock', label: 'Tipo Roca', type: 'type', value: 'rock' },
  { id: 'ice', label: 'Tipo Hielo', type: 'type', value: 'ice' },
  { id: 'bug', label: 'Tipo Bicho', type: 'type', value: 'bug' },
  { id: 'dragon', label: 'Tipo Dragón', type: 'type', value: 'dragon' },
  { id: 'ghost', label: 'Tipo Fantasma', type: 'type', value: 'ghost' },
  { id: 'steel', label: 'Tipo Acero', type: 'type', value: 'steel' },
  { id: 'fairy', label: 'Tipo Hada', type: 'type', value: 'fairy' },
  { id: 'dark', label: 'Tipo Siniestro', type: 'type', value: 'dark' },
  { id: 'normal', label: 'Tipo Normal', type: 'type', value: 'normal' },

  // Generations
  { id: 'gen1', label: 'Generación 1', type: 'gen', value: 1 },
  { id: 'gen2', label: 'Generación 2', type: 'gen', value: 2 },
  { id: 'gen3', label: 'Generación 3', type: 'gen', value: 3 },
  { id: 'gen4', label: 'Generación 4', type: 'gen', value: 4 },
  { id: 'gen5', label: 'Generación 5', type: 'gen', value: 5 },
  { id: 'gen6', label: 'Generación 6', type: 'gen', value: 6 },
  { id: 'gen7', label: 'Generación 7', type: 'gen', value: 7 },
  { id: 'gen8', label: 'Generación 8', type: 'gen', value: 8 },
  { id: 'gen9', label: 'Generación 9', type: 'gen', value: 9 },

  // Physical
  { id: 'heavy', label: 'Pesa > 100kg', type: 'weight', value: 'heavy' },
  { id: 'light', label: 'Pesa < 10kg', type: 'weight', value: 'light' },
  { id: 'tall', label: 'Mide > 2m', type: 'height', value: 'tall' },
  { id: 'short', label: 'Mide < 0.5m', type: 'height', value: 'short' },

  // Colors
  { id: 'blue', label: 'Color Azul', type: 'color', value: 'blue' },
  { id: 'red', label: 'Color Rojo', type: 'color', value: 'red' },
  { id: 'green', label: 'Color Verde', type: 'color', value: 'green' },
  { id: 'yellow', label: 'Color Amarillo', type: 'color', value: 'yellow' },
  { id: 'pink', label: 'Color Rosa', type: 'color', value: 'pink' },
  { id: 'purple', label: 'Color Morado', type: 'color', value: 'purple' },
  { id: 'black', label: 'Color Negro', type: 'color', value: 'black' },
  { id: 'white', label: 'Color Blanco', type: 'color', value: 'white' },

  // Attributes
  { id: 'legendary', label: 'Legendario/Mítico', type: 'attribute', value: 'legendary' },
  { id: 'baby', label: 'Pokémon Bebé', type: 'attribute', value: 'baby' },
  
  // Stats
  { id: 'fast', label: 'Velocidad > 100', type: 'stat', value: 'speed' },
  { id: 'tank', label: 'HP > 100', type: 'stat', value: 'hp' },
  { id: 'strong', label: 'Ataque > 100', type: 'stat', value: 'attack' },

  // Shapes
  { id: 'quadruped', label: 'Cuadrúpedo', type: 'shape', value: 'quadruped' },
  { id: 'bipedal', label: 'Bípedo', type: 'shape', value: 'bipedal-tail' },
  { id: 'wings', label: 'Con Alas', type: 'shape', value: 'wings' },
];
