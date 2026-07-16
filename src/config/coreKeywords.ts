// src/config/coreKeywords.ts
// 공고 등록 폼의 "핵심 키워드(추천 키워드)" 데이터.
// 트랙(JobTrack)별로 추천 로직이 다르다:
//  - industry: 직무 대분류 id → 키워드 배열
//  - research: 연구 분야 소분류 id → 키워드 배열 (매핑 없는 소분류는 상위 대분류 키워드로 폴백)
//  - hospital / pharmacy: 직무 분화 없는 단일 풀
// industry/hospital/pharmacy/research 4개 트랙 전부를 정의한다.

import type { JobTrack } from "@/types/jobs";
import { researchFieldCategoryOptions } from "@/config/researchFields";

const INDUSTRY_KW_BY_CATEGORY: Record<string, string[]> = {
  rd: ["신약개발", "전임상 연구", "후보물질 발굴", "스크리닝", "약리평가", "독성평가", "약동학/약력학", "제형연구", "분석법 개발", "CMC", "바이오의약품", "세포주 개발", "의료기기 R&D", "특허/IP"],
  "sales-marketing": ["제약영업", "MR", "의료기기 영업", "병원영업", "KOL 관리", "Product Marketing", "브랜드 전략", "디지털 마케팅", "시장분석", "영업기획", "Key Account", "해외영업"],
  clinical: ["CRA", "CRC", "임상 PM", "Clinical Operations", "Medical Writing", "임상 QA", "ICH-GCP", "프로토콜", "Site Management", "모니터링", "SAE", "Data Management", "Biostatistics", "eTMF"],
  regulatory: ["RA", "인허가", "CTD", "eCTD", "IND/NDA", "MFDS", "FDA", "EMA", "허가전략", "변경허가", "CMC RA", "의료기기 RA", "글로벌 인허가", "규제기관 대응"],
  "medical-market": ["Medical Affairs", "MSL", "Medical Science", "KOL Engagement", "Scientific Communication", "Medical Education", "HEOR", "RWE", "근거생성", "Market Access", "보험등재", "약가전략", "약물경제성", "논문·학술자료"],
  "production-quality": ["GMP", "QA", "QC", "품질보증", "품질관리", "QMS", "Validation", "CSV", "SOP", "CAPA", "Deviation", "Audit", "공정관리", "제조관리", "LIMS"],
  "pharmacy-safety": ["PV", "Drug Safety", "Pharmacovigilance", "이상사례", "ICSR", "Safety Database", "Signal Detection", "Literature Review", "DSUR", "PSUR/PBRER", "RMP", "안전성 보고", "SOP", "규제기관 보고"],
  "strategy-investment": ["BD", "사업개발", "Licensing", "License-in", "License-out", "기술이전", "파트너링", "Alliance Management", "M&A", "IR", "사업전략", "시장성 평가", "기술가치평가", "계약협상"],
  "data-ai": ["AI 신약개발", "Bioinformatics", "Data Science", "의료데이터", "RWE 데이터", "머신러닝", "빅데이터 분석", "데이터 파이프라인", "Python", "SQL", "CDISC", "SAS", "헬스케어 소프트웨어", "SaMD"],
  management: ["HR", "채용", "조직문화", "재무", "회계", "법무", "컴플라이언스", "구매", "SCM", "물류", "홍보", "PR", "IR 지원", "총무"],
};

