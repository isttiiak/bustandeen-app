import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { digits } from '@/lib/format';
import type { Lang } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Dialog, Sheet } from '@/ui/Overlays';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

import { isCore, zikrDisplay, zikrName } from '../content';

/**
 * "My zikr list": pick the zikr to count, or switch to edit mode to remove one (core zikr stay, as on the
 * web). Replaces the web's dropdown; the library opens from the footer.
 */
export function ZikrListSheet({
  visible,
  onClose,
  lang,
  list,
  selected,
  todayCounts,
  onSelect,
  onRemove,
  onOpenLibrary,
}: {
  visible: boolean;
  onClose: () => void;
  lang: Lang;
  list: readonly string[];
  selected: string;
  todayCounts: Readonly<Record<string, number>>;
  onSelect: (type: string) => void;
  onRemove: (type: string) => void;
  onOpenLibrary: () => void;
}) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const num = (n: number) => digits(n, lang);

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={t('zikr.myZikrList')}
      closeLabel={t('app.closeSheet')}
    >
      {/* The gesture-handler ScrollView scrolls inside the draggable sheet; plain style props because
          NativeWind class names are not wired to this component. */}
      <ScrollView
        style={{ maxHeight: height * 0.55 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
      >
        {list.map((type) => {
          const name = zikrName(type, lang);
          const shown = zikrDisplay(type, lang, t);
          const isSelected = type === selected;
          const today = t('app.zikr.todayCount', { count: num(todayCounts[type] ?? 0) });
          const body = (
            <>
              <View className="flex-1">
                <Text weight={isSelected ? 'bold' : 'semibold'}>{name}</Text>
                <Text variant="small" tone="muted" tabular>
                  {today}
                </Text>
              </View>
              {shown ? (
                <Text
                  variant="lead"
                  className="max-w-[45%]"
                  style={{ writingDirection: 'rtl', textAlign: 'right' }}
                  accessibilityLanguage="ar"
                >
                  {shown.arabic}
                </Text>
              ) : null}
            </>
          );
          if (editing) {
            const core = isCore(type);
            return (
              <View
                key={type}
                className="min-h-12 flex-row items-center gap-3 rounded-control border border-border bg-surface/50 p-3"
              >
                <View className="flex-1">
                  <Text weight="semibold">{name}</Text>
                  <Text variant="small" tone="muted" tabular>
                    {today}
                  </Text>
                </View>
                {core ? (
                  <Text variant="small" tone="muted">
                    {t('zikr.alwaysOn')}
                  </Text>
                ) : (
                  <PressableScale
                    haptic="select"
                    onPress={() => setConfirm(type)}
                    accessibilityRole="button"
                    accessibilityLabel={t('zikr.removeAriaLabel', { name })}
                    className="min-h-12 min-w-12 items-center justify-center rounded-full border border-danger/40 bg-danger/10 px-3"
                  >
                    <Text variant="small" tone="danger" weight="bold" tight>
                      {t('zikr.removeBtn')}
                    </Text>
                  </PressableScale>
                )}
              </View>
            );
          }
          return (
            <PressableScale
              key={type}
              haptic="select"
              onPress={() => {
                onSelect(type);
                close();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              accessibilityLabel={`${name}, ${today}`}
              className={`min-h-12 flex-row items-center gap-3 rounded-control border p-3 ${
                isSelected ? 'border-emerald bg-emerald/10' : 'border-border bg-surface/50'
              }`}
              testID={`zikr-option-${type}`}
            >
              {isSelected ? <Icon name="check" size={18} color="emerald" /> : null}
              {body}
            </PressableScale>
          );
        })}
      </ScrollView>
      <View className="flex-row gap-3 pt-3">
        <View className="flex-1">
          <Button
            label={editing ? t('app.zikr.done') : t('zikr.editBtn')}
            icon={editing ? 'check' : 'pencil'}
            variant="secondary"
            fill
            onPress={() => setEditing((e) => !e)}
          />
        </View>
        <View className="flex-1">
          <Button
            label={t('app.zikr.addFromLibrary')}
            icon="plus"
            fill
            onPress={() => {
              close();
              onOpenLibrary();
            }}
            testID="zikr-open-library"
          />
        </View>
      </View>
      <Dialog
        visible={confirm !== null}
        onClose={() => setConfirm(null)}
        title={t('zikr.removeConfirmTitle', { name: confirm ? zikrName(confirm, lang) : '' })}
        message={t('app.zikr.removeNote')}
        actions={[
          {
            label: t('zikr.yesRemove'),
            variant: 'danger',
            onPress: () => {
              if (confirm) onRemove(confirm);
              setConfirm(null);
            },
          },
          { label: t('common.cancel'), onPress: () => setConfirm(null) },
        ]}
      />
    </Sheet>
  );
}
