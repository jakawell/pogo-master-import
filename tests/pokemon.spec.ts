import { IPokemonTemplate } from '../src/interfaces';
import { PokemonSpecies, Pokemon } from '../src/models';
import fakeGameMaster from './mockData/mockGameMaster.json';

let pokemon: Pokemon;

beforeEach(() => {
  const species = PokemonSpecies.fromRawMaster(fakeGameMaster.itemTemplates[0] as IPokemonTemplate, 3);
  pokemon = new Pokemon(species, 15.5, 10, 11, 12);
});

test('should import all fields properly', () => {
  expect(pokemon.species.pokedexNumber).toBe(3);
  expect(pokemon.species.id).toBe('VENUSAUR_NORMAL');
  expect(pokemon.level).toBe(15.5);
  expect(pokemon.attackIv).toBe(10);
  expect(pokemon.defenseIv).toBe(11);
  expect(pokemon.staminaIv).toBe(12);
  expect(Math.floor(pokemon.attack)).toBe(109);
  expect(Math.floor(pokemon.defense)).toBe(105);
  expect(Math.floor(pokemon.stamina)).toBe(106);
  expect(pokemon.cpMultiplier).toBe(0.5259425113);
  expect(pokemon.cp).toBe(1156);
});
