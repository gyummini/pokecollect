import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cardsData from '../../card-images/swsh1_cards.json'; // public 폴더 내 JSON import

/**
 * 카드팩 UX (최상단 카드만 드래그) – JSON 이미지 URL 활용
 * ─ packs: 5장 무작위 뽑아서 스택으로 렌더링
 * ─ top 카드 드래그 → 현재 위치에서 exit (우/좌하단)
 * ─ dragSnapToOrigin = false (중앙 복귀 없음)
 */

const EXIT_DURATION = 0.5; // seconds
const DRAG_LIMIT = 50; // 최대 드래그 거리(px)

// 드래그 방향 기반 exit variant (오른쪽: 오른쪽 하단, 왼쪽: 왼쪽 하단)
const exitTop = {
  exit: (_: number) => {
    // 컬렉션북 이미지의 실제 위치(중앙)로 이동하도록 보정
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // 컬렉션북 이미지 크기 및 여백(고정값)
    const bookW = 80; // w-20
    const bookH = 80; // h-20
    const bookRight = 32; // right-8 (8*4)
    const bookBottom = 32; // bottom-8 (8*4)
    // 카드 컨테이너 중앙 좌표
    const cardX = (vw / 2) - 80;
    const cardY = (vh / 2) - 110;
    // 컬렉션북 중앙 좌표
    const bookCenterX = vw - bookRight - (bookW / 2);
    const bookCenterY = vh - bookBottom - (bookH / 2);
    return {
      opacity: 0,
      x: bookCenterX - cardX,
      y: bookCenterY - cardY,
      scale: 0.3,
      rotate: 24,
      transition: { duration: EXIT_DURATION, ease: 'easeInOut' },
    };
  },
};

// 1) JSON → Card 타입 정의
interface Card {
  name: string;
  rarity: string;
  image: string;
}

// 2) util: 무작위 섞기
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// 이미지 경로 생성 함수 (웹 호환)
const getImageSrc = (image: string) => {
  // 외부 URL 그대로 반환
  return image;
};

// 컬렉션북 이미지 경로 (원하는 이미지로 교체 가능)
const COLLECTION_BOOK_IMG = '/pokeball/collectionbook.png';

export default function CardPackFlipDemo() {
  // console.log('framer-motion', motion);
  // console.log('Tailwind test', window.getComputedStyle(document.body).backgroundImage);

  // 3) 최초 5장 뽑기 (useMemo → 재렌더 보호)
  const initialPack: Card[] = useMemo(() => shuffle(cardsData as Card[]).slice(0, 5), []);

  const [cards, setCards] = useState<Card[]>(initialPack); // 남은 카드 스택
  // const [dir, setDir] = useState(0); // 최근 드래그 방향 (미사용)
  // dir을 카드별로 관리
  const [dirMap, setDirMap] = useState<Record<string, number>>({});
  // 컬렉션북 튀어오름 애니메이션 상태
  const [isBouncing, setIsBouncing] = useState(false);
  const bounceTimeoutRef = useRef<number | null>(null);

  // 컬렉션북 bounce 트리거 함수 (연속 트리거 가능하게 개선)
  const triggerBounce = () => {
    if (bounceTimeoutRef.current) {
      window.clearTimeout(bounceTimeoutRef.current);
    }
    setIsBouncing(false); // 먼저 리셋
    setTimeout(() => {
      setIsBouncing(true);
      bounceTimeoutRef.current = window.setTimeout(() => {
        setIsBouncing(false);
      }, 400); // bounce 애니메이션 지속시간(ms)
    }, 0); // 다음 tick에 트리거
  };

  useEffect(() => {
    const isExiting = Object.keys(dirMap).length > 0;
    if (isExiting) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, [dirMap]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-100 to-white select-none">
      <div className="relative w-[160px] h-[220px]">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 ? (
            <motion.div
              key="empty"
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded border-2 border-dashed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-bold text-lg text-gray-700">팩 오픈 완료!</p>
            </motion.div>
          ) : (
            cards.map((card: Card, i: number) => {
              const isTop = i === 0;
              const cardKey = card.name + card.rarity;
              const isExiting = dirMap[cardKey] !== undefined;
              const scale = 1 - i * 0.05;
              const yOffset = i * 6;

              const zIndex = isTop || isExiting ? 9999 : cards.length - i;
              const commonProps = {
                className: 'absolute inset-0 flex flex-col items-center justify-center',
                style: { zIndex },
                initial: { opacity: 0, scale },
                animate: { opacity: 1, scale, y: yOffset },
                layout: !isTop, // 아래 카드만 layout 적용
              } as const;

              if (isTop) {
                // 카드가 exit 중이면 fixed로, 아니면 absolute로
                const isExitingNow = dirMap[cardKey] !== undefined;
                const cardStyle = isExitingNow
                  ? {
                      ...commonProps.style,
                      position: 'fixed' as const,
                      left: `calc(50vw - 80px)`, // 카드 컨테이너 중앙 x
                      top: `calc(50vh - 110px)`, // 카드 컨테이너 중앙 y
                      zIndex,
                      touchAction: 'none',
                      cursor: 'grab',
                    }
                  : { ...commonProps.style, touchAction: 'none', cursor: 'grab' };
                return (
                  <motion.div
                    key={cardKey}
                    {...commonProps}
                    custom={dirMap[cardKey]}
                    variants={exitTop}
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: -DRAG_LIMIT, right: DRAG_LIMIT }}
                    dragElastic={0.15}
                    dragMomentum={false}
                    dragSnapToOrigin={false}
                    onDragEnd={(_e: unknown, info: { point: { x: number } }) => {
                      if (cards.length === 0) return;
                      const pageCenter = window.innerWidth / 2;
                      const d = info.point.x > pageCenter ? 1 : -1;
                      setDirMap((prev) => ({ ...prev, [cardKey]: d }));
                      setCards((prev: Card[]) => prev.slice(1));
                    }}
                    onAnimationComplete={(def: any) => {
                      if (def === 'exit') triggerBounce();
                    }}
                    dragTransition={{ power: 0.1, timeConstant: 200, modifyTarget: (target: number) => Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, target)) }}
                    className={commonProps.className + ' card-pack-top'}
                    style={cardStyle}
                  >
                    <img
                      src={getImageSrc(card.image)}
                      alt={card.name}
                      className="w-80 h-[420px] object-contain pointer-events-none select-none rounded-lg shadow-lg border border-gray-200 bg-white/80"
                      draggable={false}
                    />
                    <div className="mt-2 text-center">
                      <p className="font-bold text-base leading-tight text-gray-800 drop-shadow-sm">{card.name}</p>
                      <p className="text-xs text-gray-500">{card.rarity}</p>
                    </div>
                  </motion.div>
                );
              }

              // 아래 카드(텍스트 없음)
              return (
                <motion.div key={card.name + card.rarity} {...commonProps}>
                  <img src={getImageSrc(card.image)} alt={card.name} className="w-80 h-[420px] object-contain rounded-lg shadow-lg border border-gray-200 bg-white/80" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        {/* 우하단 motion.img 컬렉션북 이미지 (bounce 애니메이션) */}
        <motion.img
          src={COLLECTION_BOOK_IMG}
          alt="컬렉션북"
          className="fixed right-8 bottom-8 w-20 h-20 drop-shadow-xl z-[10000]"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          animate={isBouncing ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, times: [0, 0.3, 1], ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
