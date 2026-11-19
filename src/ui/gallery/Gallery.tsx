// Dev gallery (task P2-04): every primitive on one scrolling screen, with a theme switch, a
// language switch for sample strings (English and Bangla) and demos of motion and haptics. Only
// reachable in development builds (src/app/dev/gallery.tsx). Sample Bangla is plain UI wording.
import { useState } from 'react';
import { View } from 'react-native';

import { setThemeMode, useTheme, useThemeMode } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/resolve';

import { ArchHero, LeafMark } from '../Art';
import { Button, IconButton } from '../Button';
import { Card, Tile } from '../Card';
import { CompletionCheck, ProgressRing, Skeleton } from '../Feedback';
import { Chip, Option, Segmented, Switch } from '../Inputs';
import { EmptyState, ListItem, OfflineNote, SectionTitle } from '../Layout';
import { Dialog, Sheet, useToast } from '../Overlays';
import { Screen } from '../Screen';
import { Text } from '../Text';

type Lang = 'en' | 'bn';
const copy = {
  en: {
    title: 'Design gallery',
    theme: 'Theme',
    language: 'Language',
    text: 'Text',
    sample: 'Start your spiritual journey today',
    buttons: 'Buttons',
    save: 'Save',
    cancel: 'Cancel',
    remove: 'Remove',
    loading: 'Saving',
    choices: 'Choices',
    on: 'On',
    off: 'Off',
    cards: 'Cards and rows',
    stat: 'Prayers today',
    row: 'Settings',
    rowSub: 'Theme, language, day start',
    feedback: 'Feedback',
    done: 'Done',
    offline: 'Showing saved data',
    emptyTitle: 'Nothing here yet',
    emptyBody: 'Your saved items will appear here.',
    overlays: 'Overlays',
    openSheet: 'Open sheet',
    openDialog: 'Open dialog',
    toast: 'Show message',
    dialogTitle: 'Remove this item?',
    dialogBody: 'The item and its notes will be deleted from this device.',
    arch: 'Arch hero',
  },
  bn: {
    title: 'ডিজাইন গ্যালারি',
    theme: 'থিম',
    language: 'ভাষা',
    text: 'লেখা',
    sample: 'আজই আপনার আধ্যাত্মিক যাত্রা শুরু করুন',
    buttons: 'বোতাম',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    remove: 'মুছুন',
    loading: 'সংরক্ষণ হচ্ছে',
    choices: 'পছন্দ',
    on: 'চালু',
    off: 'বন্ধ',
    cards: 'কার্ড ও সারি',
    stat: 'আজকের নামাজ',
    row: 'সেটিংস',
    rowSub: 'থিম, ভাষা, দিনের শুরু',
    feedback: 'প্রতিক্রিয়া',
    done: 'সম্পন্ন',
    offline: 'সংরক্ষিত তথ্য দেখানো হচ্ছে',
    emptyTitle: 'এখনো কিছু নেই',
    emptyBody: 'আপনার সংরক্ষিত বিষয়গুলো এখানে দেখা যাবে।',
    overlays: 'ওভারলে',
    openSheet: 'শিট খুলুন',
    openDialog: 'ডায়ালগ খুলুন',
    toast: 'বার্তা দেখান',
    dialogTitle: 'এটি মুছে ফেলবেন?',
    dialogBody: 'আইটেমটি ও এর নোট এই ডিভাইস থেকে মুছে যাবে।',
    arch: 'আর্চ হিরো',
  },
} as const;

const modes: readonly { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'daylight', label: 'Daylight' },
];

