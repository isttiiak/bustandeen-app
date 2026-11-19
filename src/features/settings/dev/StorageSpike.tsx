import { useState } from 'react';
import { View } from 'react-native';

import { runBenchmark, type BenchResult } from '@/db/bench';
import { checkEncryption, initDatabase, type EncryptionReport } from '@/db/client';
import { kv } from '@/lib/kv';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

// Development only (task P2-07, gate G7). Shows that storage works on this device and measures it.
export function StorageSpike() {
  const [report, setReport] = useState<EncryptionReport | null>(null);
  const [bench, setBench] = useState<BenchResult | null>(null);
  const [kvOk, setKvOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    try {
      setError(null);
      await initDatabase();
      setReport(checkEncryption());
      kv.setString('g7_probe', 'ok');
      setKvOk(kv.getString('g7_probe') === 'ok');
      kv.remove('g7_probe');
      setBench(runBenchmark());
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <Screen scroll>
      <Text variant="h1">Storage spike (G7)</Text>
      <Text variant="small" tone="muted">
        Development only. Synthetic data of Quran size; nothing religious is stored.
      </Text>
      <Button label="Run checks and benchmark" onPress={run} />
      {error ? (
        <Text variant="small" tone="danger" testID="spike-error">
          {error}
        </Text>
      ) : null}
      {report ? (
        <View testID="spike-report" className="gap-1">
          <Text variant="h2">Encryption</Text>
          <Text>{`SQLCipher built in: ${report.sqlCipher}`}</Text>
          <Text>{`Cannot be read without the key: ${report.closedWithoutKey}`}</Text>
          <Text>{`Cannot be read with a wrong key: ${report.closedWithWrongKey}`}</Text>
          <Text>{`Encrypted MMKV round trip: ${kvOk}`}</Text>
        </View>
      ) : null}
      {bench ? (
        <View testID="spike-bench" className="gap-1">
          <Text variant="h2">Benchmark ({bench.rows} ayahs)</Text>
          <Text>{`Open and key: ${bench.open} ms`}</Text>
          <Text>{`Insert 2 x ${bench.rows} rows: ${bench.insert} ms`}</Text>
          <Text>{`Page load (median of 20): ${bench.pageLoad} ms`}</Text>
          <Text>{`Search LIKE (median of 5): ${bench.searchLike} ms, ${bench.likeHits} hits`}</Text>
          <Text>{`Search FTS5 (median of 5): ${bench.searchFts} ms, ${bench.ftsHits} hits`}</Text>
        </View>
      ) : null}
    </Screen>
  );
}
