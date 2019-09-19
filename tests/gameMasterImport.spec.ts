import fs from 'fs';
import mockGameMaster from './mockData/mockGameMaster.json';
jest.spyOn(fs, 'writeFile').mockImplementation((file, data, callback) => {
  if ((file as string).endsWith('invalidFile.json')) {
    callback(new Error('Mock write error'));
  } else {
    callback(null);
  }
});
jest.spyOn(fs, 'readFile').mockImplementation((file, callback) => {
  if ((file as string).endsWith('invalidFile.json')) {
    callback(new Error('Mock read error'), Buffer.alloc(0));
  } else if ((file as string).endsWith('invalidFormat.json')) {
    callback(null, Buffer.from('??'));
  } else {
    callback(null, Buffer.from(JSON.stringify(mockGameMaster)));
  }
});
import PokemongoGameMaster from 'pokemongo-game-master';
import { IGameMasterImportOptions } from '../src/interfaces';
import { GameMasterImport, PokemonSpecies, Move } from '../src/models';

beforeEach(() => {
  jest.spyOn(PokemongoGameMaster, 'getVersion').mockResolvedValue(mockGameMaster);
});

afterAll(() => {
  jest.restoreAllMocks();
});

function expectGoodLists(speciesList: Map<string, PokemonSpecies>, movesList: Map<string, Move>) {
  expect(speciesList.size).toBe(3);
  expect(Array.from<string>(speciesList.keys())).toEqual([
    'VENUSAUR_NORMAL',
    'BLASTOISE_NORMAL',
    'GIRATINA_ALTERED',
  ]);
  expect(movesList.size).toBe(2);
  expect(Array.from<string>(movesList.keys())).toEqual([
    'FRENZY_PLANT',
    'RAZOR_LEAF_FAST',
  ]);
}

test('should import data from parsed game master', () => {
  const imported = GameMasterImport.importFromSaved({
    species: {
      VENUSAUR_NORMAL: {
        pokedexNumber: 3,
        speciesId: 'VENUSAUR',
        form: 'NORMAL',
        speciesName: 'Venusaur',
        types: ['GRASS', 'POISON'],
        fastMoves: ['RAZOR_LEAF_FAST', 'VINE_WHIP_FAST'],
        chargeMoves: ['SLUDGE_BOMB', 'PETAL_BLIZZARD', 'SOLAR_BEAM', 'RETURN', 'FRUSTRATION'],
        baseAttack: 198,
        baseDefense: 189,
        baseStamina: 190,
        isFormless: false,
      },
    },
    moves: {
      WRAP: {
        id: 'WRAP',
        type: 'NORMAL',
        pveStats: {
          power: 60,
          energyDelta: -33,
          castTime: 2900,
        },
        pvpStats: {
          power: 60,
          energyDelta: -45,
          turns: 1,
        },
      },
    },
  });
  expect(imported.speciesList.size).toBe(1);
  expect((imported.speciesList.get('VENUSAUR_NORMAL') as PokemonSpecies).speciesId).toBe('VENUSAUR');
  expect(imported.movesList.size).toBe(1);
  expect((imported.movesList.get('WRAP') as Move).pvpStats.energyDelta).toBe(-45);
});

test('should download and import game master', async () => {
  const options: IGameMasterImportOptions = {
    download: true,
    downloadVersion: 'latest',
    localSourcePath: './master.json',
    save: true,
    saveFile: './master.json',
    language: 'en-us',
  };
  const { speciesList, movesList } = await GameMasterImport.importGameMaster(options);
  expectGoodLists(speciesList, movesList);
  expect((speciesList.get('VENUSAUR_NORMAL') as PokemonSpecies).pokedexNumber).toBe(3);
  expect((speciesList.get('VENUSAUR_NORMAL') as PokemonSpecies).speciesName).toBe('Venusaur');

  const importer = new GameMasterImport(options);
  const { speciesList: speciesListCons, movesList: movesListCons } = await importer.importGameMaster();
  expectGoodLists(speciesListCons, movesListCons);
  expect((speciesListCons.get('VENUSAUR_NORMAL') as PokemonSpecies).pokedexNumber).toBe(3);
  expect((speciesListCons.get('VENUSAUR_NORMAL') as PokemonSpecies).speciesName).toBe('Venusaur');
});

test('should load file and import game master', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: 'latest',
    localSourcePath: './master.json',
    save: true,
    saveFile: './master.json',
    language: 'en-us',
  };
  const { speciesList, movesList } = await GameMasterImport.importGameMaster(options);
  expectGoodLists(speciesList, movesList);
  expect((speciesList.get('VENUSAUR_NORMAL') as PokemonSpecies).pokedexNumber).toBe(3);
  expect((speciesList.get('VENUSAUR_NORMAL') as PokemonSpecies).speciesName).toBe('Venusaur');

  const importer = new GameMasterImport(options);
  const { speciesList: speciesListCons, movesList: movesListCons } = await importer.importGameMaster();
  expectGoodLists(speciesListCons, movesListCons);
  expect((speciesListCons.get('VENUSAUR_NORMAL') as PokemonSpecies).pokedexNumber).toBe(3);
  expect((speciesListCons.get('VENUSAUR_NORMAL') as PokemonSpecies).speciesName).toBe('Venusaur');
});

test('should accept no options', async () => {
  const { speciesList, movesList } = await GameMasterImport.importGameMaster();
  expectGoodLists(speciesList, movesList);

  const importer = new GameMasterImport();
  const { speciesList: speciesListCons, movesList: movesListCons } = await importer.importGameMaster();
  expectGoodLists(speciesListCons, movesListCons);
});

test('should fail for invalid save location', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: 'latest',
    localSourcePath: './master.json',
    save: true,
    saveFile: 'invalidFile.json',
    language: undefined,
  };
  await expect(GameMasterImport.importGameMaster(options))
    .rejects.toHaveProperty('message', 'Failed to save game master to local file: Error: Mock write error');
});

test('should fail for no save location', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: 'latest',
    localSourcePath: './master.json',
    save: true,
    saveFile: '',
    language: undefined,
  };
  await expect(GameMasterImport.importGameMaster(options))
    .rejects.toHaveProperty('message', 'No save path was provided. Set "options.saveFile"');
});

test('should fail for invalid local source path', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: undefined,
    localSourcePath: 'invalidFile.json',
    save: true,
    saveFile: './master.json',
    language: undefined,
  };
  await expect(GameMasterImport.importGameMaster(options))
    .rejects.toHaveProperty('message', 'Failed to read game master from local file: Error: Mock read error');
});

test('should fail for no local source path', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: undefined,
    localSourcePath: '',
    save: true,
    saveFile: './master.json',
    language: undefined,
  };
  await expect(GameMasterImport.importGameMaster(options))
    .rejects.toHaveProperty('message', 'No source path was provided. Set "options.localSourcePath".');
});

test('should fail for badly formatted local source path', async () => {
  const options: IGameMasterImportOptions = {
    download: false,
    downloadVersion: undefined,
    localSourcePath: 'invalidFormat.json',
    save: true,
    saveFile: './master.json',
    language: undefined,
  };
  await expect(GameMasterImport.importGameMaster(options))
    // tslint:disable-next-line: max-line-length
    .rejects.toHaveProperty('message', `Failed to read game master from local file: Error: Failed to parse game master from local file: SyntaxError: Unexpected token ? in JSON at position 0`);
});
