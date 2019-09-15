import { IPokemonTemplate } from '../src/interfaces';
import { PokemonSpecies, Pokemon } from '../src/models';
import fakeGameMaster from './mockData/mockGameMaster.json';

let pokemon: Pokemon;

beforeEach(() => {
  const species = new PokemonSpecies(fakeGameMaster.itemTemplates[0] as IPokemonTemplate);
  pokemon = new Pokemon(species, 15.5, 10, 11, 12);
});

test('should import all fields properly', () => {
  expect(pokemon.species.id).toBe('VENUSAUR_SHADOW');
  expect(pokemon.level).toBe(15.5);
  expect(pokemon.attackIv).toBe(10);
  expect(pokemon.defenseIv).toBe(11);
  expect(pokemon.staminaIv).toBe(12);
  expect(pokemon.attack).toBe(198 + 10);
  expect(pokemon.defense).toBe(189 + 11);
  expect(pokemon.stamina).toBe(190 + 12);
  expect(pokemon.cpMultiplier).toBe(0.5259425113);
  expect(pokemon.cp).toBe(1156);
});
