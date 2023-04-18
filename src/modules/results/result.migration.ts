export const result_types = [
  {
    id: 2,
    name: {
      de: 'einmaliger Zuschuss',
      uk: 'одноразова субсидія/виплата/безповоротна позичка',
      ru: 'однократная субсидия/выплата/безвозвратная ссуда',
    },
    weight: 800,
  },
  {
    id: 3,
    name: {
      de: 'Beratung',
      uk: 'консультація/консультування',
      ru: 'консультация/консультирование',
    },
    weight: 600,
  },
  {
    id: 4,
    name: {
      de: 'Sachleistung',
      uk: 'негрошові форми соціальної допомоги',
      ru: 'неденежные формы социальной помощи',
    },
    weight: 700,
  },
  {
    id: 6,
    name: {
      de: 'monatliche Geldzahlung',
      uk: 'щомісячна грошова оплата',
      ru: 'ежемесячная выплата денег',
    },
    weight: 900,
  },
  {
    id: 9,
    name: {
      de: 'Ermäßigung/ Rabatt',
      uk: 'зниження плати/знижка',
      ru: 'снижение платы /скидка',
    },
    weight: 300,
  },
  {
    id: 10,
    name: {
      de: 'Dienstleistung',
      uk: 'надання послуг/виконання послуги/обслуговування',
      ru: 'оказание услуг/исполнение услуги/обслуживание',
    },
    weight: 650,
  },
];

export default function getType(
  type: number,
  language: string,
): { name: { [language: string]: string }; weight: number, id: number } {
  return {
    id: result_types[type].id,
    weight: result_types[type].weight,
    name: language
      ? { [language]: result_types[type].name[language] }
      : result_types[type].name,
  };
}
