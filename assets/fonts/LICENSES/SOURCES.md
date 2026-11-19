# Font sources

All fonts are bundled into the app at build time by the `expo-font` config plugin
(`app.config.ts`). They are the same families the web app uses (`@fontsource/*` there).

Downloaded on 2026-11-19 from the official Google Fonts repository,
https://github.com/google/fonts, commit `cc5661d43cd4f9aad5567033a8e15ca28dc35c86`. Every font is licensed under the
SIL Open Font License 1.1; each family's licence text is in this folder and must ship with the app.

| File in `assets/fonts/`                                     | Source path in google/fonts                                            | Licence                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `HindSiliguri-Regular.ttf`, `-Medium`, `-SemiBold`, `-Bold` | `ofl/hindsiliguri/HindSiliguri-<Weight>.ttf`                           | `HindSiliguri-OFL.txt`    |
| `PlusJakartaSans-Variable.ttf`                              | `ofl/plusjakartasans/PlusJakartaSans[wght].ttf` (renamed: no brackets) | `PlusJakartaSans-OFL.txt` |
| `ElMessiri-Variable.ttf`                                    | `ofl/elmessiri/ElMessiri[wght].ttf` (renamed: no brackets)             | `ElMessiri-OFL.txt`       |

The files are unmodified; only the two variable fonts were renamed. Renaming a file is not a
modification under the OFL, and the fonts' internal names are unchanged.

Not bundled yet: Amiri and Scheherazade New (Quran and dua text, Phase 6).
