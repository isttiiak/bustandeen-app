import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

// Development only (task P2-18a). Throws while drawing so the error screen can be checked on a device.

function Thrower(): never {
  throw new Error('Crash test: thrown on purpose to show the error screen');
}

export function CrashTest() {
  const [crash, setCrash] = useState(false);
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text variant="h2" display>
          Crash test (dev)
        </Text>
        <Text tone="muted">Draws a component that throws, to show the error screen.</Text>
        <Button label="Crash this screen" variant="danger" onPress={() => setCrash(true)} />
        {crash ? <Thrower /> : null}
      </View>
    </Screen>
  );
}
