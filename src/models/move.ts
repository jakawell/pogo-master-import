import { IPveMoveTemplate, IPvpMoveTemplate } from '../interfaces';
import { TranslatorService } from '../services';

export class Move {
  public id: string;
  public name: string;
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
    this.name = TranslatorService.translate('UNKOWN');
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
  public updatePveStats(pveSource: IPveMoveTemplate, language?: string): void {
    this.id = pveSource.moveSettings.movementId;
    this.name = TranslatorService.translate(this.id, language);
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
  public updatePvpStats(pveSource: IPvpMoveTemplate, language?: string): void {
    this.id = pveSource.combatMove.uniqueId;
    this.name = TranslatorService.translate(this.id, language);
    this.type = pveSource.combatMove.type.split('_', 3)[2]; // remove the `POKEMON_` prefix
    this.pvpStats = {
      power: pveSource.combatMove.power,
      energyDelta: pveSource.combatMove.energyDelta,
      turns: pveSource.combatMove.durationTurns || 1,
    };
  }
}
