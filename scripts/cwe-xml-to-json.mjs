import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlRaw = readFileSync('cwec_v4.19.1.xml', 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const parsed = parser.parse(xmlRaw);

// Inspect the parsed structure
console.log(parsed); 

const weaknesses = parsed.Weakness_Catalog?.Weaknesses;

if (!weaknesses) {
  console.error("Weaknesses node is missing in the XML file.");
  process.exit(1); // Exit gracefully
}

const cwes = Array.isArray(weaknesses.Weakness)
  ? weaknesses.Weakness
  : [weaknesses.Weakness];

// Prepare output
const output = cwes.map(cwe => ({
  id: Number(cwe.ID),
  name: cwe.Name,
  description: (typeof cwe.Description === 'string') ? cwe.Description : (
    cwe.Description?.['#text'] ?? '' // Handle nested description
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

// Create the static directory if it doesn't exist
const staticDir = 'static';
if (!existsSync(staticDir)){
    mkdirSync(staticDir);
}

writeFileSync(`${staticDir}/cwe-mitigations.json`, JSON.stringify(output, null, 2));
console.log(`Exported ${output.length} CWEs with mitigations.`);
