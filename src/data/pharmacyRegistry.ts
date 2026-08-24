import { companies } from "@/data/companies";

/**
 * 전국 약국 등록부 목데이터 — 약국 인증(claim) 신청의 검색 대상.
 *
 * 실서비스는 심평원(건강보험심사평가원) 공공데이터의 약국 목록을 조회한다. 그래서 검색 대상은
 * "이 사이트에 등록된 약국"이 아니라 "전국의 모든 약국"이고, 아직 사이트에 없는 약국의 약사도
 * 자기 약국을 찾아 인증할 수 있어야 한다. 이 파일은 그 응답을 흉내 낸다.
 *
 * 필드는 심평원 약국 목록 응답을 따른다(약국명·주소·전화·개설일자). 실제 응답에는 요양기관종별·
 * 시도코드 등이 더 있지만, 이 화면이 쓰는 것은 사람이 자기 약국을 알아보는 데 필요한 넷뿐이다.
 *
 * 이 파일은 companies.ts를 읽기만 한다 — 사이트 등록 약국의 이름·주소를 여기 옮겨 적으면 두 곳이
 * 갈린다. 등록부에만 있는 값(암호화 요양기호·전화)만 아래 표가 따로 든다.
 */

export interface PharmacyRegistryEntry {
  /**
   * 실서비스에서는 심평원이 내려주는 **암호화 요양기호**가 이 자리에 온다(encryptedCode).
   * 사람이 읽을 수 없는 불투명 문자열이라는 성질이 중요해서, 목데이터도 순번이 드러나지 않는
   * 형태로 둔다.
   *
   * 선택 값의 식별자이자, 프로필이 없는 약국 상세의 URL 키(`/companies/{id}`)로도 쓰인다 —
   * 등록부에만 있는 약국은 이 값 말고 가리킬 이름이 없다. 다만 **화면 텍스트로는 찍지 않는다**:
   * 불투명 문자열이라 사람이 읽어서 얻을 것이 없다.
   */
  id: string;
  name: string;
  address: string;
  phone: string;
  /** 개설일자 */
  openedOn: string;
  /**
   * 이 사이트에 이미 등록된 약국이면 그 기업 id. 등록부에만 있는 약국은 없다 —
   * 실서비스에서 인증이 승인되면 이 값을 잇거나 새로 만드는 일이 뒤따른다(이 단계의 범위 밖).
   */
  companyId?: string;
}

/**
 * 사이트에 등록된 약국이 등록부에서 추가로 갖는 값.
 *
 * 전화번호는 창작하지 않는 대신 걸리지 않는 번호(국번 0000)로 둔다 — companyProfiles가
 * 같은 이유로 쓰는 방식이다. 지역번호는 그 약국이 실제로 선 지역의 것을 쓴다.
 * companies.ts에 약국이 새로 늘면 여기에도 한 줄이 필요하다(없으면 등록부에서 빠진다).
 *
 * 이 표에는 약국 트랙 기업 id만 넣는다. companyDirectory가 이 파일을 import하므로(트랙 파생)
 * 역방향 import는 순환이 되어 금지 — 트랙 필터를 여기서 걸 수 없고, 이 표가 곧 그 필터다.
 */
const SITE_PHARMACY_REGISTRY: Record<string, { id: string; phone: string }> = {
  "eunhaeng-pharmacy": { id: "enc-8f21c4a09b", phone: "031-0000-2141" },
  "hyundai-pharmacy": { id: "enc-1d77e0b53a", phone: "031-0000-5520" },
  "hwagok-gibeum-pharmacy": { id: "enc-b0934fa71c", phone: "02-0000-1683" },
  "hyeongang-pharmacy": { id: "enc-6ac5182fd4", phone: "063-0000-3705" },
  "yeongdong-365-pharmacy": { id: "enc-27be9013cf", phone: "043-0000-4290" },
  "bichina-pharmacy": { id: "enc-f45a2c8e60", phone: "043-0000-6218" },
  "masan-yugil-pharmacy": { id: "enc-9c02b7e315", phone: "055-0000-8102" },
  "shin-jungang-pharmacy": { id: "enc-3e6810df92", phone: "02-0000-1039" },
  "munmu-pharmacy": { id: "enc-a1d94b7c08", phone: "054-0000-7714" },
  "buldang-central-pharmacy": { id: "enc-50cf283a6d", phone: "041-0000-9930" },
  "thepharma-pharmacy": { id: "enc-7b3e6d01f5", phone: "02-0000-4711" },
};

/**
 * 사이트에 없는 약국 12곳 — **전부 가상(fictional mock)이다.**
 *
 * 이곳들이 있어야 검색이 검색으로 보인다. 사이트 등록 약국만 나오면 이름만 바꾼 종전 select이고,
 * "아직 우리 사이트에 없는 내 약국을 찾아 인증한다"는 이 화면의 전제가 화면에서 사라진다.
 *
 * 이름은 실존 약국과 겹치지 않도록 지어낸 합성어이고, 전화는 걸리지 않는 국번(0000)이다.
 * 지역은 사이트 등록 약국이 비워 둔 광역시·도 위주로 흩었다 — 지역 검색이 실제로 갈라지는지
 * 확인할 수 있어야 한다.
 *
 * 맨 끝 두 곳은 **이름이 같다.** 전국 약국에서 동명은 예외가 아니라 기본값이라(중앙약국·온누리약국
 * 계열), 목록이 이름만으로는 두 약국을 갈라 내지 못한다는 것을 화면에서 확인할 수 있어야 한다 —
 * 목록 부제가 읍면동까지 내려가고(pharmacyRegionFromAddress) 검색이 주소를 함께 훑는 근거가 이 둘이다.
 * 그래서 주소도 도로명이 아니라 동 단위로 적는다.
 */
