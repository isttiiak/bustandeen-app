// Verses for the Home verse card (dua, hope, gifts of Allah, Paradise). Arabic is Uthmani text and the
// translations are copied unchanged from the quran.com API on 2026-11-19 (Arabic: text_uthmani;
// English: Saheeh International, resource 20; Bangla: Muhiuddin Khan, resource 163). Never edit by
// hand: re-run the fetch. PROTOTYPE: translation rights per edition are still to be verified
// (docs/08 section on translations) before release. One verse per day, rotating by day of year.
export interface Verse {
  key: string;
  arabic: string;
  en: string;
  bn: string;
}

export const VERSES: readonly Verse[] = [
  {
    key: '2:186',
    arabic:
      'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا۟ لِى وَلْيُؤْمِنُوا۟ بِى لَعَلَّهُمْ يَرْشُدُونَ',
    en: 'And when My servants ask you, [O Muḥammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me [by obedience] and believe in Me that they may be [rightly] guided.',
    bn: 'এবং যখন আমার সেবকবৃন্দ (বান্দা) আমার সম্বন্ধে তোমাকে জিজ্ঞেস করে তখন তাদেরকে বলে দাওঃ নিশ্চয়ই আমি সন্নিকটবর্তী। কোন আহবানকারী যখনই আমাকে আহবান করে তখনই আমি তার আহবানে সাড়া দিই; সুতরাং তারাও যেন আমার ডাকে সাড়া দেয় এবং আমাকে বিশ্বাস করে - তাহলেই তারা সঠিক পথপ্রাপ্ত হতে পারবে।',
  },
  {
    key: '40:60',
    arabic: 'وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ ۚ إِنَّ ٱلَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِى سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ',
    en: 'And your Lord says, "Call upon Me; I will respond to you." Indeed, those who disdain My worship will enter Hell [rendered] contemptible.',
    bn: 'তোমাদের রাব্ব বললেনঃ তোমরা আমাকে ডাক, আমি তোমাদের ডাকে সাড়া দিব। কিন্তু যারা অহংকারে আমার ইবাদাতে বিমুখ তারা অবশ্যই জাহান্নামে প্রবেশ করবে লাঞ্ছিত হয়ে।',
  },
  {
    key: '13:28',
    arabic: 'ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    en: 'Those who have believed and whose hearts are assured by the remembrance of Allāh. Unquestionably, by the remembrance of Allāh hearts are assured."',
    bn: 'যারা ঈমান আনে এবং আল্লাহর স্মরণে যাদের চিত্ত প্রশান্ত হয়; জেনে রেখ, আল্লাহর স্মরণেই চিত্ত প্রশান্ত হয়।',
  },
  {
    key: '2:152',
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    en: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    bn: 'অতএব তোমরা আমাকেই স্মরণ কর, আমিও তোমাদেরকেই স্মরণ করব এবং তোমরা আমারই নিকট কৃতজ্ঞ হও এবং অবিশ্বাসী হয়োনা।',
  },
  {
    key: '94:6',
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    en: 'Indeed, with hardship [will be] ease.',
    bn: 'অবশ্যই কষ্টের সাথে স্বস্তি আছে।',
  },
  {
    key: '65:3',
    arabic:
      'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَـٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍ قَدْرًا',
    en: 'And will provide for him from where he does not expect. And whoever relies upon Allāh - then He is sufficient for him. Indeed, Allāh will accomplish His purpose. Allāh has already set for everything a [decreed] extent.',
    bn: 'আর তাকে তার ধারণাতীত উৎস থেকে দান করবেন রিয্ক; যে ব্যক্তি আল্লাহর উপর নির্ভর করে তার জন্য আল্লাহই যথেষ্ট, আল্লাহ তাঁর ইচ্ছা পূরণ করবেনই, আল্লাহ সব কিছুর জন্য স্থির করেছেন নির্দিষ্ট মাত্রা।',
  },
  {
    key: '3:133',
    arabic: '۞ وَسَارِعُوٓا۟ إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا ٱلسَّمَـٰوَٰتُ وَٱلْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
    en: 'And hasten to forgiveness from your Lord and a garden [i.e., Paradise] as wide as the heavens and earth, prepared for the righteous',
    bn: 'তোমরা স্বীয় রবের ক্ষমা ও জান্নাতের দিকে ধাবিত হও, যার প্রসারতা নভোমন্ডল ও ভূমন্ডল সদৃশ, ওটা ধর্মভীরুদের জন্য নির্মিত হয়েছে।',
  },
  {
    key: '9:72',
    arabic:
      'وَعَدَ ٱللَّهُ ٱلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ خَـٰلِدِينَ فِيهَا وَمَسَـٰكِنَ طَيِّبَةً فِى جَنَّـٰتِ عَدْنٍ ۚ وَرِضْوَٰنٌ مِّنَ ٱللَّهِ أَكْبَرُ ۚ ذَٰلِكَ هُوَ ٱلْفَوْزُ ٱلْعَظِيمُ',
    en: 'Allāh has promised the believing men and believing women gardens beneath which rivers flow, wherein they abide eternally, and pleasant dwellings in gardens of perpetual residence; but approval from Allāh is greater. It is that which is the great attainment.',
    bn: 'আর মু’মিন পুরুষ ও মু’মিনা নারীদেরকে আল্লাহ এমন উদ্যানসমূহের ও‘য়াদা দিয়ে রেখেছেন যেগুলির নিম্নদেশে বইতে থাকবে নহরসমূহ, যেখানে তারা অনন্ত কাল থাকবে, আরও (ও‘য়াদা দিয়েছেন) উত্তম বাসস্থানসমূহের, ঐ স্থায়ী জান্নাতে। আর আল্লাহর সন্তুষ্টি হচ্ছে সর্বাপেক্ষা বড় নি‘আমাত, এটা হচ্ছে অতি বড় সফলতা।',
  },
];

/** The verse for a date: same verse all day, a different one tomorrow. */
export function verseOfDay(d: Date): Verse {
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  const day = Math.floor((d.getTime() - start) / 86400000);
  return VERSES[day % VERSES.length];
}
