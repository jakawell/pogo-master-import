import { IPokemonTemplate } from '../src/interfaces';
import { PokemonSpecies } from '../src/models';
import fakeGameMaster from './mockData/mockGameMaster.json';

test('should import all fields properly from raw game master', () => {
  const species = PokemonSpecies.fromRawMaster(fakeGameMaster.itemTemplates[0] as unknown as IPokemonTemplate);
  expect(species.speciesId).toBe('VENUSAUR');
  expect(species.form).toBe('SHADOW');
  expect(species.id).toBe('VENUSAUR_SHADOW');
  expect(species.speciesName).toBe('Venusaur Shadow');
  expect(species.types).toEqual(['GRASS', 'POISON']);
  expect(species.fastMoves).toEqual(['RAZOR_LEAF_FAST', 'VINE_WHIP_FAST']);
  expect(species.chargeMoves).toEqual(['SLUDGE_BOMB', 'PETAL_BLIZZARD', 'SOLAR_BEAM', 'RETURN', 'FRUSTRATION']);
  expect(species.baseAttack).toBe(198);
  expect(species.baseDefense).toBe(189);
  expect(species.baseStamina).toBe(190);
});

test('should import all fields properly from parsed', () => {
  const species = PokemonSpecies.fromParsed({
    speciesId: 'VENUSAUR',
    form: 'SHADOW',
    speciesName: 'Venusaur Shadow',
    types: ['GRASS', 'POISON'],
    fastMoves: ['RAZOR_LEAF_FAST', 'VINE_WHIP_FAST'],
    chargeMoves: ['SLUDGE_BOMB', 'PETAL_BLIZZARD', 'SOLAR_BEAM', 'RETURN', 'FRUSTRATION'],
    baseAttack: 198,
    baseDefense: 189,
    baseStamina: 190,
    isFormless: false,
  } as PokemonSpecies);
  expect(species.speciesId).toBe('VENUSAUR');
  expect(species.form).toBe('SHADOW');
  expect(species.id).toBe('VENUSAUR_SHADOW');
  expect(species.speciesName).toBe('Venusaur Shadow');
  expect(species.types).toEqual(['GRASS', 'POISON']);
  expect(species.fastMoves).toEqual(['RAZOR_LEAF_FAST', 'VINE_WHIP_FAST']);
  expect(species.chargeMoves).toEqual(['SLUDGE_BOMB', 'PETAL_BLIZZARD', 'SOLAR_BEAM', 'RETURN', 'FRUSTRATION']);
  expect(species.baseAttack).toBe(198);
  expect(species.baseDefense).toBe(189);
  expect(species.baseStamina).toBe(190);
});
