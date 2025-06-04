// 한글 → 영어 포켓몬 이름 매핑 및 이미지 유틸
export const koreanToEnglish: Record<string, string> = {
  '이브이': 'eevee',
  '파이리': 'charmander',
  '꼬부기': 'squirtle',
  '캐터피': 'caterpie',
  '샤미드': 'vaporeon',
  '리자드': 'charmeleon',
  '어니부기': 'wartortle',
  '단데기': 'metapod',
  '부스터': 'flareon',
  '리자몽': 'charizard',
  '거북왕': 'blastoise',
  '버터플': 'butterfree',
  '뮤츠': 'mewtwo',
  '뮤': 'mew',
};

export function getPokemonImage(name: string, size: number = 24) {
  const engName = koreanToEnglish[name] || name;
  const path = `/public/pokemon/${engName}.png`;
  return (
    <img
      src={path}
      alt={name}
      style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'cover', borderRadius: 4 }}
    />
  );
}
