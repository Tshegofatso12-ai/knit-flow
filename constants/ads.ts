import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Use test IDs during development, real IDs in production
const isProduction = !__DEV__;

export const BANNER_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: 'ca-app-pub-3022911898728747/9106819196',
      android: 'ca-app-pub-3022911898728747/9106819196',
      default: TestIds.BANNER,
    })!
  : TestIds.BANNER;
