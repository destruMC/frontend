import type { GlobalThemeOverrides } from 'naive-ui/es/config-provider/src/interface'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontWeightStrong: '600',
    primaryColor: '#4a5ac4',
    primaryColorHover: '#6573cd',
    primaryColorPressed: '#4a5ac4',
    primaryColorSuppl: '#4a5ac4',
    bodyColor: '#f5f5f5',
    cardColor: '#ffffff',
    textColor1: '#121115',
    textColor2: '#4a4a4a',
    dividerColor: '#e0e0e0',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontWeightStrong: '600',
    primaryColor: '#4a5ac4',
    primaryColorHover: '#6573cd',
    primaryColorPressed: '#4a5ac4',
    primaryColorSuppl: '#4a5ac4',
    bodyColor: '#111014',
    cardColor: '#1e1e24',
    textColor1: '#ffffff',
    textColor2: '#cccccc',
    dividerColor: '#3a3a40',
  },
}
