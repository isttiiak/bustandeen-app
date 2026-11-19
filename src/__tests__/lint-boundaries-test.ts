/** @jest-environment node */
import { ESLint } from 'eslint';

// Proves the layer rules of docs/03-ARCHITECTURE.md section 4 (task P2-01): each deliberate
// violation, linted as if it lived at the given path, must be rejected; the allowed twin must pass.
// Files are linted from memory, so no failing fixture ever sits in the repo.
// The flat config is passed in directly: Jest cannot run ESLint's own dynamic config import.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- the config is CommonJS
const config = require('../../eslint.config.js');
const eslint = new ESLint({ cwd: process.cwd(), overrideConfigFile: true, overrideConfig: config });

async function messages(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.severity === 2).map((m) => m.ruleId);
}

const RESTRICTED_IMPORT = 'no-restricted-imports';
const RESTRICTED_GLOBAL = 'no-restricted-globals';

describe('layer boundaries (lint)', () => {
  it('rejects fetch outside src/lib/api and src/features/*/api', async () => {
    const code = "export const load = () => fetch('/x');\n";
    expect(await messages(code, 'src/features/salat/hooks/useSalat.ts')).toContain(
      RESTRICTED_GLOBAL
    );
    expect(await messages(code, 'src/app/index.tsx')).toContain(RESTRICTED_GLOBAL);
    expect(await messages(code, 'src/lib/api/client.ts')).not.toContain(RESTRICTED_GLOBAL);
    expect(await messages(code, 'src/features/salat/api/salat.ts')).not.toContain(
      RESTRICTED_GLOBAL
    );
  });

  it('rejects axios outside the api folders', async () => {
    const code = "import axios from 'axios';\nexport const a = axios;\n";
    expect(await messages(code, 'src/features/zikr/screens/Zikr.tsx')).toContain(RESTRICTED_IMPORT);
    expect(await messages(code, 'src/lib/api/client.ts')).not.toContain(RESTRICTED_IMPORT);
  });

  it('keeps src/ui free of feature imports', async () => {
    const code = "import { x } from '@/features/salat/logic/x';\nexport const y = x;\n";
    expect(await messages(code, 'src/ui/Card.tsx')).toContain(RESTRICTED_IMPORT);
    const relative = "import { x } from '../features/salat/logic/x';\nexport const y = x;\n";
    expect(await messages(relative, 'src/ui/Card.tsx')).toContain(RESTRICTED_IMPORT);
    expect(await messages(code, 'src/features/home/screens/Today.tsx')).not.toContain(
      RESTRICTED_IMPORT
    );
  });

  it('limits Platform to src/platform, src/ui and modules', async () => {
    const code = "import { Platform } from 'react-native';\nexport const os = Platform.OS;\n";
    expect(await messages(code, 'src/features/home/screens/Today.tsx')).toContain(
      RESTRICTED_IMPORT
    );
    expect(await messages(code, 'src/app/index.tsx')).toContain(RESTRICTED_IMPORT);
    expect(await messages(code, 'src/platform/os.ts')).not.toContain(RESTRICTED_IMPORT);
    expect(await messages(code, 'src/ui/Sheet.tsx')).not.toContain(RESTRICTED_IMPORT);
    expect(await messages(code, 'modules/bustan-alarm/index.ts')).not.toContain(RESTRICTED_IMPORT);
  });

  it('lets routes import only features, ui and theme', async () => {
    for (const bad of [
      '@/lib/api',
      '@/db/schema',
      '@/sync/outbox',
      '@/platform/os',
      '../lib/api',
    ]) {
      const code = `import { x } from '${bad}';\nexport default x;\n`;
      expect(await messages(code, 'src/app/index.tsx')).toContain(RESTRICTED_IMPORT);
    }
    for (const ok of ['@/features/home/screens/Today', '@/ui/Card', '@/theme/colors']) {
      const code = `import { x } from '${ok}';\nexport default x;\n`;
      expect(await messages(code, 'src/app/index.tsx')).not.toContain(RESTRICTED_IMPORT);
    }
  });
});
