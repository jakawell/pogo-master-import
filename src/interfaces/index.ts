export interface IItemTemplate {
  templateId: string;
}

export interface IPokemonTemplate extends IItemTemplate {
  pokemonSettings: {
    pokemonId: string,
    type: string,
    type2: string,
    stats: {
      baseStamina: number,
      baseAttack: number,
      baseDefense: number,
    },
    quickMoves: string[],
    cinematicMoves: string[],
    shadow: {
      purifiedChargeMove: string,
      shadowChargeMove: string,
    } | undefined,
    form: string,
  };
}

export interface IPveMoveTemplate extends IItemTemplate {
  moveSettings: {
    movementId: string,
    pokemonType: string,
    power: number,
    staminaLossScalar: number,
    durationMs: number,
    damageWindowStartMs: number,
    damageWindowEndMs: number,
    energyDelta: number,
  };
}

export interface IPvpMoveTemplate extends IItemTemplate {
  combatMove: {
    uniqueId: string,
    type: string,
    power: number,
    energyDelta: number,
    durationTurns: number | undefined,
  };
}

export interface IGameMaster {
  itemTemplates: IItemTemplate[];
}

export { IGameMasterImportOptions } from '../models/gameMasterImport';
