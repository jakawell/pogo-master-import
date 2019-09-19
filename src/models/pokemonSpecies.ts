import { IPokemonTemplate } from '../interfaces';
import { TranslatorService } from '../services';

export class PokemonSpecies {
  public static fromRawMaster(source: IPokemonTemplate, pokedexNumber: number, language?: string): PokemonSpecies {
    return new PokemonSpecies(source, pokedexNumber, null, language);
  }

  public static fromParsed(source: PokemonSpecies, language?: string): PokemonSpecies {
    return new PokemonSpecies(null, null, source, language);
  }

  public static generateId(speciesId: string, form: string): string {
    return `${speciesId}_${form}`;
  }

  public pokedexNumber: number;
  public speciesId: string;
  public form: string;
  public speciesName: string;
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

  private constructor(
    rawSource: IPokemonTemplate | null,
    pokedexNumber: number | null,
    parsedSource: PokemonSpecies | null,
    language?: string,
  ) {
    if (rawSource) {
      const source = rawSource;
      this.pokedexNumber = pokedexNumber as number;
      this.speciesId = source.pokemonSettings.pokemonId;
      if (source.pokemonSettings.form && // shadow/purified is not treated as a 'form' as far as stats are concerned
        (source.pokemonSettings.form.endsWith('_SHADOW') || source.pokemonSettings.form.endsWith('_PURIFIED'))) {
        source.pokemonSettings.form = 'NORMAL';
      }
      this.form = (source.pokemonSettings.form || 'NORMAL').replace(this.speciesId + '_', '');
      this.speciesName = TranslatorService.translate(this.id, language);
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
    } else {
      const source = parsedSource as PokemonSpecies;
      this.pokedexNumber = source.pokedexNumber;
      this.speciesId = source.speciesId;
      this.form = source.form;
      this.speciesName = source.speciesName;
      this.types = source.types;
      this.fastMoves = source.fastMoves;
      this.chargeMoves = source.chargeMoves;
      this.baseAttack = source.baseAttack;
      this.baseDefense = source.baseDefense;
      this.baseStamina = source.baseStamina;
      this.isFormless = source.isFormless;
    }
  }
}
