import { TranslatorService } from '../src/services';

test('should translate to en-us', () => {
  expect(TranslatorService.translate('MR_MIME_NORMAL', 'en-us')).toBe('Mr. Mime');
});

test('should translate to default text', () => {
  expect(TranslatorService.translate('MR_MIME_NORMAL')).toBe('Mr Mime Normal');
  expect(TranslatorService.translate('LOCK_ON_FAST')).toBe('Lock On');
});

test('should translate to default text with unknown text', () => {
  expect(TranslatorService.translate('JOE_SMITH', 'en-us')).toBe('Joe Smith');
});

test('should translate to default text with unknown language', () => {
  expect(TranslatorService.translate('MR_MIME_NORMAL', 'es-us')).toBe('Mr Mime Normal');
});
