// utils/theme.js
export const applyThemeToBody = (isDark) => {
  document.body.style.background = isDark ? "#0f172a" : "#f8fafc";
  document.body.style.color = isDark ? "#ffffff" : "#000000";
};
