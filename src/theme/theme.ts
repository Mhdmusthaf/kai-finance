// KAI design tokens — React Native / Expo
// Source of truth for colour, type, spacing, radius, shadow and motion.

export const colors = {
  // Primary
  forest: '#0B3D2E',      // headlines, primary buttons, dark surfaces
  mint: '#3ED1A0',        // accent on dark only — never text on light
  cream: '#FFF8F1',       // brand canvas, text on forest
  // Functional greens
  leaf: '#22A06B',        // icons, charts, mascot leaf
  deepMint: '#17805A',    // links, CTAs on light, positive text (4.9:1 on white)
  // Secondary
  lavender: '#C7B6FF',    // AI / insight moments
  peach: '#FFB89A',       // reminders, warmth
  sage: '#94B3A1',        // muted text on forest
  softGreen: '#D8F3E5',   // success bg, active tab pill
  softPurple: '#E9E3FF',  // insight cards
  // Neutrals
  charcoal: '#1A1A1A',
  darkGreen: '#06241B',   // dark grounds
  gray: '#5F6E67',        // secondary text (5.4:1 on white)
  lightGray: '#F2F4F3',   // inputs, segmented bg, skeletons
  offWhite: '#FCFBF8',    // app background
  white: '#FFFFFF',
  line: '#ECE7DC',        // card borders
  divider: '#F2EFE8',     // row dividers
  muted: '#94A39C',       // tertiary text, placeholders
  // Semantic (text on tinted bg)
  successText: '#126B4B', successBg: '#D8F3E5',
  warningText: '#9A5B00', warningBg: '#FFF1DC',
  errorText: '#A8361F',   errorBg: '#FFE8E0',
  infoText: '#5B40C9',    infoBg: '#E9E3FF',
  // Category palette (charts, chips)
  catFood: '#F7A47F', catShopping: '#B9A4F5', catRent: '#0B3D2E', catTransport: '#3ED1A0',
  catBills: '#94B3A1', catEmi: '#E0A030', catOther: '#D9D2C3',
} as const;

export const gradients = {
  forestHero: ['#1D6E53', '#0B3D2E', '#072C20'],     // radial, light from top-right
  darkPremium: ['#0F4A37', '#06241B', '#02110C'],
  creamWorld: ['#FFFDF9', '#FBF4EA', '#F1E7D7'],
  creamToMint: ['#FFF8F1', '#EAF8F0', '#C9F0DD'],
  mintWorld: ['#D6F8E9', '#A9EBCD', '#86DDB7'],
  lavenderToCream: ['#E9E3FF', '#F6F0F6', '#FFF8F1'],
  peachWorld: ['#FFFAF6', '#FFE9DD', '#FFD6C2'],
  voiceButton: ['#1F7A5A', '#0B3D2E', '#072C20'],    // radial, highlight top-left
} as const;

export const fonts = {
  display: 'Nunito_800ExtraBold',
  displayBold: 'Nunito_700Bold',
  ui: 'NunitoSans_400Regular',
  uiSemi: 'NunitoSans_600SemiBold',
  uiBold: 'NunitoSans_700Bold',
  uiHeavy: 'NunitoSans_800ExtraBold',
} as const;

// fontSize / lineHeight / letterSpacing (px). Numbers always use tabular figures:
// fontVariant: ['tabular-nums', 'lining-nums']
export const type = {
  display:   { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  h1:        { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  h2:        { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h3:        { fontFamily: fonts.display, fontSize: 19, lineHeight: 25 },
  h4:        { fontFamily: fonts.displayBold, fontSize: 17, lineHeight: 23 },
  bodyLg:    { fontFamily: fonts.ui, fontSize: 16, lineHeight: 24 },
  body:      { fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 21 },
  bodySm:    { fontFamily: fonts.ui, fontSize: 13, lineHeight: 18 },
  caption:   { fontFamily: fonts.uiSemi, fontSize: 12, lineHeight: 16 },
  label:     { fontFamily: fonts.uiHeavy, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  button:    { fontFamily: fonts.uiHeavy, fontSize: 16, lineHeight: 20 },
  tab:       { fontFamily: fonts.uiBold, fontSize: 11, lineHeight: 14 },
  amount:    { fontFamily: fonts.uiBold, fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] as const },
  amountLg:  { fontFamily: fonts.uiHeavy, fontSize: 32, lineHeight: 38, letterSpacing: -0.6, fontVariant: ['tabular-nums'] as const },
  amountXl:  { fontFamily: fonts.uiHeavy, fontSize: 44, lineHeight: 50, letterSpacing: -0.9, fontVariant: ['tabular-nums'] as const },
} as const;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, screenX: 20, sectionGap: 18 } as const;
export const radius = { sm: 12, md: 16, lg: 20, xl: 22, card: 22, hero: 26, sheet: 28, pill: 999 } as const;
export const size = { touchMin: 44, buttonLg: 56, buttonMd: 52, buttonSm: 46, chip: 36, iconChip: 44, tabBar: 84, fab: 62, screenW: 390 } as const;

export const shadow = {
  card: { shadowColor: '#06241B', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  hero: { shadowColor: '#06241B', shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 18 }, elevation: 8 },
  fab:  { shadowColor: '#06241B', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
} as const;

export const motion = {
  press: { duration: 90, scale: 0.97 },
  sheet: { type: 'spring', damping: 0.85, duration: 280 },
  cardExpand: 240,
  success: 600,
  goalComplete: 1400,
  chartGrow: { duration: 400, stagger: 30 },
  skeletonShimmer: 1200,
  undoSnackbar: 6000,       // ms visible
  autoSaveSimpleVoice: 3000, // ms before a simple voice entry auto-confirms
} as const;

// Money formatting: Indian digit grouping, ₹ prefix, signed changes.
export const formatINR = (n: number, opts: { sign?: boolean } = {}) => {
  const s = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const sign = opts.sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : n < 0 ? '−' : '';
  return `${sign}₹${s}`;
};
