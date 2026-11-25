import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { setProto, useProto, type HeroFrameKind, type HomeLayout } from '@/features/home/proto';
import { Chip, Segmented } from '@/ui/Inputs';
import { SectionTitle } from '@/ui/Layout';
import { Text } from '@/ui/Text';

// Pretend times that land in each hero state (sample schedule in features/home/schedule.ts).
const TIMES: readonly [string, number][] = [
  ['04:30 before Fajr', 4 * 60 + 30],
  ['06:25 forbidden', 6 * 60 + 25],
  ['09:00 between', 9 * 60],
  ['11:48 forbidden', 11 * 60 + 48],
  ['13:00 Dhuhr', 13 * 60],
  ['16:00 Asr', 16 * 60],
  ['17:15 forbidden', 17 * 60 + 15],
  ['18:00 Maghrib', 18 * 60],
  ['21:00 Isha', 21 * 60],
];

/**
 * Prototype review switches (P2-05) so the owner can see every Home state on a phone. Dev builds only:
 * the More screen does not render this in a release build. Removed when real prayer data lands (P3).
 */
export function DesignReview() {
  const proto = useProto();
  const { t } = useTranslation();
  return (
    <View className="gap-4">
      <SectionTitle icon="dots">{t('app.settings.designReview')}</SectionTitle>
      <SectionTitle>{t('proto.protoFrame')}</SectionTitle>
      <Segmented
        options={[
          { value: 'arch', label: t('proto.frameArch') },
          { value: 'plain', label: t('proto.framePlain') },
        ]}
        value={proto.frame}
        onChange={(v: HeroFrameKind) => setProto({ frame: v })}
      />
      <SectionTitle>{t('proto.protoRow')}</SectionTitle>
      <Segmented
        options={[
          { value: 'show', label: t('proto.rowShow') },
          { value: 'hide', label: t('proto.rowHide') },
        ]}
        value={proto.prayerRow ? 'show' : 'hide'}
        onChange={(v: string) => setProto({ prayerRow: v === 'show' })}
      />
      <SectionTitle>{t('proto.protoLayout')}</SectionTitle>
      <Segmented
        options={[
          { value: 'a', label: t('proto.layoutA') },
          { value: 'b', label: t('proto.layoutB') },
        ]}
        value={proto.layout}
        onChange={(v: HomeLayout) => setProto({ layout: v })}
      />
      <SectionTitle>{t('proto.protoTime')}</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        <Chip
          label={t('proto.protoLive')}
          selected={proto.simMinutes == null}
          onPress={() => setProto({ simMinutes: null })}
        />
        {TIMES.map(([label, minutes]) => (
          <Chip
            key={label}
            label={label}
            selected={proto.simMinutes === minutes}
            onPress={() => setProto({ simMinutes: minutes })}
          />
        ))}
      </View>
      <SectionTitle>{t('proto.protoFasting')}</SectionTitle>
      <Segmented
        options={[
          { value: 'on', label: t('proto.protoOn') },
          { value: 'off', label: t('proto.protoOff') },
        ]}
        value={proto.fasting ? 'on' : 'off'}
        onChange={(v: string) => setProto({ fasting: v === 'on' })}
      />
      <SectionTitle>{t('proto.protoData')}</SectionTitle>
      <Segmented
        options={[
          { value: 'active', label: t('proto.protoActive') },
          { value: 'empty', label: t('proto.protoEmpty') },
        ]}
        value={proto.active ? 'active' : 'empty'}
        onChange={(v: string) => setProto({ active: v === 'active' })}
      />
      <Text variant="caption" tone="faint" className="text-center">
        {t('proto.prototype')}
      </Text>
    </View>
  );
}
