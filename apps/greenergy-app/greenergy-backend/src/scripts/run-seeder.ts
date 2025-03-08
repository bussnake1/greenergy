/**
 * Script to run the outage data seeder
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register apps/greenergy-app/greenergy-backend/src/scripts/run-seeder.ts
 */

require('./seed-outage-data');

console.log('Seeder script started...');
