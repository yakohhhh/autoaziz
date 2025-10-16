export interface VehicleBrand {
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: Record<string, VehicleBrand[]> = {
  Voiture: [
    {
      name: 'Renault',
      models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Twingo', 'Zoe'],
    },
    {
      name: 'Peugeot',
      models: ['208', '308', '3008', '5008', '2008', 'Partner', 'Expert'],
    },
    {
      name: 'Citroën',
      models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Jumpy'],
    },
    {
      name: 'Volkswagen',
      models: ['Golf', 'Polo', 'Tiguan', 'Passat', 'T-Roc', 'ID.3', 'ID.4'],
    },
    {
      name: 'Mercedes',
      models: ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'GLA', 'GLC'],
    },
    {
      name: 'BMW',
      models: ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'X1', 'X3', 'X5'],
    },
    {
      name: 'Audi',
      models: ['A1', 'A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'e-tron'],
    },
    {
      name: 'Toyota',
      models: ['Yaris', 'Corolla', 'C-HR', 'RAV4', 'Aygo', 'Prius'],
    },
    {
      name: 'Opel',
      models: ['Corsa', 'Astra', 'Crossland', 'Grandland', 'Combo'],
    },
    {
      name: 'Dacia',
      models: ['Sandero', 'Duster', 'Logan', 'Spring', 'Jogger'],
    },
    {
      name: 'Ford',
      models: ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mustang Mach-E'],
    },
    {
      name: 'Nissan',
      models: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
    },
    {
      name: 'Fiat',
      models: ['500', 'Panda', 'Tipo', '500X', '500L'],
    },
    {
      name: 'Hyundai',
      models: ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Ioniq 5'],
    },
    {
      name: 'Kia',
      models: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'EV6'],
    },
    {
      name: 'Tesla',
      models: ['Model 3', 'Model Y', 'Model S', 'Model X'],
    },
    {
      name: 'Autre',
      models: ['Autre modèle'],
    },
  ],
  Moto: [
    {
      name: 'Yamaha',
      models: ['MT-07', 'MT-09', 'YZF-R1', 'TMAX', 'XSR700'],
    },
    {
      name: 'Honda',
      models: ['CB500', 'CBR600RR', 'Africa Twin', 'Forza', 'PCX'],
    },
    {
      name: 'Kawasaki',
      models: ['Ninja 650', 'Z900', 'Versys', 'ZX-10R'],
    },
    {
      name: 'Suzuki',
      models: ['GSX-R', 'V-Strom', 'GSR', 'Burgman'],
    },
    {
      name: 'BMW',
      models: ['R1250GS', 'S1000RR', 'F850GS', 'C400X'],
    },
    {
      name: 'Ducati',
      models: ['Monster', 'Panigale', 'Multistrada', 'Scrambler'],
    },
    {
      name: 'Harley-Davidson',
      models: ['Street', 'Sportster', 'Softail', 'Road King'],
    },
    {
      name: 'KTM',
      models: ['Duke', 'Adventure', 'RC', 'SMC'],
    },
    {
      name: 'Autre',
      models: ['Autre modèle'],
    },
  ],
  Camionnette: [
    {
      name: 'Renault',
      models: ['Kangoo', 'Trafic', 'Master'],
    },
    {
      name: 'Peugeot',
      models: ['Partner', 'Expert', 'Boxer'],
    },
    {
      name: 'Citroën',
      models: ['Berlingo', 'Jumpy', 'Jumper'],
    },
    {
      name: 'Mercedes',
      models: ['Sprinter', 'Vito', 'Citan'],
    },
    {
      name: 'Volkswagen',
      models: ['Transporter', 'Caddy', 'Crafter'],
    },
    {
      name: 'Ford',
      models: ['Transit', 'Transit Custom', 'Transit Connect'],
    },
    {
      name: 'Fiat',
      models: ['Ducato', 'Talento', 'Doblo'],
    },
    {
      name: 'Opel',
      models: ['Vivaro', 'Movano', 'Combo'],
    },
    {
      name: 'Autre',
      models: ['Autre modèle'],
    },
  ],
  Collection: [
    {
      name: 'Renault',
      models: ['R5', '4L', 'Alpine A110', 'Dauphine', 'Caravelle'],
    },
    {
      name: 'Peugeot',
      models: ['205 GTI', '205 Rallye', '504', '404', '403'],
    },
    {
      name: 'Citroën',
      models: ['2CV', 'DS', 'Traction', 'Méhari', 'SM'],
    },
    {
      name: 'Porsche',
      models: ['911', '356', '914', '944', '928'],
    },
    {
      name: 'Ferrari',
      models: ['F40', '308', '250', 'Testarossa', 'Dino'],
    },
    {
      name: 'Mercedes',
      models: ['Pagode', 'W123', 'W124', '190E', 'SL'],
    },
    {
      name: 'BMW',
      models: ['E30', 'E36', '2002', 'Isetta', 'E28'],
    },
    {
      name: 'Volkswagen',
      models: ['Coccinelle', 'Combi', 'Karmann Ghia', 'Golf MK1'],
    },
    {
      name: 'Jaguar',
      models: ['E-Type', 'XJ', 'XK', 'Mark II'],
    },
    {
      name: 'Autre',
      models: ['Autre modèle'],
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
