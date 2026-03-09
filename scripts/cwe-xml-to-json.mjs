import { readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlRaw = readFileSync('cwec_latest.xml', 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const parsed = parser.parse(xmlRaw);

// CWE Weaknesses are in: parsed.Weaknesses.Weakness (can be array or single object)
const cwes = Array.isArray(parsed.Weaknesses.Weakness)
  ? parsed.Weaknesses.Weakness
  : [parsed.Weaknesses.Weakness];

const output = cwes.map(cwe => ({
  id: Number(cwe.ID),
  name: cwe.Name,
  description: (typeof cwe.Description === 'string') ? cwe.Description : (
    cwe.Description?.['#text'] ?? '' // Sometimes description is nested
  ),
  mitigations: (cwe.Mitigations?.Mitigation
    ? Array.isArray(cwe.Mitigations.Mitigation)
      ? cwe.Mitigations.Mitigation
      : [cwe.Mitigations.Mitigation]
    : []
  ).map(mit => ({
    phase: mit.Phase,
    description: (typeof mit.Description === 'string') ? mit.Description : (mit.Description?.['#text'] ?? '')
  }))
}));

writeFileSync('static/cwe-mitigations.json', JSON.stringify(output, null, 2));
console.log(`Exported ${output.length} CWEs with mitigations.`);