const RESEARCH_KW_BY_FIELD: Record<string, string[]> = {
  // 생명과학
  "molecular-cell-biology": ["세포배양", "분자생물학", "PCR", "Western blot", "단백질 발현", "세포신호전달", "현미경 분석", "FACS", "IHC", "세포기능 분석"],
  "immunology": ["면역세포", "염증반응", "사이토카인", "T cell", "B cell", "Flow cytometry", "ELISA", "면역조직화학", "숙주-미생물 상호작용", "면역질환"],
  "neuroscience": ["신경세포", "뇌질환", "치매", "신경발달", "시냅스", "동물행동실험", "뇌조직 분석", "신경염증", "전기생리", "이미징 분석"],
  "cancer-biology": ["종양미세환경", "암세포주", "항암제 반응성", "종양모델", "전이", "암유전체", "면역항암", "바이오마커", "PDX", "오가노이드"],
  "genetics-genomics": ["유전체분석", "NGS", "RNA-seq", "유전자 발현", "변이 분석", "GWAS", "CRISPR", "전사체 분석", "유전질환", "생물정보 분석"],

  // 의약학
  "pharmacology-toxicology": ["약리평가", "독성평가", "약효평가", "PK/PD", "DMPK", "ADME", "세포독성", "동물실험", "후보물질 평가", "안전성 평가"],
  "pharmaceutics": ["제형연구", "약물전달", "DDS", "나노입자", "방출시험", "용출시험", "제제분석", "안정성시험", "바이오의약품 제형", "스케일업"],
  "medicinal-chemistry": ["의약합성", "유기합성", "SAR", "화합물 설계", "Lead optimization", "천연물", "저분자화합물", "분석화학", "LC-MS", "NMR"],
  "disease-model": ["질환모델", "동물모델", "전임상", "마우스 모델", "세포모델", "병리기전", "효능평가", "조직분석", "행동실험", "약물반응성"],

  // 임상·중개연구
  "clinical-research": ["임상연구", "IRB", "연구계획서", "피험자 관리", "임상데이터", "증례기록서", "통계분석", "의무기록", "연구윤리", "GCP"],
  "translational-research": ["중개연구", "임상검체", "질환기전", "바이오마커", "전임상-임상 연계", "환자유래 모델", "약물반응성", "정밀의학", "오믹스 분석", "연구성과 사업화"],
  "clinical-specimen": ["임상검체", "검체관리", "혈액검체", "조직검체", "바이오뱅크", "검체 전처리", "검체 라벨링", "IRB", "임상정보 연계", "샘플 QC"],
  "cohort-registry": ["코호트", "레지스트리", "장기추적 연구", "환자데이터", "의무기록 분석", "역학연구", "통계분석", "데이터 정제", "연구대상자 관리", "RWE"],

  // 바이오·의료융합
  "organoid": ["오가노이드", "3D culture", "iPSC", "환자유래 모델", "약물반응성", "질환모델", "세포분화", "이미징 분석", "스크리닝", "PDX"],
  "stem-cell-regenerative": ["줄기세포", "iPSC", "세포분화", "재생의학", "세포치료", "조직공학", "배양공정", "세포특성 분석", "면역염색", "질환모델"],
  "cell-gene-therapy": ["세포치료", "유전자치료", "CAR-T", "바이럴 벡터", "CRISPR", "유전자 전달", "세포공정", "GMP 연계", "효능평가", "안전성 평가"],
  "biomarker-precision": ["바이오마커", "정밀의학", "동반진단", "환자군 분류", "오믹스 분석", "임상검체", "예후인자", "약물반응 예측", "진단마커", "데이터 통합분석"],

  // 데이터·AI
  "bioinformatics": ["바이오인포매틱스", "NGS 분석", "RNA-seq", "Variant calling", "유전체 데이터", "전사체 분석", "Python", "R", "Linux", "데이터 파이프라인"],
  "ngs-single-cell": ["NGS", "Single-cell RNA-seq", "scRNA-seq", "공간전사체", "세포군집 분석", "유전자 발현 분석", "QC", "Seurat", "Cell Ranger", "시퀀싱 데이터"],
  "multiomics": ["멀티오믹스", "유전체", "전사체", "단백체", "대사체", "오믹스 통합분석", "네트워크 분석", "바이오마커 발굴", "데이터 통합", "통계모델링"],
  "ai-drug-discovery": ["AI 신약개발", "머신러닝", "딥러닝", "타깃 발굴", "약물재창출", "화합물 예측", "분자모델링", "QSAR", "예측모델", "Python"],

  // 의료기기·공학
  "biomedical-engineering": ["의공학", "생체신호", "바이오센서", "의료기기", "신호처리", "생체재료", "재활공학", "의료로봇", "프로토타이핑", "성능평가"],
  "medical-imaging": ["의료영상", "MRI", "CT", "초음파", "영상분석", "이미지 세그멘테이션", "딥러닝", "PACS", "의료영상 AI", "3D reconstruction"],
  "diagnostic-device": ["진단기기", "체외진단", "IVD", "바이오센서", "POCT", "진단키트", "분석장비", "성능평가", "임상적 성능시험", "품질관리"],
  "digital-health": ["디지털헬스", "모바일헬스", "웨어러블", "SaMD", "의료데이터", "원격모니터링", "헬스케어 앱", "사용성 평가", "디지털 치료기기", "데이터 보안"],

  // 기타
  "field-etc-sub": ["기초연구", "응용연구", "융합연구", "실험기술", "데이터분석", "연구지원", "논문작성", "학회발표"],
};

