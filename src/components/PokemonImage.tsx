import React from 'react';

// 한글 → 영어 포켓몬 이름 매핑
const koreanToEnglish: Record<string, string> = {
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

interface PokemonImageProps {
  name: string;
  size?: number;
}

const PokemonImage: React.FC<PokemonImageProps> = ({ name, size = 96 }) => {
  const engName = koreanToEnglish[name] || name;
  const path = `/public/pokemon/${engName}.png`;
  return (
    <img
      src={path}
      alt={name}
      style={{
        width: size,
        height: size,
        display: 'block',
        margin: '0 auto',
        objectFit: 'contain',
        borderRadius: 8,
      }}
      onError={e => {
        const emojiMap: Record<string, string> = {
          '이브이': '🦊',
          '파이리': '🔥',
          '꼬부기': '🐢',
          '캐터피': '🐛',
          '샤미드': '🦊',
          '리자드': '🔥',
          '어니부기': '🐢',
          '단데기': '🐛',
          '부스터': '🦊',
          '리자몽': '🔥',
          '거북왕': '🐢',
          '버터플': '🦋',
          '뮤츠': '👾',
          '뮤': '✨',
        };
        const span = document.createElement('span');
        span.textContent = emojiMap[name] || '❓';
        span.style.fontSize = '32px';
        span.style.display = 'block';
        span.style.textAlign = 'center';
        (e.target as HTMLImageElement).replaceWith(span);
      }}
    />
  );
};

export default PokemonImage;
