import type { QnaListEntry, QnaPost, QnaPreviewCard, QnaType } from "@/types/qna";

/**
 * THE PHARMA Recruit 채용 QNA 시드 데이터.
 * 약사 QNA(qnaType: "pharmacist")는 약국·병원 약사 게시글, 산업 QNA(qnaType: "industry")는
 * 제약·바이오 산업 게시글이다. 실제 API가 연결되기 전까지 목록·상세 화면의 화면 예시용
 * 데이터로만 사용한다. 제목·본문·댓글 문구는 예시 텍스트를 그대로 옮긴 것이다.
 */

export const qnaPopularTags = ["취업·이직", "면접·전형", "연봉·복지", "근무환경", "개국", "연구개발", "임상", "RA"];

export const qnaOperationPrinciple = {
  title: "QNA 운영 원칙",
  description: "익명 회원은 식별되지 않으며, 기업·헤드헌터는 공개된 산업 토론에만 참여할 수 있습니다.",
};

/** 목록 상단 카테고리 필터 칩 — 해당 유형 데이터에 실제로 존재하는 category/태그만 사용 */
export const qnaCategoryFilters: Record<QnaType, string[]> = {
  pharmacist: ["약국", "병원", "개국", "양수양도", "실무"],
  industry: ["채용", "경력직", "취업·이직", "연봉·복지", "면접·전형"],
};

