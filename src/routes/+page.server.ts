import type { PageServerLoad } from './$types';
import { getFindings } from '$lib/server/findings';

export const load: PageServerLoad = async () => {
  try {
    const findings = await getFindings();

    const stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    for (const finding of findings) {
      const severity = finding.severity.toLowerCase();
      if (severity in stats) {
        stats[severity]++;
      }
    }

    return {
      findings,
      stats
    };
  } catch (error) {
    console.error(error);
    return {
      findings: [],
      stats: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      error: 'Failed to load findings.'
    };
  }
};