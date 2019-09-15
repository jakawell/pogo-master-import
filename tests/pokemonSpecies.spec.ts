import { IPokemonTemplate } from '../src/interfaces';
import { PokemonSpecies } from '../src/models';
import fakeGameMaster from './mockData/mockGameMaster.json';

let species: PokemonSpecies;

beforeEach(() => {
  species = new PokemonSpecies(fakeGameMaster.itemTemplates[0] as unknown as IPokemonTemplate);
});

test('should import all fields properly', () => {
  expect(species.speciesId).toBe('VENUSAUR');
  expect(species.form).toBe('SHADOW');
  expect(species.id).toBe('VENUSAUR_SHADOW');
  expect(species.types).toEqual(['GRASS', 'POISON']);
  expect(species.fastMoves).toEqual(['RAZOR_LEAF_FAST', 'VINE_WHIP_FAST']);
  expect(species.chargeMoves).toEqual(['SLUDGE_BOMB', 'PETAL_BLIZZARD', 'SOLAR_BEAM', 'RETURN', 'FRUSTRATION']);
  expect(species.baseAttack).toBe(198);
  expect(species.baseDefense).toBe(189);
  expect(species.baseStamina).toBe(190);
});
