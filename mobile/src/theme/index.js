import colors from './colors';
import typography from './typography';
import spacing from './spacing';
import shadows from './shadows';

export const theme = {
  colors: {
    ...colors.light,
    light: colors.light,
    dark: colors.dark
  },
  typography,
  spacing,
  shadows
};

export default theme;
