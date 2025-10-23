/*
 * Test du nouveau format de formulaire de rendez-vous
 * 
 * Ce fichier illustre les nouvelles validations pour le formulaire
 */

// Exemples de données valides
const validFormData = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  vehicleRegistration: 'AB-123-CD',
  vehicleType: 'Voiture',
  vehicleBrand: 'Renault',
  vehicleModel: 'Clio',
  vehicleYear: 2020,
  fuelType: 'Essence',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00',
  notes: 'Première visite',
};

// Exemples de numéros de téléphone valides
const validPhoneNumbers = [
  '+33612345678', // Mobile
  '+33712345678', // Mobile
  '+33123456789', // Fixe Paris
  '+33423456789', // Fixe Lyon
  '+33556789012', // Fixe Bordeaux
];

// Exemples de numéros de téléphone INVALIDES
const invalidPhoneNumbers = [
  '0612345678', // Manque le +33
  '+336123456', // Trop court
  '+3361234567890', // Trop long
  '+33012345678', // Commence par 0 après +33
  '+44612345678', // Mauvais indicatif (UK)
  '06 12 34 56 78', // Avec espaces
];

// Validation regex utilisée
const phonePattern = /^\+33[1-9]\d{8}$/;

console.log('=== Tests de validation du téléphone ===\n');

console.log('✅ Numéros VALIDES:');
validPhoneNumbers.forEach(phone => {
  console.log(`  ${phone} - ${phonePattern.test(phone) ? '✓' : '✗'}`);
});

console.log('\n❌ Numéros INVALIDES:');
invalidPhoneNumbers.forEach(phone => {
  console.log(`  ${phone} - ${phonePattern.test(phone) ? '✗ Rejeté' : '✗ Erreur'}`);
});

console.log('\n=== Format des données envoyées ===');
console.log(JSON.stringify(validFormData, null, 2));

console.log('\n=== Affichage dans les emails/SMS ===');
console.log(`Nom complet: ${validFormData.firstName} ${validFormData.lastName}`);
console.log(`Téléphone: ${validFormData.phone}`);

module.exports = { validFormData, validPhoneNumbers, invalidPhoneNumbers, phonePattern };
