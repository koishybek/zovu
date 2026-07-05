import { DevModerator } from './dev-moderator.provider';

describe('DevModerator (стоп-словарь ОМ-01/ОМ-02)', () => {
  const mod = new DevModerator();

  it('пропускает нормальный текст', async () => {
    expect((await mod.check('Отличная работа, спасибо!')).ok).toBe(true);
    expect((await mod.check('Керемет жұмыс, рахмет!')).ok).toBe(true);
  });

  it('блокирует мат/оскорбления (RU и KZ)', async () => {
    expect((await mod.check('ты идиот')).ok).toBe(false);
    expect((await mod.check('сен ақымақсың')).ok).toBe(false);
  });

  it('блокирует ссылки и спам-контакты', async () => {
    expect((await mod.check('пиши в telegram t.me/spam')).ok).toBe(false);
    expect((await mod.check('звони +77001234567')).ok).toBe(false);
    expect((await mod.check('https://example.com')).reason).toBe('link_or_spam');
  });
});
