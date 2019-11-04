import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import PokemongoGameMaster from 'pokemongo-game-master';
import { IGameMaster, IPokemonTemplate, IPveMoveTemplate, IPvpMoveTemplate, PokemonSpecies, Move } from 'pogo-objects';
import { TranslatorService } from '../services';
import DefaultLegacyMoves from '../data/legacyMoves.json';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export interface ILegacyMoveSet {
  species: string;
  legacyFast: string[] | undefined;
  legacyCharge: string[] | undefined;
}

export interface IGameMasterImportOptions {
  /**
   * Whether the import should download the game master from online. Default is "true".
   */
  download: boolean | undefined;
  /**
   * Which version of the game master to download. Default is "latest".
   */
  downloadVersion: string | undefined;
  /**
   * The path to a local copy of the game master to use instead of the online version. Default is "./master.json".
   */
  localSourcePath: string | undefined;
  /**
   * Whether to save the downloaded game master locally. Default is "false".
   */
  save: boolean | undefined;
  /**
   * Path to use for saving the game master. Default is "./master.json".
   */
  saveFile: string | undefined;
  /**
   * Language to use for names. Default is empty, which just converts the code names to human readable.
   */
  language: string | undefined;
  /**
   * Whether to include legacy/event moves.
   */
  includeLegacyMoves: boolean | undefined;
  /**
   * Path to a custom list of legacy moves.
   */
  legacyMovesFile: string | undefined;
}

