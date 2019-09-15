import { IPveMoveTemplate, IPvpMoveTemplate } from '../interfaces';

export class Move {
  public id: string;
  public type: string;

  public pveStats: {
    power: number,
    energyDelta: number,
    castTime: number,
  };

  public pvpStats: {
    power: number,
    energyDelta: number,
    turns: number,
  };

  constructor() {
    this.id = 'UNKNOWN';
    this.type = 'UNKNOWN';
    this.pveStats = {
      power: 0,
      energyDelta: -100,
      castTime: 100000,
    };
    this.pvpStats = {
      power: 0,
      energyDelta: -100,
      turns: 100,
    };
  }

  /**
   * Updates PVE stats with provided data.
   */
  public updatePveStats(pveSource: IPveMoveTemplate): void {
    this.id = pveSource.moveSettings.movementId;
    this.type = pveSource.moveSettings.pokemonType.split('_', 3)[2]; // remove the `POKEMON_` prefix
    this.pveStats = {
      power: pveSource.moveSettings.power,
      energyDelta: pveSource.moveSettings.energyDelta,
      castTime: pveSource.moveSettings.durationMs,
    };
  }

  /**
   * Updates PVP stats with provided data.
   */
  public updatePvpStats(pveSource: IPvpMoveTemplate): void {
    this.id = pveSource.combatMove.uniqueId;
    this.type = pveSource.combatMove.type.split('_', 3)[2]; // remove the `POKEMON_` prefix
    this.pvpStats = {
      power: pveSource.combatMove.power,
      energyDelta: pveSource.combatMove.energyDelta,
      turns: pveSource.combatMove.durationTurns || 1,
    };
  }
}
