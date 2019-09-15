import { IPokemonTemplate } from '../interfaces';

export class PokemonSpecies {
  public static generateId(speciesId: string, form: string): string {
    return `${speciesId}_${form}`;
  }

  public speciesId: string;
  public form: string;
  public types: string[];
  public fastMoves: string[];
  public chargeMoves: string[];
  public baseAttack: number;
  public baseDefense: number;
  public baseStamina: number;
  /**
   * Tracks if species was created without a specified form.
   */
  public isFormless: boolean = false;

  public get id() {
    return PokemonSpecies.generateId(this.speciesId, this.form);
  }

  public constructor(source: IPokemonTemplate) {
    this.speciesId = source.pokemonSettings.pokemonId;
    this.form = (source.pokemonSettings.form || 'NORMAL').replace(this.speciesId + '_', '');
    if (!source.pokemonSettings.form) { // default pokemon with no set form to "NORMAL", but mark them in case we need to remove them later
      this.isFormless = true;
    }
    this.types = [
      (source.pokemonSettings.type).split('_', 3)[2], // remove the `POKEMON_TYPE` prefix,
      (source.pokemonSettings.type2 || '').split('_', 3)[2], // remove the `POKEMON_TYPE` prefix,
    ];
    this.fastMoves = source.pokemonSettings.quickMoves;
    this.chargeMoves = source.pokemonSettings.cinematicMoves;
    this.baseAttack = source.pokemonSettings.stats.baseAttack;
    this.baseDefense = source.pokemonSettings.stats.baseDefense;
    this.baseStamina = source.pokemonSettings.stats.baseStamina;

    if (source.pokemonSettings.shadow) {
      this.chargeMoves.push(source.pokemonSettings.shadow.purifiedChargeMove);
      this.chargeMoves.push(source.pokemonSettings.shadow.shadowChargeMove);
    }
  }
}