const FICTIONAL_PHARMACIES: PharmacyRegistryEntry[] = [
  { id: "enc-c81f405ba7", name: "해운대 물결약국", address: "부산 해운대구 구남로 41 1층", phone: "051-0000-1204", openedOn: "2016.04.18" },
  { id: "enc-2f9a71d0e6", name: "수성 늘봄약국", address: "대구 수성구 달구벌대로 2450 상가동 102호", phone: "053-0000-3376", openedOn: "2011.09.02" },
  { id: "enc-95b3ce2704", name: "송도 바다숲약국", address: "인천 연수구 컨벤시아대로 165 1층", phone: "032-0000-5518", openedOn: "2019.03.11" },
  { id: "enc-4e0d68af31", name: "상무 볕드는약국", address: "광주 서구 상무중앙로 58 메디컬빌딩 1층", phone: "062-0000-2287", openedOn: "2014.07.21" },
  { id: "enc-d3178b6c50", name: "둔산 나래약국", address: "대전 서구 둔산중로 89 1층", phone: "042-0000-6604", openedOn: "2008.11.05" },
  { id: "enc-6b24e9fa73", name: "삼산 맑은강약국", address: "울산 남구 삼산로 250 1층", phone: "052-0000-4419", openedOn: "2017.12.01" },
  { id: "enc-08c5a3719e", name: "속초 파랑돌약국", address: "강원 속초시 중앙로 112 1층", phone: "033-0000-7052", openedOn: "2020.05.26" },
  { id: "enc-7a1e60d4b2", name: "제주 돌담길약국", address: "제주 제주시 연동 신대로 15 1층", phone: "064-0000-8830", openedOn: "2013.02.14" },
  { id: "enc-b62f04ce85", name: "순천 갈대숲약국", address: "전남 순천시 조례로 77 1층", phone: "061-0000-3961", openedOn: "2022.08.09" },
  { id: "enc-1c4907eb3d", name: "광교 숲마루약국", address: "경기 수원시 영통구 광교중앙로 145 1층", phone: "031-0000-7723", openedOn: "2018.10.30" },
  { id: "enc-3d90b7241f", name: "더파마 중앙약국", address: "서울 관악구 봉천동 1620-3 1층", phone: "02-0000-6318", openedOn: "2019.03.04" },
  { id: "enc-a75e102cb8", name: "더파마 중앙약국", address: "부산 해운대구 우동 1407-2 1층", phone: "051-0000-2947", openedOn: "2021.07.19" },
];

/** 사이트에 등록된 약국을 등록부 레코드로 옮긴다. 이름·주소·개설일자는 companies.ts가 정본이다. */
const SITE_PHARMACIES: PharmacyRegistryEntry[] = companies
  .flatMap((company) => {
    const extra = SITE_PHARMACY_REGISTRY[company.id];
    if (!extra) return [];
    return [
      {
        id: extra.id,
        name: company.name,
        address: company.address,
        phone: extra.phone,
        openedOn: company.foundedYear,
        companyId: company.id,
      },
    ];
  });

/**
 * 전국 약국 등록부. 이름 가나다순으로 세운다 — 등록 약국과 그렇지 않은 약국이 섞여야
 * 검색 결과가 "우리 목록"이 아니라 "전국 목록"으로 읽힌다.
 */
export const pharmacyRegistry: PharmacyRegistryEntry[] = [...SITE_PHARMACIES, ...FICTIONAL_PHARMACIES].sort((a, b) =>
  a.name.localeCompare(b.name, "ko"),
);

/** 공백을 지우고 비교한다 — "화곡기쁨"으로 찾아도 "화곡 기쁨약국"이 나와야 한다. */
function normalize(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

/**
 * 약국명·주소 부분일치 검색.
 *
 * **실서비스에서는 이 함수가 심평원 API 조회로 교체된다** — 전국 약국을 클라이언트가 들고 있을 수는
 * 없고, 검색어를 서버로 넘겨 그쪽 응답을 그대로 그리게 된다. 화면이 이 함수 하나만 부르므로
 * 그때 바뀌는 것은 이 안쪽뿐이다.
 *
 * 빈 검색어에는 빈 배열을 준다 — 전국 약국을 통째로 늘어놓는 것은 검색이 아니다.
 */
export function searchPharmacyRegistry(keyword: string): PharmacyRegistryEntry[] {
  const needle = normalize(keyword);
  if (!needle) return [];
  return pharmacyRegistry.filter((entry) => normalize(entry.name).includes(needle) || normalize(entry.address).includes(needle));
}

/** 암호화 요양기호 단건 조회. 프로필 없는 약국 상세가 URL 세그먼트를 이 키로 받는다 */
export function getPharmacyRegistryEntry(id: string): PharmacyRegistryEntry | undefined {
  return pharmacyRegistry.find((entry) => entry.id === id);
}

/** 사이트 등록 약국의 기업 id로 역조회. companies.ts 쪽에서 등록부 값(전화·개설일자)을 집어올 때 쓴다 */
export function getPharmacyRegistryEntryByCompanyId(companyId: string): PharmacyRegistryEntry | undefined {
  return pharmacyRegistry.find((entry) => entry.companyId === companyId);
}
