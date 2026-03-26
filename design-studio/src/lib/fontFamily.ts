export const fontFamilyMap: Record<string, string> = {
  'Secular One': "'Secular One', sans-serif",
  'Heebo': "'Heebo', sans-serif",
  'Playpen Sans Hebrew': "'Playpen Sans', cursive",
  'Assistant': "'Assistant', sans-serif",
  'Suez One': "'Suez One', serif",
  'Rubik': "'Rubik', sans-serif",
  'Amatic SC': "'Amatic SC', cursive",
  'Varela Round': "'Varela Round', sans-serif",
  'Frank Ruhl Libre': "'Frank Ruhl Libre', serif",
  'Miriam Libre': "'Miriam Libre', serif",
  'Alef': "'Alef', sans-serif",
  'David Libre': "'David Libre', serif",
};

export function getFontFamily(name: string): string {
  return fontFamilyMap[name] || `'${name}', sans-serif`;
}
