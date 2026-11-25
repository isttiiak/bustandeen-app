import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, SectionList, View } from 'react-native';

import { useLang } from '@/features/settings/langStore';
import { IconButton } from '@/ui/Button';
import { haptic } from '@/ui/haptics';
import { Icon, type IconName } from '@/ui/Icon';
import { Chip } from '@/ui/Inputs';
import { useToast } from '@/ui/Overlays';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { ZIKR_LIBRARY, libraryMeaning, zikrName, type LibraryItem } from '../content';
import { useZikr, zikrStore } from '../store';

// SVG icons in place of the web's category emoji (no emoji in the app, doc 06).
const CATEGORY_ICON: Record<string, IconName> = {
  tasbih: 'sparkles',
  istighfar: 'cloud',
  salawat: 'heart',
  kalimat: 'scale',
  asma: 'star',
  protection: 'shield',
};

/** The curated zikr library (web `ZikrLibrarySection`), by category. Add puts a zikr in your list. */
export function ZikrLibraryScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const toast = useToast();
  const snap = useZikr();
  const listRef = useRef<SectionList<LibraryItem>>(null);
  const bn = lang === 'bn';

  const sections = ZIKR_LIBRARY.map((c) => ({ ...c, data: c.items }));
  const inList = (name: string) => snap.list.some((n) => n.toLowerCase() === name.toLowerCase());

  const add = (item: LibraryItem) => {
    if (!zikrStore().addToList(item.name)) return;
    haptic('success');
    toast.show(t('zikrLibrary.added', { name: zikrName(item.name, lang) }), 'success');
  };

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-2">
        <IconButton
          icon="chevron-start"
          label={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/zikr'))}
        />
        <Text variant="title" display weight="bold" className="flex-1">
          {t('settings.zikrLibrary')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="grow-0"
        contentContainerClassName="gap-3 px-1 py-2"
      >
        {ZIKR_LIBRARY.map((c, i) => (
          <Chip
            key={c.id}
            label={bn && c.titleBn ? c.titleBn : c.title}
            onPress={() =>
              listRef.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0, viewOffset: 8 })
            }
          />
        ))}
      </ScrollView>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.name}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="gap-2 pb-8"
        onScrollToIndexFailed={() => undefined}
        ListHeaderComponent={
          <Text variant="small" tone="muted" className="pb-2">
            {t('settings.zikrLibrarySubtitle')}
          </Text>
        }
        renderSectionHeader={({ section }) => (
          <View className="gap-1 pb-1 pt-4" accessibilityRole="header">
            <View className="flex-row items-center gap-2">
              <Icon name={CATEGORY_ICON[section.id] ?? 'sparkles'} size={20} color="gold" />
              <Text variant="lead" display weight="bold" className="flex-1">
                {bn && section.titleBn ? section.titleBn : section.title}
              </Text>
            </View>
            <Text variant="small" tone="muted">
              {bn && section.blurbBn ? section.blurbBn : section.blurb}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const added = inList(item.name);
          const name = zikrName(item.name, lang);
          return (
            <View className="gap-2 rounded-card border border-border bg-deep p-4">
              <Text
                variant="h2"
                weight="regular"
                className="self-stretch text-center"
                style={{ writingDirection: 'rtl', lineHeight: 40, fontSize: 24 }}
                accessibilityLanguage="ar"
              >
                {item.shortArabic ?? item.arabic}
              </Text>
              {item.transliteration ? (
                <Text variant="small" tone="gold" className="self-stretch text-center">
                  {item.transliteration}
                </Text>
              ) : null}
              <Text variant="small" tone="muted" className="self-stretch text-center">
                {libraryMeaning(item, lang)}
              </Text>
              <View className="flex-row items-center gap-3 pt-1">
                <Text weight="semibold" className="flex-1">
                  {name}
                </Text>
                {added ? (
                  <View
                    className="min-h-12 flex-row items-center gap-1.5 px-2"
                    accessible
                    accessibilityLabel={`${name}: ${t('zikrLibrary.inList')}`}
                  >
                    <Icon name="check" size={18} color="emerald" />
                    <Text variant="small" tone="emerald" weight="bold" tight>
                      {t('zikrLibrary.inList')}
                    </Text>
                  </View>
                ) : (
                  <PressableScale
                    haptic={false}
                    onPress={() => add(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('zikrLibrary.addToList')}: ${name}`}
                    className="min-h-12 flex-row items-center gap-1.5 rounded-full bg-emerald-dim px-4"
                    testID={`library-add-${item.name}`}
                  >
                    <Icon name="plus" size={18} color="on-color" />
                    <Text variant="small" tone="onColor" weight="bold" tight>
                      {t('zikrLibrary.addToList')}
                    </Text>
                  </PressableScale>
                )}
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}
