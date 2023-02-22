export default function getType(
  type: number,
  language: string,
): { name: { [language: string]: string }; weight: number } {
  const types = [
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
  const tmpType = { weight: types[type].weight, name: {} };
  tmpType.name[language] = types[type].name[language];
  return tmpType;
}
