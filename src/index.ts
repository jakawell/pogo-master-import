#!/usr/bin/env node
// tslint:disable: no-console
import { argv } from 'yargs';
import { GameMasterImport, IGameMasterImportOptions } from './models';

export * from './models';

(async () => {
  console.log('Importing...');
  const options: IGameMasterImportOptions = {
    download: (argv.download as boolean),
    downloadVersion: (argv.downloadVersion as string),
    localSourcePath: (argv.localSourcePath as string),
    save: (argv.save as boolean),
    saveFile: (argv.saveFile as string),
    language: (argv.language as string),
  };
  try {
    await GameMasterImport.importGameMaster(options);
  } catch (err) {
    /* istanbul ignore next */
    console.error(`Error: ${err.message}`);
  }
  console.log('Done.');
})();
