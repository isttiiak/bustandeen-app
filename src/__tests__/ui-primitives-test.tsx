import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { ArchHero } from '@/ui/Art';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ProgressRing } from '@/ui/Feedback';
import { Chip, Option, Segmented, Switch } from '@/ui/Inputs';
import { EmptyState, ListItem, OfflineNote } from '@/ui/Layout';
import { Dialog, Sheet, ToastProvider, useToast } from '@/ui/Overlays';
import { haptic, setHapticsEnabled } from '@/ui/haptics';
import { Text } from '@/ui/Text';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

beforeEach(() => {
  jest.clearAllMocks();
  setHapticsEnabled(true);
});

describe('Button', () => {
  it('is a button named by its label and fires onPress with a haptic tick', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('does nothing when disabled or loading', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Off" onPress={onPress} disabled />
        <Button label="Busy" onPress={onPress} loading />
      </>
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Off' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Busy' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Busy' })).toBeBusy();
    expect(screen.getByRole('button', { name: 'Off' })).toBeDisabled();
  });

  it('has an icon-only variant that must carry a label', async () => {
    await render(<IconButton icon="close" label="Close" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen();
  });
});

describe('haptics', () => {
  it('stays silent when switched off', () => {
    setHapticsEnabled(false);
    haptic('tick');
    haptic('success');
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('maps kinds to the platform haptics', () => {
    haptic('select');
    haptic('medium');
    haptic('success');
    expect(Haptics.selectionAsync).toHaveBeenCalled();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });
});

describe('choices', () => {
  it('Option is a radio (or a checkbox when multi) that reports its state', async () => {
    await render(
      <>
        <Option label="A" selected onPress={() => undefined} />
        <Option label="B" selected={false} multi onPress={() => undefined} />
      </>
    );
    expect(screen.getByRole('radio', { name: 'A' })).toBeSelected();
    expect(screen.getByRole('checkbox', { name: 'B' })).not.toBeSelected();
  });

  it('Segmented changes only when another segment is pressed', async () => {
    const onChange = jest.fn();
    await render(
      <Segmented
        options={[
          { value: 'x', label: 'One' },
          { value: 'y', label: 'Two' },
        ]}
        value="x"
        onChange={onChange}
      />
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'One' }));
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Two' }));
    expect(onChange).toHaveBeenCalledWith('y');
    expect(screen.getByRole('radio', { name: 'One' })).toBeSelected();
  });

  it('Switch is named and reports changes', async () => {
    const onValueChange = jest.fn();
    await render(<Switch value={false} onValueChange={onValueChange} label="Vibration" />);
    await fireEvent(screen.getByRole('switch', { name: 'Vibration' }), 'valueChange', true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('Chip is static without onPress and a button with it', async () => {
    await render(
      <>
        <Chip label="Static" />
        <Chip label="Tap" selected onPress={() => undefined} />
      </>
    );
    expect(screen.queryByRole('button', { name: 'Static' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Tap' })).toBeSelected();
  });
});

describe('layout and feedback', () => {
  it('Card is a button only when pressable', async () => {
    await render(
      <>
        <Card testID="plain">
          <Text>Plain</Text>
        </Card>
        <Card onPress={() => undefined} accessibilityLabel="Tappable">
          <Text>Tap</Text>
        </Card>
      </>
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Tappable' })).toBeOnTheScreen();
  });

  it('ListItem names title and subtitle and is tappable on demand', async () => {
    const onPress = jest.fn();
    await render(<ListItem title="Settings" subtitle="Theme" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Settings, Theme' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('ProgressRing exposes its value to screen readers', async () => {
    await render(<ProgressRing progress={0.6} label="3 of 5 prayers" />);
    const ring = screen.getByRole('progressbar', { name: '3 of 5 prayers' });
    expect(ring).toHaveAccessibilityValue({ min: 0, max: 100, now: 60 });
  });

  it('EmptyState, OfflineNote and ArchHero render their content', async () => {
    await render(
      <>
        <EmptyState title="Nothing yet" message="Come back later" />
        <OfflineNote message="Saved data" />
        <ArchHero>
          <Text>Hero</Text>
        </ArchHero>
      </>
    );
    expect(screen.getByLabelText('Nothing yet. Come back later')).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: 'Saved data' })).toBeOnTheScreen();
    expect(screen.getByText('Hero')).toBeOnTheScreen();
  });
});

describe('overlays', () => {
  it('Dialog shows its message and runs the chosen action', async () => {
    const onDelete = jest.fn();
    await render(
      <Dialog
        visible
        onClose={() => undefined}
        title="Remove?"
        message="The item will be deleted."
        actions={[{ label: 'Delete', variant: 'danger', onPress: onDelete }]}
      />
    );
    expect(screen.getByText('The item will be deleted.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('Dialog and Sheet render nothing while hidden', async () => {
    await render(
      <>
        <Dialog
          visible={false}
          onClose={() => undefined}
          title="Hidden dialog"
          message="m"
          actions={[]}
        />
        <Sheet visible={false} onClose={() => undefined} title="Hidden sheet" closeLabel="Close" />
      </>
    );
    expect(screen.queryByText('Hidden dialog')).toBeNull();
    expect(screen.queryByText('Hidden sheet')).toBeNull();
  });

  it('Sheet shows its title and content when visible', async () => {
    await render(
      <Sheet visible onClose={() => undefined} title="Quick log" closeLabel="Close">
        <Text>Inside</Text>
      </Sheet>
    );
    expect(screen.getByText('Quick log')).toBeOnTheScreen();
    expect(screen.getByText('Inside')).toBeOnTheScreen();
  });

  it('Toast shows a message with a success haptic, then removes it', async () => {
    jest.useFakeTimers();
    function Trigger() {
      const toast = useToast();
      return <Button label="Go" onPress={() => toast.show('Saved', 'success')} />;
    }
    await render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Go' }));
    expect(screen.getByText('Saved')).toBeOnTheScreen();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Saved')).toBeNull();
    jest.useRealTimers();
  });
});