export function Gallery() {
  const [lang, setLang] = useState<Lang>('en');
  const c = copy[lang];
  const mode = useThemeMode();
  const { theme } = useTheme();
  const toast = useToast();

  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [option, setOption] = useState('a');
  const [multi, setMulti] = useState({ a: true, b: false });
  const [chip, setChip] = useState(true);
  const [sw, setSw] = useState(true);
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [progress, setProgress] = useState(0.6);
  const [played, setPlayed] = useState(false);

  return (
    <Screen scroll>
      <Text variant="h1">{c.title}</Text>
      <Text variant="small" tone="muted">
        {`theme: ${theme}`}
      </Text>

      <SectionTitle icon="moon">{c.theme}</SectionTitle>
      <Segmented options={modes} value={mode} onChange={setThemeMode} />
      <SectionTitle>{c.language}</SectionTitle>
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'bn', label: 'বাংলা' },
        ]}
        value={lang}
        onChange={setLang}
      />

      <SectionTitle>{c.text}</SectionTitle>
      <Card className="gap-1 p-4">
        <Text variant="display" tone="gold">
          Bustandeen
        </Text>
        <Text variant="h1">05:12</Text>
        <Text variant="h2" tabular>
          04:58 · 12:03
        </Text>
        <Text variant="title">{c.sample}</Text>
        <Text variant="lead">{c.sample}</Text>
        <Text>{c.sample}</Text>
        <Text variant="small" tone="muted">
          {c.sample}
        </Text>
        <Text variant="caption" tone="faint">
          {c.sample}
        </Text>
        <Text tone="danger">{c.remove}</Text>
      </Card>

      <SectionTitle>{c.buttons}</SectionTitle>
      <Button label={c.save} onPress={() => toast.show(c.save, 'success')} fill />
      <Button label={c.cancel} variant="secondary" onPress={() => undefined} fill />
      <Button label={c.cancel} variant="quiet" onPress={() => undefined} />
      <Button label={c.remove} variant="danger" onPress={() => undefined} fill />
      <Button label={c.loading} loading onPress={() => undefined} />
      <View className="flex-row gap-3">
        <IconButton
          icon="plus"
          label="+"
          onPress={() => setProgress((p) => Math.min(1, p + 0.2))}
        />
        <IconButton
          icon="minus"
          label="-"
          onPress={() => setProgress((p) => Math.max(0, p - 0.2))}
        />
        <IconButton icon="close" label={c.cancel} onPress={() => setProgress(0)} />
      </View>

      <SectionTitle>{c.choices}</SectionTitle>
      <Option
        label={c.on}
        description={c.sample}
        selected={option === 'a'}
        onPress={() => setOption('a')}
      />
      <Option label={c.off} selected={option === 'b'} onPress={() => setOption('b')} />
      <Option
        label={c.on}
        multi
        selected={multi.a}
        onPress={() => setMulti((m) => ({ ...m, a: !m.a }))}
      />
      <Option
        label={c.off}
        multi
        selected={multi.b}
        onPress={() => setMulti((m) => ({ ...m, b: !m.b }))}
      />
      <View className="flex-row flex-wrap gap-2">
        <Chip label={c.on} selected={chip} onPress={() => setChip((v) => !v)} />
        <Chip label={c.off} />
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1">{c.row}</Text>
        <Switch value={sw} onValueChange={setSw} label={c.row} />
      </View>
      <Segmented
        options={[
          { value: 'a', label: c.on },
          { value: 'b', label: c.off },
          { value: 'c', label: c.cancel },
        ]}
        value={seg}
        onChange={setSeg}
      />

      <SectionTitle>{c.cards}</SectionTitle>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Tile>
            <ProgressRing progress={progress} label={`${Math.round(progress * 100)}%`}>
              <Text variant="title" tabular>{`${Math.round(progress * 5)}/5`}</Text>
            </ProgressRing>
            <Text variant="small" tone="muted" className="mt-2 text-center">
              {c.stat}
            </Text>
          </Tile>
        </View>
        <View className="flex-1">
          <Tile>
            <LeafMark size={40} />
            <Text variant="h2" tabular className="mt-1">
              12
            </Text>
            <Text variant="small" tone="muted" className="text-center">
              {c.stat}
            </Text>
          </Tile>
        </View>
      </View>
      <ListItem title={c.row} subtitle={c.rowSub} onPress={() => toast.show(c.row)} />
      <ListItem title={c.stat} />
      <Card onPress={() => toast.show(c.stat)} accessibilityLabel={c.stat} className="p-4">
        <Text weight="bold">{c.stat}</Text>
        <Text variant="small" tone="muted">
          {c.rowSub}
        </Text>
      </Card>

      <SectionTitle>{c.arch}</SectionTitle>
      <ArchHero>
        <Text variant="h2" display className="text-center">
          {c.sample}
        </Text>
      </ArchHero>

      <SectionTitle>{c.feedback}</SectionTitle>
      <OfflineNote message={c.offline} />
      <View className="gap-2">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </View>
      <View className="items-center gap-3">
        <CompletionCheck play={played} label={c.done} />
        <Button label={c.done} variant="secondary" onPress={() => setPlayed((p) => !p)} />
      </View>
      <EmptyState
        title={c.emptyTitle}
        message={c.emptyBody}
        action={<Button label={c.save} onPress={() => undefined} />}
      />

      <SectionTitle>{c.overlays}</SectionTitle>
      <Button label={c.openSheet} variant="secondary" onPress={() => setSheet(true)} />
      <Button label={c.openDialog} variant="secondary" onPress={() => setDialog(true)} />
      <Button
        label={c.toast}
        variant="secondary"
        onPress={() => toast.show(c.offline, 'warning')}
      />

      <Sheet visible={sheet} onClose={() => setSheet(false)} title={c.row} closeLabel={c.cancel}>
        <ListItem title={c.row} subtitle={c.rowSub} />
        <View className="h-3" />
        <Button label={c.save} fill onPress={() => setSheet(false)} />
      </Sheet>
      <Dialog
        visible={dialog}
        onClose={() => setDialog(false)}
        title={c.dialogTitle}
        message={c.dialogBody}
        actions={[
          { label: c.remove, variant: 'danger', onPress: () => setDialog(false) },
          { label: c.cancel, onPress: () => setDialog(false) },
        ]}
      />
    </Screen>
  );
}