const RESEARCH_KW_BY_FIELD_GROUP: Record<string, string[]> = {
  "life-science": ["세포배양", "PCR", "Western blot", "FACS", "IHC", "유전자 발현", "단백질 분석", "동물실험", "현미경 분석", "세포기능 분석"],
  "pharma-medicine": ["약리평가", "독성평가", "PK/PD", "ADME", "제형연구", "약물전달", "의약합성", "동물모델", "효능평가", "안전성 평가"],
  "clinical-translational": ["임상연구", "IRB", "임상검체", "의무기록", "코호트", "레지스트리", "통계분석", "바이오마커", "정밀의학", "RWE"],
  "bio-medical-convergence": ["오가노이드", "줄기세포", "iPSC", "세포치료", "유전자치료", "CRISPR", "바이오마커", "정밀의학", "약물반응성", "질환모델"],
  "data-ai": ["바이오인포매틱스", "NGS 분석", "RNA-seq", "단일세포분석", "멀티오믹스", "Python", "R", "머신러닝", "AI 신약개발", "데이터 파이프라인"],
  "medical-device-eng": ["의공학", "의료영상", "진단기기", "디지털헬스", "바이오센서", "신호처리", "의료기기", "SaMD", "IVD", "성능평가"],
  "field-etc": ["기초연구", "응용연구", "융합연구", "연구기술", "데이터분석", "논문작성", "학회발표"],
};

// 병원은 직무별 분기 없이 항상 동일한 단일 키워드 목록을 쓴다
const HOSPITAL_KEYWORDS: string[] = [
  "조제", "투약", "처방검토", "복약상담", "병동약료", "임상약료", "무균조제", "항암조제",
  "TPN", "NST", "ASP", "감염약료", "종양약료", "DI", "마약류 관리", "의약품 관리", "임상시험약 관리",
];

// 약국은 직무별 분기 없이 항상 동일한 단일 키워드 목록을 쓴다
const PHARMACY_KEYWORDS: string[] = [
  "처방조제", "복약지도", "처방검토", "OTC 상담", "매약 상담",
  "건기식 상담", "자동조제기", "산제포장",
];

export interface CoreKeywordOptions {
  /** industry 전용: 직무 대분류 id */
  categoryId?: string;
  /** research 전용: 선택된 연구 분야(소분류) id 목록 */
  fieldIds?: string[];
}

/**
 * 트랙 + 옵션으로 추천 키워드를 꺼낸다.
 * industry는 opts.categoryId, research는 opts.fieldIds(소분류→대분류 폴백 포함)를 사용하고,
 * hospital/pharmacy는 opts를 무시하고 고정 풀을 반환한다.
 */
export function getRecommendedKeywords(track: JobTrack, opts: CoreKeywordOptions = {}): string[] {
  switch (track) {
    case "industry":
      return opts.categoryId ? (INDUSTRY_KW_BY_CATEGORY[opts.categoryId] ?? []) : [];
    case "research": {
      const fieldIds = opts.fieldIds ?? [];
      if (fieldIds.length === 0) return [];
      const bySubfield = fieldIds.flatMap((id) => RESEARCH_KW_BY_FIELD[id] ?? []);
      if (bySubfield.length > 0) return Array.from(new Set(bySubfield));
      // 매핑에 없는 소분류만 선택된 경우, 그 소분류의 상위 대분류 키워드로 대체
      const groupIds = new Set(
        fieldIds
          .map((id) => researchFieldCategoryOptions.find((g) => g.subcategories.some((s) => s.id === id))?.id)
          .filter((id): id is string => Boolean(id)),
      );
      return Array.from(new Set(Array.from(groupIds).flatMap((id) => RESEARCH_KW_BY_FIELD_GROUP[id] ?? [])));
    }
    case "hospital":
      return HOSPITAL_KEYWORDS;
    case "pharmacy":
      return PHARMACY_KEYWORDS;
    default:
      return [];
  }
}
