const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();

async function check() {
  const query = `
    SELECT phone, COUNT(*) as c, array_agg(status) as statuses, array_agg(id) as ids 
    FROM leads 
    WHERE phone != '' AND organization_id = 'cb5ab5bb-fae6-4d0f-bcda-feec3f9ee42a'
    GROUP BY phone 
    HAVING COUNT(*) > 1
  `;
  try {
    const res = await pool.query(query);
    console.log("Duplicates for Natanael's Org:", JSON.stringify(res.rows, null, 2));
    
    // Also check leads that match the user's report
    const res2 = await pool.query("SELECT id, name, phone, status, organization_id, last_contact FROM leads WHERE organization_id = 'cb5ab5bb-fae6-4d0f-bcda-feec3f9ee42a' ORDER BY created_at DESC LIMIT 5");
    console.log("Recent leads:", JSON.stringify(res2.rows, null, 2));

  } catch(e) { console.error(e); }
  pool.end();
}
check();
