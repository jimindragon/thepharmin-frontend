import type { ExperienceFilterOption, FilterOption, SalaryFilterOption } from "@/types/jobs";

export const regionOptions: FilterOption[] = [
  { id: "seoul", label: "서울" },
  { id: "gyeonggi", label: "경기" },
  { id: "incheon", label: "인천" },
  { id: "busan", label: "부산" },
  { id: "daegu", label: "대구" },
  { id: "daejeon", label: "대전" },
  { id: "gwangju", label: "광주" },
  { id: "ulsan", label: "울산" },
  { id: "sejong", label: "세종" },
  { id: "gangwon", label: "강원" },
  { id: "chungbuk", label: "충북" },
  { id: "chungnam", label: "충남" },
  { id: "jeonbuk", label: "전북" },
  { id: "jeonnam", label: "전남" },
  { id: "gyeongbuk", label: "경북" },
  { id: "gyeongnam", label: "경남" },
  { id: "jeju", label: "제주" },
  { id: "overseas", label: "해외" },
];

export const domesticRegionOptions: FilterOption[] = regionOptions.filter((option) => option.id !== "overseas");

export const experienceOptions: ExperienceFilterOption[] = [
  { id: "any", label: "경력무관", min: null, max: null },
  { id: "new", label: "신입", min: 0, max: 0 },
  { id: "under-1", label: "1년 미만", min: 0, max: 1 },
  { id: "1-3", label: "1~3년", min: 1, max: 3 },
  { id: "3-5", label: "3~5년", min: 3, max: 5 },
  { id: "5-10", label: "5~10년", min: 5, max: 10 },
  { id: "10-20", label: "10~20년", min: 10, max: 20 },
  { id: "20-plus", label: "20년 이상", min: 20, max: null },
];

export const educationOptions: FilterOption[] = [
  { id: "any", label: "학력무관" },
  { id: "associate", label: "전문학사" },
  { id: "bachelor", label: "학사" },
  { id: "pharmacy", label: "약사 면허" },
  { id: "master", label: "석사" },
  { id: "doctor", label: "박사" },
  { id: "professional", label: "의·약학 전문학위" },
];

export const employmentTypeOptions: FilterOption[] = [
  { id: "permanent", label: "정규직" },
  { id: "contract", label: "계약직" },
  { id: "intern", label: "인턴" },
  { id: "part-time", label: "파트타임" },
  { id: "freelance", label: "프리랜서" },
];

export const salaryOptions: SalaryFilterOption[] = [
  { id: "company-policy", label: "회사 내규", min: null },
  { id: "3000", label: "3,000만원↑", min: 3000 },
  { id: "5000", label: "5,000만원↑", min: 5000 },
  { id: "7000", label: "7,000만원↑", min: 7000 },
  { id: "9000", label: "9,000만원↑", min: 9000 },
];

export const workModeOptions: FilterOption[] = [
  { id: "onsite", label: "출근" },
  { id: "hybrid", label: "하이브리드" },
  { id: "remote", label: "재택" },
];

export const companyTypeOptions: FilterOption[] = [
  { id: "pharma", label: "제약사" },
  { id: "biotech", label: "바이오기업" },
  { id: "medical-device", label: "의료기기" },
  { id: "cro", label: "CRO" },
  { id: "cdmo", label: "CDMO" },
  { id: "distributor", label: "유통사" },
];

export const contractPeriodOptions: FilterOption[] = [
  { id: "under-6-months", label: "6개월 미만" },
  { id: "6-12-months", label: "6~12개월" },
  { id: "1-2-years", label: "1~2년" },
  { id: "project-based", label: "과제 기간 연동" },
];

export const scheduleOptions: FilterOption[] = [
  { id: "weekday-day", label: "평일 주간" },
  { id: "weekday-evening", label: "평일 야간" },
  { id: "weekend", label: "주말" },
  { id: "negotiable", label: "시간 협의" },
];

export const educationRank: Record<string, number> = {
  any: 0,
  associate: 1,
  bachelor: 2,
  pharmacy: 3,
  master: 4,
  professional: 5,
  doctor: 6,
};
