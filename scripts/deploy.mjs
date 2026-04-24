import fs from 'fs';
import { execSync } from 'child_process';

const env = process.argv[2]; // 'cop' or 'usd'

if (!env || (env !== 'cop' && env !== 'usd')) {
  console.error("Por favor, especifica un entorno: 'cop' o 'usd'");
  process.exit(1);
}

// 1. Correr el build de Vite
console.log(`Compilando proyecto para ${env}...`);
execSync('npm run build', { stdio: 'inherit' });

// 2. Leer el wrangler.json generado por Vite
const configPath = 'dist/vitaly_web/wrangler.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 3. Modificar los valores según el entorno
if (env === 'cop') {
  config.name = 'vitaly-web-cop';
  config.d1_databases[0].database_name = 'vitaly-db-cop';
  config.d1_databases[0].database_id = '00e4e5d4-a2d1-4991-83e8-23c8ab83faae';
} else if (env === 'usd') {
  config.name = 'vitaly-web-usd';
  config.d1_databases[0].database_name = 'vitaly-db-usd';
  config.d1_databases[0].database_id = '362f2972-5a1d-4d42-be18-80afe5ec2764';
}

// 4. Guardar los cambios temporales
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

// 5. Desplegar a Cloudflare
console.log(`Desplegando ${config.name} a Cloudflare...`);
execSync(`npx wrangler deploy -c ${configPath}`, { stdio: 'inherit' });

console.log(`¡Despliegue de ${env.toUpperCase()} exitoso!`);
