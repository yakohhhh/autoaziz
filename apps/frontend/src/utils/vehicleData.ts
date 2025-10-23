export interface VehicleBrand {
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: Record<string, VehicleBrand[]> = {
  Voiture: [
    {
      name: 'Renault',
      models: [],
    },
    {
      name: 'Peugeot',
      models: [],
    },
    {
      name: 'Citroën',
      models: [],
    },
    {
      name: 'Volkswagen',
      models: [],
    },
    {
      name: 'Mercedes',
      models: [],
    },
    {
      name: 'BMW',
      models: [],
    },
    {
      name: 'Audi',
      models: [],
    },
    {
      name: 'Toyota',
      models: [],
    },
    {
      name: 'Opel',
      models: [],
    },
    {
      name: 'Dacia',
      models: [],
    },
    {
      name: 'Ford',
      models: [],
    },
    {
      name: 'Nissan',
      models: [],
    },
    {
      name: 'Fiat',
      models: [],
    },
    {
      name: 'Hyundai',
      models: [],
    },
    {
      name: 'Kia',
      models: [],
    },
    {
      name: 'Tesla',
      models: [],
    },
    {
      name: 'Seat',
      models: [],
    },
    {
      name: 'Skoda',
      models: [],
    },
    {
      name: 'Mazda',
      models: [],
    },
    {
      name: 'Honda',
      models: [],
    },
    {
      name: 'Suzuki',
      models: [],
    },
    {
      name: 'Mitsubishi',
      models: [],
    },
    {
      name: 'Volvo',
      models: [],
    },
    {
      name: 'Mini',
      models: [],
    },
    {
      name: 'Jeep',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
  Moto: [
    {
      name: 'Yamaha',
      models: [],
    },
    {
      name: 'Honda',
      models: [],
    },
    {
      name: 'Kawasaki',
      models: [],
    },
    {
      name: 'Suzuki',
      models: [],
    },
    {
      name: 'BMW',
      models: [],
    },
    {
      name: 'Ducati',
      models: [],
    },
    {
      name: 'Harley-Davidson',
      models: [],
    },
    {
      name: 'KTM',
      models: [],
    },
    {
      name: 'Triumph',
      models: [],
    },
    {
      name: 'Aprilia',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
  Utilitaire: [
    {
      name: 'Renault',
      models: [],
    },
    {
      name: 'Peugeot',
      models: [],
    },
    {
      name: 'Citroën',
      models: [],
    },
    {
      name: 'Mercedes',
      models: [],
    },
    {
      name: 'Volkswagen',
      models: [],
    },
    {
      name: 'Ford',
      models: [],
    },
    {
      name: 'Fiat',
      models: [],
    },
    {
      name: 'Opel',
      models: [],
    },
    {
      name: 'Nissan',
      models: [],
    },
    {
      name: 'Iveco',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
  '4x4': [
    {
      name: 'Toyota',
      models: [],
    },
    {
      name: 'Land Rover',
      models: [],
    },
    {
      name: 'Jeep',
      models: [],
    },
    {
      name: 'Nissan',
      models: [],
    },
    {
      name: 'Mitsubishi',
      models: [],
    },
    {
      name: 'Suzuki',
      models: [],
    },
    {
      name: 'Subaru',
      models: [],
    },
    {
      name: 'Mercedes',
      models: [],
    },
    {
      name: 'BMW',
      models: [],
    },
    {
      name: 'Audi',
      models: [],
    },
    {
      name: 'Volkswagen',
      models: [],
    },
    {
      name: 'Renault',
      models: [],
    },
    {
      name: 'Dacia',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
  'Camping-car': [
    {
      name: 'Renault',
      models: [],
    },
    {
      name: 'Peugeot',
      models: [],
    },
    {
      name: 'Citroën',
      models: [],
    },
    {
      name: 'Fiat',
      models: [],
    },
    {
      name: 'Ford',
      models: [],
    },
    {
      name: 'Mercedes',
      models: [],
    },
    {
      name: 'Volkswagen',
      models: [],
    },
    {
      name: 'Iveco',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
  Collection: [
    {
      name: 'Renault',
      models: [],
    },
    {
      name: 'Peugeot',
      models: [],
    },
    {
      name: 'Citroën',
      models: [],
    },
    {
      name: 'Porsche',
      models: [],
    },
    {
      name: 'Ferrari',
      models: [],
    },
    {
      name: 'Mercedes',
      models: [],
    },
    {
      name: 'BMW',
      models: [],
    },
    {
      name: 'Volkswagen',
      models: [],
    },
    {
      name: 'Jaguar',
      models: [],
    },
    {
      name: 'Alfa Romeo',
      models: [],
    },
    {
      name: 'Aston Martin',
      models: [],
    },
    {
      name: 'Autre',
      models: [],
    },
  ],
};

export const FUEL_TYPES = [
  'Essence',
  'Diesel',
  'Électrique',
  'Hybride',
  'GPL',
  'E85 (Bioéthanol)',
  'Hydrogène',
];

export const getCurrentYear = () => new Date().getFullYear();

export const getYearsList = (startYear: number = 1950): number[] => {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};