// tslint:disable-next-line: max-classes-per-file
export class GameMasterImportResult {
  constructor(
    public speciesList: Map<string, PokemonSpecies>,
    public movesList: Map<string, Move>,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class GameMasterImport {
  /**
   * Load and process the specified game master data into the system.
   * @returns Promise<GameMasterImport> The imported data.
   */
  public static async importGameMaster(options?: IGameMasterImportOptions | undefined):
    Promise<GameMasterImportResult> {
    const importer = new GameMasterImport(options);
    return importer.importGameMaster();
  }

  /**
   * Imports the data from a previously imported game master that was saved as JSON.
   * @param jsonObject The JSON object to import.
   */
  public static importFromSaved(jsonObject: any): GameMasterImportResult {
    return new GameMasterImportResult(
      new Map(Object.entries(jsonObject.species)
        .map(([key, value]) => [key, PokemonSpecies.fromParsed(value as PokemonSpecies)])),
      new Map(Object.entries(jsonObject.moves)),
    );
  }

  /**
   * The imported Pokémon species.
   */
  public speciesList: Map<string, PokemonSpecies> = new Map<string, PokemonSpecies>();
  /**
   * The imported Pokémon moves.
   */
  public movesList: Map<string, Move> = new Map<string, Move>();

  private options: IGameMasterImportOptions = {
    download: true,
    downloadVersion: 'latest',
    localSourcePath: './master.json',
    save: false,
    saveFile: './master.json',
    language: undefined,
    includeLegacyMoves: true,
    legacyMovesFile: undefined,
  };
  private gameMaster: IGameMaster | null = null;

  constructor(options?: IGameMasterImportOptions | undefined) {
    if (options) {
      this.options = this.assignDefined(this.options, options);
    }
  }

  /**
   * Load and process the specified game master data into the system.
   * @returns Promise<GameMasterImport> The imported data.
   */
  public async importGameMaster(): Promise<GameMasterImportResult> {
    try {
      if (this.options.download) {
        await this.downloadGameMaster();
      } else {
        await this.readGameMaster();
      }
    } catch (err) {
      throw err;
    }

    for (const template of (this.gameMaster as IGameMaster).itemTemplates) {

      // IMPORT POKEMON
      if (template.templateId.startsWith('V') && template.templateId.substring(6, 13) === 'POKEMON') {
        const pokedexNumber = parseInt(template.templateId.substring(1, 5), 10);
        const pokemonTemplate = template as IPokemonTemplate;
        const pokemon = PokemonSpecies.fromRawMaster(pokemonTemplate, pokedexNumber, 'placeholder');
        pokemon.speciesName = TranslatorService.translate(pokemon.id, this.options.language);

        // Ignore forms for seasonal events (ends in the year; ie. 'FALL_2019')
        if (/^.+_[0-9]{2,4}$/.test(pokemon.form)) {
          continue;
        }

        const previous: PokemonSpecies | undefined = this.speciesList.get(pokemon.id);
        // add pokemon that haven't been added yet
        if (!previous // if the pokemon hasn't been added yet, or...
          || pokemon.chargeMoves.length > previous.chargeMoves.length) { // ...if this pokemon has more charge moves than the previous one (as shadow forms do)
          this.speciesList.set(pokemon.id, pokemon); // ...add/replace it
        }

        // if it has a non-normal form, and previously had a "formless" entry, remove the "formless" one
        const previousNormal: PokemonSpecies | undefined = this.speciesList.get(
          PokemonSpecies.generateId(pokemon.speciesId, 'NORMAL'),
        );
        if (!pokemon.form.endsWith('NORMAL') && previousNormal && previousNormal.isFormless) {
          this.speciesList.delete(previousNormal.id);
        }
      }

      // IMPORT PVE MOVES
      if (template.templateId.startsWith('V') && template.templateId.substring(6, 10) === 'MOVE') {
        const moveTemplate = template as IPveMoveTemplate;
        const moveName = TranslatorService.translate(moveTemplate.moveSettings.movementId, this.options.language);
        const move = new Move();
        move.updatePveStats(moveTemplate, moveName);
        if (this.movesList.has(move.id)) {
          (this.movesList.get(move.id) as Move).updatePveStats(moveTemplate, moveName);
        } else {
          this.movesList.set(move.id, move);
        }
      }

      // IMPORT PVP MOVES
      if (template.templateId.startsWith('COMBAT_V') && template.templateId.substring(13, 17) === 'MOVE') {
        const moveTemplate = template as IPvpMoveTemplate;
        const moveName = TranslatorService.translate(moveTemplate.combatMove.uniqueId, this.options.language);
        const move = new Move();
        move.updatePvpStats(moveTemplate, moveName);
        if (this.movesList.has(move.id)) {
          (this.movesList.get(move.id) as Move).updatePvpStats(moveTemplate, moveName);
        } else {
          this.movesList.set(move.id, move);
        }
      }
    }
    if (this.options.includeLegacyMoves) {
      let legacyMoves: ILegacyMoveSet[] = DefaultLegacyMoves as ILegacyMoveSet[];
      if (this.options.legacyMovesFile) {
        try {
          const legacyFile = await readFile(path.join(process.cwd(), this.options.legacyMovesFile));
          legacyMoves = JSON.parse(legacyFile.toString()) as ILegacyMoveSet[];
        } catch (err) {
          throw new Error(`Failed to import legacy movesets from local file: ${err}`);
        }
      }
      for (const moveSet of legacyMoves) {
        if (this.speciesList.has(moveSet.species)) {
          const species = this.speciesList.get(moveSet.species) as PokemonSpecies;
          if (moveSet.legacyFast) {
            species.fastMoves = species.fastMoves.concat(moveSet.legacyFast);
          }
          if (moveSet.legacyCharge) {
            species.chargeMoves = species.chargeMoves.concat(moveSet.legacyCharge);
          }
        }
      }
    }
    if (this.options.save) {
      try {
        await this.saveGameMaster();
      } catch (err) {
        throw err;
      }
    }
    return new GameMasterImportResult(this.speciesList, this.movesList);
  }

  /**
   * Download the game master file and update "this.master" with the value.
   * @returns Promise<void>
   */
  private async downloadGameMaster(): Promise<void> {
    this.gameMaster =
      (await PokemongoGameMaster.getVersion(this.options.downloadVersion as string, 'json')) as IGameMaster;
  }

  /**
   * Read game master from local path.
   */
  private async readGameMaster(): Promise<void> {
    if (!this.options.localSourcePath) {
      throw new Error('No source path was provided. Set "options.localSourcePath".');
    }
    try {
      const imported = await readFile(path.join(process.cwd(), this.options.localSourcePath));
      try {
        this.gameMaster = JSON.parse(imported.toString()) as IGameMaster;
      } catch (err) {
        throw new Error(`Failed to parse game master from local file: ${err}`);
      }
    } catch (err) {
      throw new Error(`Failed to read game master from local file: ${err}`);
    }
  }

  /**
   * Save the imported game master locally.
   */
  private async saveGameMaster() {
    if (!this.options.saveFile) {
      throw new Error('No save path was provided. Set "options.saveFile"');
    }
    try {
      await writeFile(path.join(process.cwd(), this.options.saveFile), JSON.stringify({
        species: [...this.speciesList].reduce((acc, val) => {
          acc[val[0]] = val[1];
          return acc;
        }, {} as any),
        moves: [...this.movesList].reduce((acc, val) => {
          acc[val[0]] = val[1];
          return acc;
        }, {} as any),
      }, null, 2));
    } catch (err) {
      throw new Error(`Failed to save game master to local file: ${err}`);
    }
  }

  /**
   * Functions similarly to Object.assign(..), but ignores undefined keys.
   * Source: https://stackoverflow.com/a/39514270/1377429
   *
   * @param target The target object.
   * @param sources The source objects.
   */
  private assignDefined(target: any, ...sources: any) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const val = source[key];
            if (val !== undefined) {
                target[key] = val;
            }
        }
    }
    return target;
}
}
