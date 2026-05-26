/**
 * ApiSnippets — generator code snippets untuk fetch dataset detail via REST API.
 *
 * Returns 3 snippets (curl, JavaScript fetch, Python requests) yang valid
 * dengan endpoint contract di docs/api-contract.md §3 (`GET /v1/datasets/{id}`).
 *
 * Auth: placeholder `<YOUR_API_TOKEN>` — user wajib replace dengan JWT real.
 */
import { CodeBlock } from '@ghanem/ui';

export interface ApiSnippetsProps {
  /** Dataset id. */
  datasetId: string;
}

/** Base URL — Phase 9 ganti dengan `import.meta.env.VITE_API_URL`. */
const API_BASE = 'https://api.ghanem.one/v1';

export function ApiSnippets({ datasetId }: ApiSnippetsProps): JSX.Element {
  const safeId = encodeURIComponent(datasetId);

  const curlCode = `curl -X GET '${API_BASE}/datasets/${safeId}' \\
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \\
  -H 'Accept: application/json'`;

  const jsCode = `// fetch + async/await — works di browser modern dan Node 18+
const response = await fetch('${API_BASE}/datasets/${safeId}', {
  headers: {
    Authorization: 'Bearer <YOUR_API_TOKEN>',
    Accept: 'application/json',
  },
});

if (!response.ok) {
  throw new Error(\`HTTP \${response.status}: \${await response.text()}\`);
}

const dataset = await response.json();
console.log(dataset);`;

  const pythonCode = `# pip install requests
import requests

response = requests.get(
    "${API_BASE}/datasets/${datasetId}",
    headers={
        "Authorization": "Bearer <YOUR_API_TOKEN>",
        "Accept": "application/json",
    },
    timeout=15,
)
response.raise_for_status()
dataset = response.json()
print(dataset)`;

  const geojsonCode = `curl -X GET '${API_BASE}/datasets/${safeId}/geojson?bbox=92,-12,142,8' \\
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \\
  -H 'Accept: application/geo+json'`;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-h3 m-0 text-ink">curl</h3>
          <p className="text-xs text-ink-4 m-0">Auth: Bearer JWT — lihat dokumentasi OIDC.</p>
        </div>
        <CodeBlock language="bash" code={curlCode} />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-display font-semibold text-h3 m-0 text-ink">JavaScript (fetch)</h3>
        <CodeBlock language="javascript" filename="fetch-dataset.js" code={jsCode} />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-display font-semibold text-h3 m-0 text-ink">Python (requests)</h3>
        <CodeBlock language="python" filename="fetch_dataset.py" code={pythonCode} />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-h3 m-0 text-ink">GeoJSON export</h3>
          <p className="text-xs text-ink-4 m-0">Returns FeatureCollection (RFC 7946).</p>
        </div>
        <CodeBlock language="bash" code={geojsonCode} />
      </section>

      <p className="text-xs text-ink-4 mt-1">
        Ganti <code className="font-mono bg-surface-3 px-1 py-0.5 rounded-1 text-[11px]">&lt;YOUR_API_TOKEN&gt;</code>{' '}
        dengan token JWT dari endpoint <code className="font-mono bg-surface-3 px-1 py-0.5 rounded-1 text-[11px]">/auth/oidc/callback</code>.
      </p>
    </div>
  );
}
