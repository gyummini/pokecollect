// tools/generateKoreanToEnglish.ts
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Card {
  name: string;
  rarity: string;
  image: string;
}

// 영어이름으로 PokeAPI에서 한글 이름 가져오는 함수
async function getKoreanName(englishName: string): Promise<string | null> {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${englishName.toLowerCase()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const korean = data.names.find((n: any) => n.language.name === 'ko');
    return korean ? korean.name : null;
  } catch {
    return null;
  }
}

async function main() {
  // 1. 카드 데이터 읽기
  const jsonStr = await fs.readFile(path.resolve(__dirname, '../card-images/swsh1_cards.json'), 'utf-8');
  const cards: Card[] = JSON.parse(jsonStr);

  // 2. 영어 이름만, 중복 없이 추출
  const englishNames = Array.from(new Set(cards.map(card => card.name.toLowerCase())));

  // 3. 매핑 생성
  let result = '// 자동 생성 파일. 직접 수정하지 마세요!\n';
  result += 'export const koreanToEnglish: Record<string, string> = {\n';

  for (const engName of englishNames) {
    const korName = await getKoreanName(engName);
    if (korName) {
      result += `  '${korName}': '${engName}',\n`;
      console.log(`매핑됨: ${korName} → ${engName}`);
    } else {
      console.log(`❗️${engName}는 한글 이름을 찾지 못함`);
    }
    await new Promise(res => setTimeout(res, 60));
  }

  result += '};\n';

  // 4. TypeScript 파일로 저장
  const outPath = path.resolve(__dirname, '../src/utils/koreanToEnglish.ts');
  await fs.writeFile(outPath, result, 'utf-8');
  console.log(`\n✅ ${outPath} 파일 생성 완료!`);
}

main();
