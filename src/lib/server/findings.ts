import pool from '$lib/server/db';

export async function getFindings() {
  try {
    const { rows } = await pool.query(`
      SELECT
        f.id,
        f.severity,
        f.title,
        f.cwe,
        f.cve AS "vulnerabilityId",
        f.epss_score AS "epssScore",
        f.epss_percentile AS "epssPercentile",
        f.known_exploited AS "knownExploited",
        f.ransomware_used AS "usedInRansomware",
        f.date AS "dateAdded",
        u.username as reporter,
        EXTRACT(EPOCH FROM (NOW() - f.date)) / (60 * 60 * 24) AS age,
        EXTRACT(EPOCH FROM (f.sla_expiration_date - NOW())) / (60 * 60 * 24) AS "slaDaysRemaining"
      FROM dojo_finding f
      LEFT JOIN auth_user u ON f.reporter_id = u.id
      ORDER BY f.date DESC
      LIMIT 100;
    `);

    const findings = rows.map(row => ({
      id: row.id,
      severity: row.severity,
      name: row.title,
      cwe: row.cwe,
      vulnerabilityId: row.vulnerabilityId,
      epssScore: row.epssScore !== null ? parseFloat(row.epssScore).toFixed(2) : 'N/A',
      epssPercentile: row.epssPercentile !== null ? parseFloat(row.epssPercentile).toFixed(2) : 'N/A',
      knownExploited: row.knownExploited ? 'Yes' : 'No',
      usedInRansomware: row.usedInRansomware ? 'Yes' : 'No',
      dateAdded: new Date(row.dateAdded).toLocaleDateString(),
      age: Math.floor(row.age || 0),
      sla: row.slaDaysRemaining !== null ? Math.ceil(row.slaDaysRemaining) : 'N.A.',
      reporter: row.reporter || 'N.A.'
    }));

    return findings;
  } catch (error) {
    console.error('Error fetching findings:', error);
    // In a server context, re-throwing or handling the error appropriately is better
    // For the load function, we can return an error state.
    throw new Error('Failed to fetch findings from database.');
  }
}
