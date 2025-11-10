/**
 * Script para crear la tabla blacktop_notifications
 * Ejecutar con: node scripts/create-blacktop-notifications-table.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  console.log('🚀 Creando tabla blacktop_notifications...\n');

  // Leer el archivo SQL
  const sqlPath = path.join(__dirname, '..', 'supabase', 'schema', 'blacktop_notifications.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si no existe la función exec_sql, intentar ejecutar directamente
      console.log('⚠️  Función exec_sql no disponible, ejecutando manualmente...\n');
      
      // Dividir el SQL en statements individuales
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
          if (stmtError) {
            console.error(`❌ Error en statement:`, stmtError.message);
          }
        }
      }
    }

    console.log('\n✅ Tabla blacktop_notifications creada exitosamente!');
    console.log('\n📋 Verificando...');

    // Verificar que la tabla existe
    const { data: tables, error: checkError } = await supabase
      .from('blacktop_notifications')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error al verificar:', checkError.message);
      console.log('\n⚠️  La tabla podría no haberse creado correctamente.');
      console.log('Por favor, ejecuta el SQL manualmente en Supabase Dashboard.');
    } else {
      console.log('✅ Verificación exitosa! La tabla está lista para usar.');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 Solución alternativa:');
    console.log('1. Ve a Supabase Dashboard > SQL Editor');
    console.log('2. Copia el contenido de: supabase/schema/blacktop_notifications.sql');
    console.log('3. Pega y ejecuta el SQL');
  }
}

createTable();
