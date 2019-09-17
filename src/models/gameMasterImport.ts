import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import PokemongoGameMaster from 'pokemongo-game-master';
import { IGameMaster, IPokemonTemplate, IPveMoveTemplate, IPvpMoveTemplate } from '../interfaces';
import { PokemonSpecies, Move } from './';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

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
        const pokemon = PokemonSpecies.fromRawMaster(template as IPokemonTemplate);
        // for normal and non-shadow/purified forms, add it if we haven't added it yet
        if (!pokemon.form.endsWith('SHADOW')
          && !pokemon.form.endsWith('PURIFIED')
          && !this.speciesList.has(pokemon.id)) {
          this.speciesList.set(pokemon.id, pokemon);

        // replace normal form moves with shadow moves, since they have the same moves plus more
        } else if (pokemon.form.endsWith('SHADOW')) {
          const normalPokemon: PokemonSpecies | undefined = this.speciesList.get(
            PokemonSpecies.generateId(pokemon.speciesId, 'NORMAL'),
          );
          if (normalPokemon) {
            (normalPokemon as PokemonSpecies).chargeMoves = pokemon.chargeMoves;
          } else {
            pokemon.form = 'NORMAL';
            this.speciesList.set(pokemon.id, pokemon);
          }
        }

        // if it has a non-normal form, and previously had a "formless" entry, remove the "formless" one
        const previousNormal: PokemonSpecies | undefined = this.speciesList.get(
          PokemonSpecies.generateId(pokemon.speciesId, 'NORMAL'),
        );
        if (!pokemon.form.endsWith('NORMAL') && previousNormal && (previousNormal as PokemonSpecies).isFormless) {
          this.speciesList.delete(previousNormal.id);
        }
      }

      // IMPORT PVE MOVES
      if (template.templateId.startsWith('V') && template.templateId.substring(6, 10) === 'MOVE') {
        const move = new Move();
        move.updatePveStats(template as IPveMoveTemplate);
        if (this.movesList.has(move.id)) {
          (this.movesList.get(move.id) as Move).updatePveStats(template as IPveMoveTemplate);
        } else {
          this.movesList.set(move.id, move);
        }
      }

      // IMPORT PVP MOVES
      if (template.templateId.startsWith('COMBAT_V') && template.templateId.substring(13, 17) === 'MOVE') {
        const move = new Move();
        move.updatePvpStats(template as IPvpMoveTemplate);
        if (this.movesList.has(move.id)) {
          (this.movesList.get(move.id) as Move).updatePvpStats(template as IPvpMoveTemplate);
        } else {
          this.movesList.set(move.id, move);
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
