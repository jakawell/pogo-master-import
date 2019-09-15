import { IPveMoveTemplate, IPvpMoveTemplate } from '../src/interfaces';
import { Move } from '../src/models';
import fakeGameMaster from './mockData/mockGameMaster.json';

let move: Move;

beforeEach(() => {
  move = new Move();
  move.updatePveStats(fakeGameMaster.itemTemplates[4] as IPveMoveTemplate);
  move.updatePvpStats(fakeGameMaster.itemTemplates[3] as unknown as IPvpMoveTemplate);
});

test('should import all fields properly', () => {
  expect(move.id).toBe('FRENZY_PLANT');
  expect(move.type).toBe('GRASS');

  expect(move.pveStats.power).toBe(100);
  expect(move.pveStats.energyDelta).toBe(-50);
  expect(move.pveStats.castTime).toBe(2600);

  expect(move.pvpStats.power).toBe(100);
  expect(move.pvpStats.energyDelta).toBe(-45);
  expect(move.pvpStats.turns).toBe(1);
});
