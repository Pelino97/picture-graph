// 추천 주제와 예시 항목, 주제에 맞는 그림(이모지) 후보
export const RECOMMENDED_TOPICS = [
  {
    id: 'noise',
    title: '쉬는 시간, 우리 반 교실에서 가장 개선해야 할 소음 원인은?',
    items: ['큰 소리로 떠들기', '뛰어다니기', '의자 끄는 소리', '물건 떨어뜨리기'],
    icons: ['🔊', '👂', '📢'],
  },
  {
    id: 'indoor-play',
    title: '비 오는 날(미세먼지 나쁜 날) 점심시간에 하고 싶은 실내 놀이는?',
    items: ['보드게임', '종이접기', '그림 그리기', '몸으로 말해요'],
    icons: ['🎲', '🧩', '☂️'],
  },
  {
    id: 'town',
    title: '우리 동네(의정부 등)에서 친구에게 가장 추천하고 싶은 자랑거리는?',
    items: ['맛있는 음식점', '넓은 공원', '도서관', '놀이터'],
    icons: ['🏡', '🌳', '⭐'],
  },
  {
    id: 'lunch',
    title: '급식실에서 우리 반 친구들이 가장 많이 남기는 반찬 종류는?',
    items: ['나물 반찬', '생선 반찬', '김치', '국'],
    icons: ['🥗', '🍚', '🥢'],
  },
  {
    id: 'device',
    title: '스마트폰이나 태블릿을 사용할 때 주로 하는 활동은?',
    items: ['영상 보기', '게임하기', '사진 찍기', '공부하기'],
    icons: ['📱', '🎮', '📷'],
  },
  {
    id: 'money',
    title: '내가 받은 용돈(또는 생일 선물 돈)을 가장 많이 사용하는 곳은?',
    items: ['문구점', '편의점', '저금하기', '장난감 가게'],
    icons: ['🐷', '🪙', '🛍️'],
  },
  {
    id: 'robot',
    title: "학교에 'AI 로봇 도우미'가 1대 도입된다면, 가장 먼저 맡기고 싶은 일은?",
    items: ['교실 청소', '급식 배식 돕기', '공부 도와주기', '책 정리하기'],
    icons: ['🤖', '🔧', '💡'],
  },
]

// 개별 주제용 단순한 선형 아이콘 (SVG로 그림)
export const LINE_ICONS = ['circle', 'star', 'heart', 'person', 'square', 'triangle']

export const LINE_ICON_NAMES = {
  circle: '동그라미',
  star: '별',
  heart: '하트',
  person: '사람',
  square: '네모',
  triangle: '세모',
}

export const GROUPS = [1, 2, 3, 4, 5, 6, 7, 8]

export const LIMITS = {
  topic: 40,
  item: 12,
  insight: 300,
  maxTarget: 40,
  maxIconsPerRow: 20,
}

export function findTopic(id) {
  return RECOMMENDED_TOPICS.find((t) => t.id === id) || null
}
