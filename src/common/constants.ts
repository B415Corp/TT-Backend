export const JWT_CONSTANTS = {
  SECRET: 'your-secret-key',
  EXPIRES_IN: '2d', // 2 days,
  REFRESH_SECRET: 'your-refresh-secret-key',
  REFRESH_EXPIRES_IN: '7d', // 7 days
};

export const popularCurrencies: Array<{ code: string; name: string; symbol: string }> = [
  { code: 'USD', name: 'Доллар США', symbol: '$' },
  { code: 'EUR', name: 'Евро', symbol: '€' },
  { code: 'JPY', name: 'Японская иена', symbol: '¥' },
  { code: 'GBP', name: 'Британский фунт стерлингов', symbol: '£' },
  { code: 'AUD', name: 'Австралийский доллар', symbol: 'A$' },
  { code: 'CAD', name: 'Канадский доллар', symbol: 'C$' },
  { code: 'CHF', name: 'Швейцарский франк', symbol: 'CHF' },
  { code: 'CNY', name: 'Китайский юань', symbol: '¥' },
  { code: 'HKD', name: 'Гонконгский доллар', symbol: 'HK$' },
  { code: 'NZD', name: 'Новозеландский доллар', symbol: 'NZ$' },
  { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
];
