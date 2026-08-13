import { qnaTagPool } from "@/config/qnaTags";
import type { QnaListEntry, QnaPost, QnaType } from "@/types/qna";

/**
 * THE PHARMA Recruit 채용 QNA 시드 데이터.
 * 약사 QNA(qnaType: "pharmacist")는 약국·병원 약사 게시글, 산업 QNA(qnaType: "industry")는
 * 제약·바이오 산업 게시글이다. 실제 API가 연결되기 전까지 목록·상세 화면의 화면 예시용
 * 데이터로만 사용한다. 제목·본문·댓글 문구는 예시 텍스트를 그대로 옮긴 것이다.
 */

export const qnaOperationPrinciple = {
  title: "QNA 운영 원칙",
  description:
    "익명 회원은 식별되지 않으며, 약사 QNA에는 인증된 약사와 예비약사가, 기업·헤드헌터는 공개된 산업 토론에만 참여할 수 있습니다.",
};

/** 목록 상단 카테고리 필터 칩 — qnaTags.ts의 태그 풀을 그대로 참조한다(더 이상 별도 category 값이 아니다) */
export const qnaCategoryFilters: Record<QnaType, string[]> = qnaTagPool;

export const qnaPosts: QnaPost[] = [
  {
    id: "industry-job-001",
    qnaType: "industry",
    tags: ["취업·이직", "인허가·임상"],
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
    nickname: "한미약품 채용팀",
    jobRole: "",
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
        nickname: "익명1",
        jobRole: "RA",
        createdAtLabel: "2시간 전",
        likeCount: 5,
        body: "RA 매니저 포지션 경력 요건이 정확히 어떻게 되나요? 공고에 명시된 것보다 더 구체적으로 알 수 있을까요?",
        isMine: true,
        replies: [
          {
            id: "industry-job-001-c1-r1",
            authorType: "company",
            authorName: "한미약품 채용팀",
            authorLabel: "기업 공식 계정",
            avatarInitial: "한",
            nickname: "한미약품 채용팀",
            jobRole: "",
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
    isMine: true,
    tags: ["커리어", "인허가·임상"],
    title: "RA에서 Medical Affairs로 직무 전환, 현실적인 조언 구합니다",
    body: [
      "5년차 RA로 일하고 있습니다. 인허가 업무를 하면서 점점 제품 전략과 의학적 커뮤니케이션 쪽에 관심이 생겨 Medical Affairs로의 전환을 고민하고 있어요.",
      "주변에서 RA에서 MA로 넘어가신 분들을 보면, 규제 지식이 강점이 되긴 하지만 결국 임상 데이터 해석과 KOL 커뮤니케이션 역량을 따로 증명해야 한다고 하더라고요.",
      "MSL 직무로 먼저 들어가는 게 나을지, 아니면 본사 MA 포지션을 바로 노리는 게 맞을지 경험 있으신 분들의 조언을 구하고 싶습니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    nickname: "익명",
    jobRole: "RA",
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
        nickname: "익명1",
        jobRole: "MSL",
        createdAtLabel: "5시간 전",
        likeCount: 14,
        body: "저도 RA 6년 하다가 MSL로 전환했어요. 결론부터 말하면 MSL을 거쳐 MA 본사로 가는 루트가 현실적입니다. RA 백그라운드는 안전성·규제 커뮤니케이션에서 확실히 강점이 돼요.",
        replies: [
          {
            id: "industry-career-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "RA",
            isPostAuthor: true,
            createdAtLabel: "4시간 전",
            likeCount: 3,
            body: "역시 MSL을 먼저 거치는 게 안전하겠네요. 경험 공유 감사합니다!",
            isMine: true,
          },
        ],
      },
      {
        id: "industry-career-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명2",
        jobRole: "마케팅",
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
        nickname: "한미약품 채용팀",
        jobRole: "",
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
    tags: ["연봉·처우", "커리어"],
    title: "바이오텍 vs 대형 제약사, 처우 차이 솔직하게 비교해봤어요",
    body: [
      "양쪽 다 경험해본 입장에서 처우 차이를 최대한 솔직하게 정리해봤습니다.",
      "초봉은 대형 제약사가 안정적으로 높은 편이고, 바이오텍은 편차가 큽니다. 다만 바이오텍은 스톡옵션이 변수예요. 상장 전 합류하면 업사이드가 있지만 리스크도 그만큼 큽니다.",
      "복지와 안정성은 대형 제약사가 확실히 낫고, 의사결정 속도와 업무 범위는 바이오텍이 넓습니다. 본인이 안정성을 원하는지, 빠른 성장과 지분 업사이드를 원하는지에 따라 갈린다고 봐요.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    nickname: "익명",
    jobRole: "마케팅",
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
        nickname: "익명1",
        jobRole: "품질",
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
        nickname: "익명2",
        jobRole: "생산",
        createdAtLabel: "6시간 전",
        likeCount: 9,
        body: "정리 깔끔하네요. 저는 안정성을 택해서 제약사에 남았습니다.",
        isMine: true,
        replies: [],
      },
      {
        id: "industry-salary-001-c3",
        authorType: "headhunter",
        authorName: "헤드헌터 김선우",
        authorLabel: "헤드헌터 공식 계정",
        avatarInitial: "헤",
        nickname: "헤드헌터 김선우",
        jobRole: "",
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
    tags: ["면접", "생산"],
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
    nickname: "익명",
    jobRole: "생산",
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
        nickname: "익명1",
        jobRole: "생산",
        createdAtLabel: "20시간 전",
        likeCount: 7,
        body: "Downstream 직무 준비 중인데 큰 도움이 됩니다. 혹시 영어 인터뷰 비중도 있었나요?",
        replies: [
          {
            id: "industry-interview-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "생산",
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
        nickname: "익명2",
        jobRole: "품질",
        createdAtLabel: "18시간 전",
        likeCount: 5,
        body: "결과 통보 1주일이면 빠른 편이네요. 후기 감사합니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-job-001", "industry-career-001", "industry-salary-001"],
  },
  {
    id: "industry-job-002",
    qnaType: "industry",
    tags: ["취업·이직"],
    title: "중소 재직 vs 퇴사 후 준비, 목표 제약사 재도전 어떻게 할까요?",
    body: [
      "개인 사정으로 연고지 중견·대기업 4곳을 목표로 하고 있습니다. 중견 제약 계약직 8개월 경력이 있고, 토익 점수는 낮은 편입니다.",
      "목표 기업들은 2~3개월에 한 번씩 공고가 뜨고 서류는 비교적 잘 붙는데, 토익이나 인적성에서 계속 떨어지는 것 같습니다.",
      "최근 의료기기 중소와 제약 중소 두 곳에 합격해서 고민 중입니다.",
      "1. 의료기기 중소에 다니면서 계속 지원\n2. 제약 중소에 다니면서 계속 지원\n3. 취업하지 않고 토익·인적성·면접 준비에 집중",
      "재직하면서 공부하는 게 가장 좋다는 건 알지만, 예전에 일할 때는 병행이 거의 안 됐습니다. 조건은 의료기기 쪽이 더 좋은데, 나중에 제약사로 다시 옮길 생각까지 하면 어떤 선택이 나을까요?",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    nickname: "익명",
    jobRole: "취업준비생",
    createdAtLabel: "12시간 전",
    minutesAgo: 720,
    viewCount: 2164,
    likeCount: 28,
    comments: [
      {
        id: "industry-job-002-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명1",
        jobRole: "품질",
        createdAtLabel: "11시간 전",
        likeCount: 6,
        body: "제약 쪽으로 계속 가실 생각이면 2요. 경력 연결이 제일 자연스러워 보여요.",
        replies: [],
      },
      {
        id: "industry-job-002-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명2",
        jobRole: "생산",
        createdAtLabel: "10시간 전",
        likeCount: 4,
        body: "산업 크게 상관없으면 1도 괜찮을 것 같은데, 의료기기에서 제약으로 넘어오는 경우는 많이 못 본 것 같아요.",
        replies: [],
      },
      {
        id: "industry-job-002-c3",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명3",
        jobRole: "RA",
        createdAtLabel: "9시간 전",
        likeCount: 5,
        body: "저도 2에 한 표입니다. 다만 지금 토익 점수 그대로 계속 지원하는 건 조금 아쉬워 보여요.",
        replies: [],
      },
      {
        id: "industry-job-002-c4",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명4",
        jobRole: "마케팅",
        createdAtLabel: "8시간 전",
        likeCount: 9,
        body: "저는 재직하면서 자격증, 어학, 인적성 같이 준비해서 이직했습니다. 힘들긴 해도 목표 기업이 확실하면 결국 시간을 만들어야 하더라고요.",
        replies: [
          {
            id: "industry-job-002-c4-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "취업준비생",
            isPostAuthor: true,
            createdAtLabel: "7시간 전",
            likeCount: 2,
            body: "감사합니다. 말씀 듣고 보니 결국 시간을 만드는 수밖에 없겠네요.",
          },
        ],
      },
      {
        id: "industry-job-002-c5",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명5",
        jobRole: "연구",
        createdAtLabel: "7시간 전",
        likeCount: 3,
        body: "요즘은 경력도 챙기고 스펙도 같이 올리는 게 제일 안전한 선택 같아요.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-career-001", "industry-salary-001", "industry-job-001"],
  },
  {
    id: "industry-career-002",
    qnaType: "industry",
    tags: ["커리어"],
    title: "국내 제약사 재직 중인데, 바이오벤처 이직이 맞는 선택일까요?",
    body: [
      "국내 주요 제약사에 재직 중입니다. 최근 성장 가능성이 있어 보이는 바이오벤처로 이직할 기회가 생겼는데, 옮기는 게 맞는 선택인지 고민이 많습니다.",
      "현재 회사의 안정성을 포기하기는 아쉽고, 그렇다고 계속 비슷한 환경에만 있는 것도 고민입니다. 비슷한 선택을 해보신 분들은 어떤 기준으로 결정하셨나요?",
    ],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    nickname: "익명",
    jobRole: "연구",
    createdAtLabel: "1일 전",
    minutesAgo: 1560,
    viewCount: 1877,
    likeCount: 22,
    comments: [
      {
        id: "industry-career-002-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명1",
        jobRole: "마케팅",
        createdAtLabel: "22시간 전",
        likeCount: 7,
        body: "안정성이 중요하면 스테이, 새로운 경험이나 성장 가능성이 더 중요하면 이직이라고 봅니다. 결국 본인이 어디에 더 무게를 두느냐인 것 같아요.",
        replies: [],
      },
      {
        id: "industry-career-002-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명2",
        jobRole: "연구",
        createdAtLabel: "20시간 전",
        likeCount: 5,
        body: "큰 회사에 있으면 안정적인 대신 답답하게 느껴질 때가 있고, 바이오텍은 확실히 개인 퍼포먼스나 회사 상황 영향을 더 많이 받는 것 같아요.",
        replies: [],
      },
      {
        id: "industry-career-002-c3",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명3",
        jobRole: "품질",
        createdAtLabel: "18시간 전",
        likeCount: 4,
        body: "저도 비슷하게 고민했는데, 주변 소규모 회사들이 어려워지는 걸 몇 번 보고 나서는 안정성을 쉽게 못 놓겠더라고요. 대신 지금 회사 안에서 새로운 경험을 최대한 해보는 쪽으로 정리했습니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["industry-salary-001", "industry-career-001", "industry-interview-001"],
  },
  {
    id: "industry-interview-002",
    qnaType: "industry",
    tags: ["면접"],
    title: "한국로슈 인턴 면접 보시는 분 계신가요? 같이 준비하면 좋을 것 같아요",
    body: ["혹시 지금 한국로슈 인턴 지원하신 분 계신가요? 면접 준비 같이 하면 좋을 것 같아서요!"],
    authorType: "anonymous",
    authorName: "익명 · 산업",
    avatarInitial: "산",
    nickname: "익명",
    jobRole: "취업준비생",
    createdAtLabel: "2시간 전",
    minutesAgo: 120,
    viewCount: 648,
    likeCount: 8,
    comments: [
      {
        id: "industry-interview-002-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명1",
        jobRole: "취업준비생",
        createdAtLabel: "1시간 전",
        likeCount: 1,
        body: "결과 받으셨나요?",
        replies: [
          {
            id: "industry-interview-002-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "취업준비생",
            isPostAuthor: true,
            createdAtLabel: "50분 전",
            likeCount: 0,
            body: "네",
          },
        ],
      },
      {
        id: "industry-interview-002-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명2",
        jobRole: "취업준비생",
        createdAtLabel: "1시간 전",
        likeCount: 2,
        body: "직무가 어떻게 되세요?",
        replies: [
          {
            id: "industry-interview-002-c2-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "취업준비생",
            isPostAuthor: true,
            createdAtLabel: "45분 전",
            likeCount: 1,
            body: "QMS & Medical Compliance입니다!",
          },
        ],
      },
      {
        id: "industry-interview-002-c3",
        authorType: "anonymous",
        authorName: "익명 · 산업",
        avatarInitial: "산",
        nickname: "익명3",
        jobRole: "취업준비생",
        createdAtLabel: "40분 전",
        likeCount: 1,
        body: "혹시 어떻게 준비하고 계신가요?",
        replies: [
          {
            id: "industry-interview-002-c3-r1",
            authorType: "anonymous",
            authorName: "익명 · 산업",
            avatarInitial: "산",
            nickname: "작성자",
            jobRole: "취업준비생",
            isPostAuthor: true,
            createdAtLabel: "20분 전",
            likeCount: 0,
            body: "저는 직무 조금 알아보고 오늘 온라인 면접 그냥 제출해버렸어요",
          },
        ],
      },
    ],
    relatedPostIds: ["industry-interview-001", "industry-job-002", "industry-job-001"],
  },
  {
    id: "pharmacist-opening-001",
    qnaType: "pharmacist",
    tags: ["개국", "약국 운영"],
    title: "문전 약국 양도 검토 중인데, 권리금 산정 어떻게 보세요?",
    body: [
      "문전 약국 양도를 검토 중입니다. 처방전 응대 비율과 월 일매를 기준으로 권리금을 제시받았는데, 적정선인지 판단이 서질 않네요.",
      "해당 약국은 종합병원 인근이라 처방 의존도가 높은 편이고, 최근 6개월 평균 일 처방 건수와 일매 자료는 받아봤습니다.",
      "비슷한 입지에서 양수·양도 경험 있으신 분들은 권리금을 어떤 기준으로 산정하셨는지, 처방 병원의 이전 리스크는 어떻게 반영하셨는지 궁금합니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "근무약사",
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
        nickname: "익명1",
        jobRole: "개국약사",
        createdAtLabel: "1시간 전",
        likeCount: 18,
        body: "문전은 결국 처방 병원 리스크가 핵심이에요. 병원 임대차 잔여기간이랑 이전 계획부터 확인하세요. 권리금은 보통 연 순이익을 기준으로 봅니다.",
        replies: [
          {
            id: "pharmacist-opening-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 약사",
            avatarInitial: "약",
            nickname: "작성자",
            jobRole: "근무약사",
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
        nickname: "익명2",
        jobRole: "개국약사",
        createdAtLabel: "38분 전",
        likeCount: 11,
        body: "최근에 비슷한 입지 양수했는데, 일매보다 처방 안정성을 훨씬 깐깐하게 봤습니다. 단골 비중도 같이 보세요.",
        isMine: true,
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-career-001", "pharmacist-salary-001", "pharmacist-hospital-001"],
  },
  {
    id: "pharmacist-practice-001",
    qnaType: "pharmacist",
    isMine: true,
    tags: ["약국 실무", "복약지도"],
    title: "조제 더블체크 루틴, 이렇게 바꾸니 실수가 줄었어요",
    body: [
      "조제 실수를 줄이려고 더블체크 절차를 손봤는데 확실히 효과가 있어서 공유합니다.",
      "특히 유사 약품명·고용량 약물은 별도 체크 포인트를 두고, 투약 전 라벨과 처방을 한 번 더 대조하는 루틴을 넣었어요.",
      "바쁜 시간대엔 지키기 어려울 때도 있지만, 사고 한 번 나는 것보다 낫더라고요. 다들 어떤 방식 쓰시는지 궁금합니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "근무약사",
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
        nickname: "익명1",
        jobRole: "근무약사",
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
        nickname: "익명2",
        jobRole: "근무약사",
        createdAtLabel: "5시간 전",
        likeCount: 6,
        body: "바쁠 때일수록 루틴이 지켜지는지가 관건이더라고요. 좋은 공유 감사합니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-opening-001", "pharmacist-career-001", "pharmacist-salary-001"],
  },
  {
    id: "pharmacist-career-001",
    qnaType: "pharmacist",
    tags: ["취업·이직", "병원약사"],
    title: "병원약사에서 제약 메디컬로 이직, 면허 메리트 있을까요?",
    body: [
      "병원약사 경력을 바탕으로 제약사 메디컬 직무 이직을 고민하고 있습니다. 약사 면허와 병원 실무 경험이 실제 채용 과정에서 어느 정도 강점이 되는지 궁금합니다.",
      "특히 MSL이나 RA처럼 임상·인허가 지식을 요구하는 직무가 병원 실무 경험을 어떻게 평가하는지, 그리고 이직 시 연봉이나 직급은 어느 정도로 협상하는 게 합리적인지도 함께 여쭤보고 싶습니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 병원약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "병원약사",
    createdAtLabel: "3시간 전",
    minutesAgo: 180,
    viewCount: 2018,
    likeCount: 51,
    comments: [
      {
        id: "pharmacist-career-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 산업약사",
        avatarInitial: "약",
        nickname: "익명1",
        jobRole: "산업약사",
        createdAtLabel: "2시간 전",
        likeCount: 9,
        body: "저도 병원약사 하다가 제약사 메디컬팀으로 이직했어요. 약사 면허 자체보다는 병원에서 쌓은 임상 커뮤니케이션 경험을 더 높게 평가받았습니다.",
        replies: [
          {
            id: "pharmacist-career-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 병원약사",
            avatarInitial: "약",
            nickname: "작성자",
            jobRole: "병원약사",
            isPostAuthor: true,
            createdAtLabel: "1시간 전",
            likeCount: 3,
            body: "실무 경험이 더 중요하다는 말씀 감사합니다. 목표 부서부터 좁혀볼게요.",
          },
        ],
      },
      {
        id: "pharmacist-career-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 산업약사",
        avatarInitial: "약",
        nickname: "익명2",
        jobRole: "산업약사",
        createdAtLabel: "1시간 전",
        likeCount: 5,
        body: "메디컬 부서마다 요구하는 자격이 좀 달라요. MSL은 임상 경험을, RA는 인허가 지식을 더 보는 편이니 목표 부서를 먼저 정하시는 게 좋을 것 같아요.",
        isMine: true,
        replies: [],
      },
      {
        id: "pharmacist-career-001-c3",
        authorType: "anonymous",
        authorName: "익명 · 예비약사",
        avatarInitial: "약",
        nickname: "익명3",
        jobRole: "예비약사",
        createdAtLabel: "30분 전",
        likeCount: 2,
        body: "저도 졸업 후 진로를 고민 중이라 정독했습니다. 병원 실무를 먼저 쌓는 쪽이 나중에 선택지가 넓어진다는 말씀으로 이해했는데 맞을까요?",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-opening-001", "pharmacist-salary-001", "pharmacist-hospital-001"],
  },
  {
    id: "pharmacist-salary-001",
    qnaType: "pharmacist",
    tags: ["연봉", "취업·이직"],
    title: "근무약사 처우 협상, 다들 어디까지 받으세요?",
    body: [
      "이직 제안을 받았는데 연봉과 인센티브 기준을 어떻게 협상해야 할지 고민입니다. 근무 형태와 경력에 따른 실제 협상 경험을 듣고 싶습니다.",
      "특히 정규직 전환 조건이나 인센티브 지급 기준을 계약서에 어떻게 명시해야 나중에 분쟁이 없을지, 실제로 협상해보신 분들의 구체적인 사례가 궁금합니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "근무약사",
    createdAtLabel: "5시간 전",
    minutesAgo: 300,
    viewCount: 1622,
    likeCount: 44,
    comments: [
      {
        id: "pharmacist-salary-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        nickname: "익명1",
        jobRole: "근무약사",
        createdAtLabel: "4시간 전",
        likeCount: 8,
        body: "연차랑 근무 형태에 따라 편차가 커요. 저는 3년차에 주 5일 근무로 이직하면서 기본급 외에 인센티브 비율을 명확히 문서화해달라고 요청했습니다.",
        replies: [
          {
            id: "pharmacist-salary-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 약사",
            avatarInitial: "약",
            nickname: "작성자",
            jobRole: "근무약사",
            isPostAuthor: true,
            createdAtLabel: "3시간 전",
            likeCount: 2,
            body: "인센티브 비율 문서화는 미처 생각 못 했네요. 협상 때 꼭 넣어보겠습니다.",
          },
        ],
      },
      {
        id: "pharmacist-salary-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        nickname: "익명2",
        jobRole: "근무약사",
        createdAtLabel: "3시간 전",
        likeCount: 6,
        body: "연봉만 보지 말고 4대 보험 처리나 점심시간 보장 여부도 꼭 확인하세요. 실수령액 차이가 생각보다 큽니다.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-opening-001", "pharmacist-career-001", "pharmacist-practice-001"],
  },
  {
    id: "pharmacist-hospital-001",
    qnaType: "pharmacist",
    tags: ["병원약사", "취업·이직"],
    title: "대학병원 약제부 항암주사 조제 파트, 실제 업무 강도는?",
    body: [
      "대학병원 약제부 항암주사 조제 파트 지원을 고민 중입니다. 교대 형태와 업무 강도, 적응 과정에 대한 실제 경험이 궁금합니다.",
      "무균 조제 교육이나 자격 요건이 따로 있는지, 그리고 신규 인력이 실무에 적응하기까지 보통 얼마나 걸리는지도 함께 알고 싶습니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 병원약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "병원약사",
    createdAtLabel: "4시간 전",
    minutesAgo: 240,
    viewCount: 1745,
    likeCount: 41,
    comments: [
      {
        id: "pharmacist-hospital-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 병원약사",
        avatarInitial: "약",
        nickname: "익명1",
        jobRole: "병원약사",
        createdAtLabel: "3시간 전",
        likeCount: 7,
        body: "항암주사 조제 파트는 무균조제 인증 교육부터 받으시고 시작하실 거예요. 처음 3개월은 속도보다 정확도 위주로 트레이닝하는 편입니다.",
        replies: [
          {
            id: "pharmacist-hospital-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 병원약사",
            avatarInitial: "약",
            nickname: "작성자",
            jobRole: "병원약사",
            isPostAuthor: true,
            createdAtLabel: "2시간 전",
            likeCount: 2,
            body: "무균조제 인증 교육부터 준비해야겠네요. 답변 감사합니다.",
          },
        ],
      },
      {
        id: "pharmacist-hospital-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 병원약사",
        avatarInitial: "약",
        nickname: "익명2",
        jobRole: "병원약사",
        createdAtLabel: "2시간 전",
        likeCount: 4,
        body: "병원마다 다르지만 저희는 2교대로 돌아가고, 항암 조제일에는 인원을 더 배치해서 부담을 나눠요.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-career-001", "pharmacist-practice-001", "pharmacist-opening-001"],
  },
  {
    /** 예비약사(약대 6학년, 재학증명서 인증) 작성 글 — jobRole만 다르고 나머지 표시 체계는 다른 익명 글과 완전히 같다. */
    id: "pharmacist-preliminary-001",
    qnaType: "pharmacist",
    tags: ["취업·이직", "약국 실무"],
    title: "국시 준비하면서 약국 실무 미리 익혀두려면 뭐부터 봐야 할까요?",
    body: [
      "약대 6학년이고 내년 국가시험을 준비하고 있습니다. 실습은 다녀왔지만 막상 현장에 나가면 학교에서 배운 것과 실무가 많이 다르다는 이야기를 들어서 미리 준비하고 싶습니다.",
      "복약지도나 청구 업무처럼 학교에서 깊게 다루지 않는 부분을 졸업 전에 어느 정도까지 익혀두는 게 현실적인지, 선배 약사님들 조언을 구하고 싶습니다.",
    ],
    authorType: "anonymous",
    authorName: "익명 · 예비약사",
    avatarInitial: "약",
    nickname: "익명",
    jobRole: "예비약사",
    createdAtLabel: "1시간 전",
    minutesAgo: 60,
    viewCount: 864,
    likeCount: 22,
    comments: [
      {
        id: "pharmacist-preliminary-001-c1",
        authorType: "anonymous",
        authorName: "익명 · 약사",
        avatarInitial: "약",
        nickname: "익명1",
        jobRole: "근무약사",
        createdAtLabel: "40분 전",
        likeCount: 8,
        body: "국시 끝나고 배워도 늦지 않아요. 굳이 미리 보신다면 청구 프로그램 화면에 익숙해지는 정도가 제일 도움이 됩니다.",
        replies: [
          {
            id: "pharmacist-preliminary-001-c1-r1",
            authorType: "anonymous",
            authorName: "익명 · 예비약사",
            avatarInitial: "약",
            nickname: "작성자",
            jobRole: "예비약사",
            isPostAuthor: true,
            createdAtLabel: "20분 전",
            likeCount: 2,
            body: "청구 쪽부터 보면 되겠네요. 답변 감사합니다!",
          },
        ],
      },
      {
        id: "pharmacist-preliminary-001-c2",
        authorType: "anonymous",
        authorName: "익명 · 개국약사",
        avatarInitial: "약",
        nickname: "익명2",
        jobRole: "개국약사",
        createdAtLabel: "30분 전",
        likeCount: 6,
        body: "실무는 어차피 현장에서 몸으로 익히게 됩니다. 지금은 국시에 집중하시고, 대신 자주 나가는 약 위주로 복약지도 문구를 정리해 두시면 첫 달이 훨씬 수월해요.",
        replies: [],
      },
    ],
    relatedPostIds: ["pharmacist-practice-001", "pharmacist-opening-001", "pharmacist-career-001"],
  },
];

export function getQnaPosts(type: QnaType): QnaPost[] {
  return qnaPosts.filter((post) => post.qnaType === type);
}

/** 목록에 보여줄 전체 항목 — QnaPreviewCard 폐기로 getQnaPosts와 동일하다 */
export function getQnaListEntries(type: QnaType): QnaListEntry[] {
  return getQnaPosts(type);
}

export function getQnaPostById(id: string): QnaPost | undefined {
  return qnaPosts.find((post) => post.id === id);
}

/** 답글까지 포함한 댓글 수 — 목록 카드와 상세페이지가 항상 같은 값을 보도록 한 곳에서 계산 */
export function getCommentCount(post: QnaPost): number {
  return post.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

export function getEntryCommentCount(entry: QnaListEntry): number {
  return getCommentCount(entry);
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

/** 관련 글 id를 같은 유형의 실제 글로 변환 */
export function getRelatedQnaEntries(post: QnaPost): QnaListEntry[] {
  return post.relatedPostIds
    .map((id) => qnaPosts.find((entry) => entry.id === id))
    .filter((entry): entry is QnaPost => Boolean(entry));
}

/** 해당 탭 글들의 tags 빈도를 집계해 상위 limit개를 반환 — 사이드바 "인기 태그" 패널이 사용 */
export function getPopularQnaTags(type: QnaType, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const post of getQnaPosts(type)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/** 로그인 사용자가 작성한 글 — "내 활동" 페이지의 "내가 쓴 글" 탭이 사용 */
export function getMyQnaPosts(): QnaPost[] {
  return qnaPosts.filter((post) => post.isMine);
}

export interface MyQnaCommentEntry {
  id: string;
  body: string;
  createdAtLabel: string;
  postId: string;
  postTitle: string;
}

/** 로그인 사용자가 남긴 댓글/답글을 원문 글 정보와 함께 평탄화 — "내 활동" 페이지의 "내가 단 댓글" 탭이 사용 */
export function getMyQnaComments(): MyQnaCommentEntry[] {
  const entries: MyQnaCommentEntry[] = [];
  for (const post of qnaPosts) {
    for (const comment of post.comments) {
      if (comment.isMine) {
        entries.push({ id: comment.id, body: comment.body, createdAtLabel: comment.createdAtLabel, postId: post.id, postTitle: post.title });
      }
      for (const reply of comment.replies) {
        if (reply.isMine) {
          entries.push({ id: reply.id, body: reply.body, createdAtLabel: reply.createdAtLabel, postId: post.id, postTitle: post.title });
        }
      }
    }
  }
  return entries;
}
