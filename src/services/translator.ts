import fs from 'fs';
import path from 'path';

export class TranslatorService {
  public static getTranslations(): Map<string, any> {
    if (!TranslatorService.translations) {
      const translationFiles = fs.readdirSync(path.join(__dirname, '../../data/translations'));
      TranslatorService.translations = new Map<string, any>(
        translationFiles
          .map((file) => [file.replace('.json', ''), require(`../../data/translations/${file}`)]),
      );
    }
    return TranslatorService.translations;
  }

  public static translate(text: string, language?: string): string {
    if (language) {
      const translations = TranslatorService.getTranslations();
      if (translations.has(language)) {
        const translation = translations.get(language);
        if (translation[text]) {
          return translation[text];
        }
      }
    }
    return TranslatorService.nullTranslation(text);
  }

  private static translations: Map<string, any> | null = null;

  private static nullTranslation(text: string): string {
    return text.toLowerCase()
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  }
}
