import PokemongoGameMaster from 'pokemongo-game-master';
import mockGameMaster from './mockData/mockGameMaster.json';
const consoleSpy = jest.spyOn(console, 'log');
let masterSpy: jest.SpyInstance;

beforeEach(() => {
  masterSpy = jest.spyOn(PokemongoGameMaster, 'getVersion').mockResolvedValue(mockGameMaster);
});

afterEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('should run successfully', async () => {
  await require('../src/index');
  expect(consoleSpy).toBeCalled();
});