export const qnaPosts: QnaPost[] = [
  {
    id: "industry-job-001",
    qnaType: "industry",
    category: "산업",
    tags: ["채용", "경력직"],
    title: "[한미약품] 2026 상반기 R&D·임상 부문 경력직 공개 채용 안내",
    body: [
      "안녕하세요, 한미약품 채용팀입니다.",
      "2026년 상반기 R&D·임상 부문 경력직 공개 채용을 진행합니다. 신약개발, 임상개발(Clinical Operations), RA(인허가) 직무에서 인재를 모집하고 있습니다.",
      "· 모집 직무: 신약개발 연구원, 임상개발 PM, RA 매니저\n· 지원 자격: 관련 경력 3년 이상\n· 전형 절차: 서류 → 1차 실무 면접 → 2차 임원 면접",
      "자세한 내용과 지원은 채용공고 페이지를 참고해 주세요. 지원자분들의 많은 관심 부탁드립니다.",
    ],
    authorType: "company",
    authorName: "한미약품 채용팀",
    authorLabel: "기업 공식 계정",
    avatarInitial: "한",
    companyName: "한미약품",
    createdAtLabel: "3시간 전",
    minutesAgo: 180,
    viewCount: 3742,
    likeCount: 30,
    comments: [
      {
        id: "industry-job-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "2시간 전",
        likeCount: 5,
        body: "RA 매니저 포지션 경력 요건이 정확히 어떻게 되나요? 공고에 명시된 것보다 더 구체적으로 알 수 있을까요?",
        replies: [
          {
            id: "industry-job-001-c1-r1",
            authorType: "company",
            authorName: "한미약품 채용팀",
            authorLabel: "기업 공식 계정",
            avatarInitial: "한",
            createdAtLabel: "1시간 전",
            likeCount: 7,
            body: "문의 감사합니다. RA 매니저는 의약품 인허가 경력 5년 이상, 글로벌 등록 경험 보유자를 우대합니다. 세부 요건은 공고를 참고 부탁드립니다.",
          },
        ],
      },
    ],
    relatedPostIds: ["industry-career-001", "industry-salary-001", "industry-interview-001"],
  },
  {
    id: "industry-career-001",
    qnaType: "industry",
    category: "산업",
    tags: ["취업·이직", "MedicalAffairs"],
    title: "RA에서 Medical Affairs로 직무 전환, 현실적인 조언 구합니다",
    body: [
      "5년차 RA로 일하고 있습니다. 인허가 업무를 하면서 점점 제품 전략과 의학적 커뮤니케이션 쪽에 관심이 생겨 Medical Affairs로의 전환을 고민하고 있어요.",
      "주변에서 RA에서 MA로 넘어가신 분들을 보면, 규제 지식이 강점이 되긴 하지만 결국 임상 데이터 해석과 KOL 커뮤니케이션 역량을 따로 증명해야 한다고 하더라고요.",
      "MSL 직무로 먼저 들어가는 게 나을지, 아니면 본사 MA 포지션을 바로 노리는 게 맞을지 경험 있으신 분들의 조언을 구하고 싶습니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    createdAtLabel: "6시간 전",
    minutesAgo: 360,
    viewCount: 4531,
    likeCount: 65,
    comments: [
      {
        id: "industry-career-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "5시간 전",
        likeCount: 14,
        body: "저도 RA 6년 하다가 MSL로 전환했어요. 결론부터 말하면 MSL을 거쳐 MA 본사로 가는 루트가 현실적입니다. RA 백그라운드는 안전성·규제 커뮤니케이션에서 확실히 강점이 돼요.",
        replies: [
          {
            id: "industry-career-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            authorLabel: "작성자",
            avatarInitial: "산",
            isPostAuthor: true,
            createdAtLabel: "4시간 전",
            likeCount: 3,
            body: "역시 MSL을 먼저 거치는 게 안전하겠네요. 경험 공유 감사합니다!",
          },
        ],
      },
      {
        id: "industry-career-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "4시간 전",
        likeCount: 9,
        body: "치료 영역(TA)을 하나 정해서 그 질환의 임상 가이드라인과 핵심 논문을 정리해두세요. 면접에서 그 깊이를 봅니다.",
        replies: [],
      },
      {
        id: "industry-career-001-c3",
        authorType: "company",
        authorName: "한미약품 채용팀",
        authorLabel: "기업 공식 계정",
        avatarInitial: "한",
        createdAtLabel: "3시간 전",
        likeCount: 6,
        body: "현재 당사 Medical Affairs 팀에서 MSL 및 MA 매니저 포지션을 상시 채용 중입니다. RA 경력자도 지원 가능하니 채용공고를 참고해 주세요.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-job-001", "industry-salary-001", "industry-interview-001"],
  },
  {
    id: "industry-salary-001",
    qnaType: "industry",
    category: "산업",
    tags: ["연봉·복지", "이직"],
    title: "바이오텍 vs 대형 제약사, 처우 차이 솔직하게 비교해봤어요",
    body: [
      "양쪽 다 경험해본 입장에서 처우 차이를 최대한 솔직하게 정리해봤습니다.",
      "초봉은 대형 제약사가 안정적으로 높은 편이고, 바이오텍은 편차가 큽니다. 다만 바이오텍은 스톡옵션이 변수예요. 상장 전 합류하면 업사이드가 있지만 리스크도 그만큼 큽니다.",
      "복지와 안정성은 대형 제약사가 확실히 낫고, 의사결정 속도와 업무 범위는 바이오텍이 넓습니다. 본인이 안정성을 원하는지, 빠른 성장과 지분 업사이드를 원하는지에 따라 갈린다고 봐요.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    createdAtLabel: "9시간 전",
    minutesAgo: 540,
    viewCount: 8920,
    likeCount: 157,
    comments: [
      {
        id: "industry-salary-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "8시간 전",
        likeCount: 22,
        body: "스톡옵션은 정말 복불복이죠. 행사가랑 베스팅 조건 꼼꼼히 봐야 합니다.",
        replies: [],
      },
      {
        id: "industry-salary-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "6시간 전",
        likeCount: 9,
        body: "정리 깔끔하네요. 저는 안정성을 택해서 제약사에 남았습니다.",
        replies: [],
      },
      {
        id: "industry-salary-001-c3",
        authorType: "headhunter",
        authorName: "헤드헌터 김선우",
        authorLabel: "헤드헌터 공식 계정",
        avatarInitial: "헤",
        createdAtLabel: "7시간 전",
        likeCount: 7,
        body: "서치펌 컨설턴트 관점에서도 동의합니다. 다만 최근 시리즈 B 이후 바이오텍은 처우가 안정적인 곳이 많아져서, 일괄적으로 리스크가 크다고 보긴 어렵습니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-job-001", "industry-career-001", "industry-interview-001"],
  },
  {
    id: "industry-interview-001",
    qnaType: "industry",
    category: "산업",
    tags: ["면접·전형", "CDMO"],
    title: "CDMO 공정개발 직무 면접 후기 (1차 실무 → 2차 임원)",
    body: [
      "최근 삼성바이오로직스 공정개발(Downstream) 포지션 전형을 마쳐서 기억이 생생할 때 공유합니다.",
      "1차는 실무 면접이었고, 프로젝트 경험 중심으로 깊게 들어왔습니다. 정제 공정 스케일업 경험, 컬럼 크로마토그래피 트러블슈팅 사례를 구체적으로 물어봤어요. 왜 그 조건을 선택했는지를 끝까지 파고듭니다.",
      "2차는 임원 면접이었는데, 기술 질문보다는 협업 경험과 장기적인 커리어 방향, 조직 적합성을 봤습니다.",
      "전체적으로 압박은 크지 않았지만, 자기 경험을 데이터로 설명할 수 있어야 합니다. 결과 통보는 2차 후 약 1주일 걸렸어요.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    companyName: "삼성바이오로직스",
    createdAtLabel: "어제",
    minutesAgo: 1440,
    viewCount: 5338,
    likeCount: 73,
    comments: [
      {
        id: "industry-interview-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "20시간 전",
        likeCount: 7,
        body: "Downstream 직무 준비 중인데 큰 도움이 됩니다. 혹시 영어 인터뷰 비중도 있었나요?",
        replies: [
          {
            id: "industry-interview-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            authorLabel: "작성자",
            avatarInitial: "산",
            isPostAuthor: true,
            createdAtLabel: "19시간 전",
            likeCount: 4,
            body: "외국인 임원이 있는 부서는 일부 영어로 진행된다고 들었는데, 제 경우는 한국어로만 봤습니다.",
          },
        ],
      },
      {
        id: "industry-interview-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        createdAtLabel: "18시간 전",
        likeCount: 5,
        body: "결과 통보 1주일이면 빠른 편이네요. 후기 감사합니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-job-001", "industry-career-001", "industry-salary-001"],
  },
  {
    id: "pharmacist-opening-001",
    qnaType: "pharmacist",
    category: "약국",
    tags: ["개국", "양수양도"],
    title: "문전 약국 양도 검토 중인데, 권리금 산정 어떻게 보세요?",
    body: [
      "문전 약국 양도를 검토 중입니다. 처방전 응대 비율과 월 일매를 기준으로 권리금을 제시받았는데, 적정선인지 판단이 서질 않네요.",
      "해당 약국은 종합병원 인근이라 처방 의존도가 높은 편이고, 최근 6개월 평균 일 처방 건수와 일매 자료는 받아봤습니다.",
      "비슷한 입지에서 양수·양도 경험 있으신 분들은 권리금을 어떤 기준으로 산정하셨는지, 처방 병원의 이전 리스크는 어떻게 반영하셨는지 궁금합니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    createdAtLabel: "2시간 전",
    minutesAgo: 120,
    viewCount: 1284,
    likeCount: 52,
    isBest: true,
    comments: [
      {
        id: "pharmacist-opening-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        createdAtLabel: "1시간 전",
        likeCount: 18,
        body: "문전은 결국 처방 병원 리스크가 핵심이에요. 병원 임대차 잔여기간이랑 이전 계획부터 확인하세요. 권리금은 보통 연 순이익을 기준으로 봅니다.",
        replies: [
          {
            id: "pharmacist-opening-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 약사",
            authorLabel: "작성자",
            avatarInitial: "약",
            isPostAuthor: true,
            createdAtLabel: "42분 전",
            likeCount: 2,
            body: "잔여 임대기간은 꼭 확인해야겠네요. 답변 감사합니다.",
          },
        ],
      },
      {
        id: "pharmacist-opening-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        createdAtLabel: "38분 전",
        likeCount: 11,
        body: "최근에 비슷한 입지 양수했는데, 일매보다 처방 안정성을 훨씬 깐깐하게 봤습니다. 단골 비중도 같이 보세요.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-career-001", "pharmacist-salary-001", "pharmacist-hospital-001"],
  },
  {
    id: "pharmacist-practice-001",
    qnaType: "pharmacist",
    category: "약국",
    tags: ["실무", "복약지도"],
    title: "조제 더블체크 루틴, 이렇게 바꾸니 실수가 줄었어요",
    body: [
      "조제 실수를 줄이려고 더블체크 절차를 손봤는데 확실히 효과가 있어서 공유합니다.",
      "특히 유사 약품명·고용량 약물은 별도 체크 포인트를 두고, 투약 전 라벨과 처방을 한 번 더 대조하는 루틴을 넣었어요.",
      "바쁜 시간대엔 지키기 어려울 때도 있지만, 사고 한 번 나는 것보다 낫더라고요. 다들 어떤 방식 쓰시는지 궁금합니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    createdAtLabel: "7시간 전",
    minutesAgo: 420,
    viewCount: 1455,
    likeCount: 38,
    comments: [
      {
        id: "pharmacist-practice-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        createdAtLabel: "6시간 전",
        likeCount: 11,
        body: "고용량·유사 약품명 따로 관리하는 거 정말 중요하죠. 저희는 색깔 라벨로 구분합니다.",
        replies: [],
      },
      {
        id: "pharmacist-practice-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        createdAtLabel: "5시간 전",
        likeCount: 6,
        body: "바쁠 때일수록 루틴이 지켜지는지가 관건이더라고요. 좋은 공유 감사합니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-opening-001", "pharmacist-career-001", "pharmacist-salary-001"],
  },
];

/**
 * 목록 카드 전용 보조 게시글 — 상세 본문이 없어 클릭해도 상세페이지로 연결하지 않는다.
 * (예시 데이터 원문이 "목록 카드에서만 사용" 한다고 명시한 항목)
 */
export const qnaPreviewCards: QnaPreviewCard[] = [
  {
    id: "pharmacist-career-001",
    qnaType: "pharmacist",
    category: "병원",
    tags: ["취업·이직"],
    title: "병원약사에서 제약 메디컬로 이직, 면허 메리트 있을까요?",
    preview:
      "병원약사 경력을 바탕으로 제약사 메디컬 직무 이직을 고민하고 있습니다. 약사 면허와 병원 실무 경험이 실제 채용 과정에서 어느 정도 강점이 되는지 궁금합니다.",
    authorType: "anonymous",
    authorName: "익명 · 병원약사",
    avatarInitial: "약",
    createdAtLabel: "3시간 전",
    minutesAgo: 180,
    likeCount: 51,
    commentCount: 23,
  },
  {
    id: "pharmacist-salary-001",
    qnaType: "pharmacist",
    category: "약국",
    tags: ["연봉·복지"],
    title: "근무약사 처우 협상, 다들 어디까지 받으세요?",
    preview: "이직 제안을 받았는데 연봉과 인센티브 기준을 어떻게 협상해야 할지 고민입니다. 근무 형태와 경력에 따른 실제 협상 경험을 듣고 싶습니다.",
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    createdAtLabel: "5시간 전",
    minutesAgo: 300,
    likeCount: 44,
    commentCount: 26,
  },
  {
    id: "pharmacist-hospital-001",
    qnaType: "pharmacist",
    category: "병원",
    tags: ["실무", "취업·이직"],
    title: "대학병원 약제부 항암주사 조제 파트, 실제 업무 강도는?",
    preview: "대학병원 약제부 항암주사 조제 파트 지원을 고민 중입니다. 교대 형태와 업무 강도, 적응 과정에 대한 실제 경험이 궁금합니다.",
    authorType: "anonymous",
    authorName: "익명 · 병원약사",
    avatarInitial: "약",
    createdAtLabel: "4시간 전",
    minutesAgo: 240,
    likeCount: 41,
    commentCount: 28,
  },
];

export function isQnaPost(entry: QnaListEntry): entry is QnaPost {
  return "comments" in entry;
}

export function getQnaPosts(type: QnaType): QnaPost[] {
  return qnaPosts.filter((post) => post.qnaType === type);
}

export function getQnaPreviewCards(type: QnaType): QnaPreviewCard[] {
  return qnaPreviewCards.filter((card) => card.qnaType === type);
}

/** 목록에 보여줄 전체 항목(상세 있는 글 + 카드 전용 글) */
export function getQnaListEntries(type: QnaType): QnaListEntry[] {
  return [...getQnaPosts(type), ...getQnaPreviewCards(type)];
}

export function getQnaPostById(id: string): QnaPost | undefined {
  return qnaPosts.find((post) => post.id === id);
}

/** 답글까지 포함한 댓글 수 — 목록 카드와 상세페이지가 항상 같은 값을 보도록 한 곳에서 계산 */
export function getCommentCount(post: QnaPost): number {
  return post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

export function getEntryCommentCount(entry: QnaListEntry): number {
  return isQnaPost(entry) ? getCommentCount(entry) : entry.commentCount;
}

export function getEntryLikeCount(entry: QnaListEntry): number {
  return entry.likeCount;
}

export function getEntryMinutesAgo(entry: QnaListEntry): number {
  return entry.minutesAgo;
}

/** 같은 유형 안에서 likeCount 내림차순으로 뽑은 실시간 인기 글 (사이드바용) */
export function getPopularQnaEntries(type: QnaType, limit = 5): QnaListEntry[] {
  return [...getQnaListEntries(type)].sort((a, b) => b.likeCount - a.likeCount).slice(0, limit);
}

/** 관련 글 id를 같은 유형의 실제 항목(상세 글 또는 카드 전용 글)으로 변환 */
export function getRelatedQnaEntries(post: QnaPost): QnaListEntry[] {
  const pool: QnaListEntry[] = [...qnaPosts, ...qnaPreviewCards];
  return post.relatedPostIds
    .map((id) => pool.find((entry) => entry.id === id))
    .filter((entry): entry is QnaListEntry => Boolean(entry));
}
