import crypto from 'crypto';

/**
 * Skript för att generera säkra JWT-secrets med crypto
 * Kör med: node scripts/generateSecrets.js
 * 
 * Kopiera de genererade secrets till din .env-fil
 */

const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

console.log('='.repeat(70));
console.log('🔐 JWT Secret Generator');
console.log('='.repeat(70));
console.log('\nGenerated secrets (copy to your .env file):\n');

console.log('JWT_ACCESS_SECRET=' + generateSecret(64));
console.log('JWT_REFRESH_SECRET=' + generateSecret(64));

console.log('\n' + '='.repeat(70));
console.log('💡 Tips: Dessa är kryptografiskt säkra slumpmässiga 64-byte secrets');
console.log('='.repeat(70) + '\n');
