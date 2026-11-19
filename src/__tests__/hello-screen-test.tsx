import { render, screen } from '@testing-library/react-native';

import HelloScreen, { HELLO_TEXT } from '@/app/index';
import { fonts } from '@/theme/fonts';

describe('hello screen', () => {
  it('shows the app name, the English line and the Bangla line', async () => {
    await render(<HelloScreen />);

    expect(screen.getByRole('header')).toHaveTextContent('Bustandeen');
    expect(screen.getByText(HELLO_TEXT.en)).toBeOnTheScreen();
    expect(screen.getByText(HELLO_TEXT.bn)).toBeOnTheScreen();
  });

  it('sets Bangla in Hind Siliguri', async () => {
    await render(<HelloScreen />);

    expect(screen.getByText(HELLO_TEXT.bn)).toHaveStyle({ fontFamily: fonts.bangla });
  });
});
