import clsx from "clsx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import {
  CIRCLED_NUMBERS,
  KOREAN_ORDINALS,
  emailRefusalNotice,
  getEffectiveVersion,
  getTermsCounterpart,
  termsDocuments,
  type TermsArticle as TermsArticleData,
  type TermsDocumentId,
  type TermsParagraph as TermsParagraphData,
} from "@/data/terms";

/**
 * 약관·정책 문서 4종이 공유하는 렌더러. 문서마다 다른 것은 docId 하나뿐이라
 * 페이지는 이 컴포넌트를 한 줄 렌더만 한다(support/page.tsx와 같은 형태).
 *
 * 상호작용이 없어 "use client"를 붙이지 않는다 — 이름은 화면 컴포넌트 명명 규칙을 따르지만
 * 본문 전체가 클라이언트 번들로 한 번 더 실려 나갈 이유가 없다.
 *
 * 마커(①, 1., 가.)는 데이터에 없고 여기서 인덱스로 붙인다. 규칙은 data/terms.ts:66-76 참고.
 */

/**
 * 조문 본문 공통 — 15px/1.8. 긴 조문이 이어지므로 다른 본문(1.65)보다 줄간격을 넓게 둔다.
 * break-keep — 390에서 "서비/스"처럼 단어 중간에서 줄이 갈린다(PersonalSignupClient.tsx:126과 같은 이유).
 */
const BODY_TEXT = "break-keep text-[15px] font-normal leading-[1.8] text-[#3d4653]";

/** 마커와 문장을 flex로 나눠 두 줄째부터 문장 왼쪽 끝이 마커 아래로 파고들지 않게 한다(내어쓰기). */
function MarkedLine({ marker, children }: { marker: string | null; children: string }) {
  return (
    <div className={`flex gap-1.5 ${BODY_TEXT}`}>
      {marker ? <span className="shrink-0">{marker}</span> : null}
      <p className="min-w-0">{children}</p>
    </div>
  );
}

function TermsParagraph({ paragraph, marker }: { paragraph: TermsParagraphData; marker: string | null }) {
  return (
    <div>
      <MarkedLine marker={marker}>{paragraph.text}</MarkedLine>

      {paragraph.items ? (
        <ol className="mt-2.5 space-y-2 pl-5">
          {paragraph.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <MarkedLine marker={`${itemIndex + 1}.`}>{item.text}</MarkedLine>

              {item.subItems ? (
                <ol className="mt-2 space-y-2 pl-5">
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <MarkedLine marker={`${KOREAN_ORDINALS[subIndex]}.`}>{subItem.text}</MarkedLine>
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function TermsArticle({ article }: { article: TermsArticleData }) {
  // 항이 하나뿐인 조는 원문에도 ①이 없다(제1조·제26조).
  const showParagraphMarkers = article.paragraphs.length > 1;

  return (
    <article className="mt-8">
      <h3 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">
        제{article.no}조 ({article.title})
      </h3>
      <div className="mt-3 space-y-3">
        {article.paragraphs.map((paragraph, index) => (
          <TermsParagraph
            key={index}
            paragraph={paragraph}
            marker={showParagraphMarkers ? CIRCLED_NUMBERS[index] : null}
          />
        ))}
      </div>
    </article>
  );
}

/**
 * 이메일무단수집거부 — 약관이 아니라 법적 고지라 장·조·항 계층도, 시행일도 없다(data/terms.ts).
 * 크기·색·간격은 위 조문 렌더의 값을 그대로 쓴다: 법령명·소제목 17, 본문 15, 항 마커는 ①②③.
 */
function EmailRefusalNoticeView() {
  return (
    <>
      <p className={`mt-8 ${BODY_TEXT}`}>{emailRefusalNotice.intro}</p>

      <section className="mt-12">
        <h2 className="break-keep text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">
          {emailRefusalNotice.lawTitle}
        </h2>
        <div className="mt-3 space-y-3">
          {emailRefusalNotice.clauses.map((clause, index) => (
            <MarkedLine key={index} marker={CIRCLED_NUMBERS[index]}>
              {clause}
            </MarkedLine>
          ))}
          <p className={BODY_TEXT}>{emailRefusalNotice.penalty}</p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">{emailRefusalNotice.report.title}</h2>
        {/* spam.kisa.or.kr은 링크로 만들지 않는다 — 도메인이 바뀌면 죽은 링크가 된다. */}
        <p className={`mt-3 ${BODY_TEXT}`}>{emailRefusalNotice.report.text}</p>
      </section>
    </>
  );
}

/**
 * 이용약관 2종 전환. 칸 순서는 개인회원 → 기관회원으로 고정한다 —
 * [현재 문서, 상대 문서] 순으로 그리면 /terms/business에서 순서가 뒤집혀 같은 UI가 경로마다 달라 보인다.
 * 라벨에 "이용약관"을 반복하지 않는다: 바로 위 h1이 이미 "이용약관"/"기관회원 이용약관"이다.
 */
const termsSwitchTabs: { id: TermsDocumentId; label: string }[] = [
  { id: "service", label: "개인회원" },
  { id: "business", label: "기관회원" },
];

/**
 * 생김새는 QnaHomeClient.tsx의 QnaTypeToggle에서 클래스 문자열을 그대로 가져왔다 — 이 리포에서
 * 2지선다를 그리는 유일한 선례다. 갈라지지 않게 그쪽을 고치면 여기도 함께 볼 것.
 * (바깥에 w-fit만 더했다. 그쪽은 flex 행 안에 있어 필요 없지만 여기서는 블록 흐름이라 없으면 전폭으로 늘어난다.)
 *
 * 활성 판정은 usePathname이 아니라 docId로 한다 — 경로를 다시 해석할 이유가 없고,
 * usePathname을 쓰면 이 파일이 "use client"가 되어 본문 전체가 클라이언트 번들에 실린다(파일 상단 주석 참고).
 *
 * 상대 문서의 본문이 비어 있어도 버튼을 막지 않는다. 눌러서 넘어간 화면에서 "이 문서는 준비 중입니다"를
 * 보게 하는 것이 규칙이다(data/terms.ts의 getTermsCounterpart 주석과 같은 내용).
 */
function TermsSwitch({ docId }: { docId: TermsDocumentId }) {
  return (
    <div
      className="flex h-9 w-fit shrink-0 overflow-hidden border border-[#dce2ea] bg-white"
      role="tablist"
      aria-label="이용약관 종류"
    >
      {termsSwitchTabs.map((tab) => {
        const target = termsDocuments.find((item) => item.id === tab.id);
        if (!target) return null;

        const active = tab.id === docId;
        return (
          <Link
            key={tab.id}
            href={target.path}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full min-w-[100px] items-center justify-center border-r border-[#dce2ea] px-4 text-[13px] font-medium transition-colors last:border-r-0",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:bg-[#f4f4f4] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function TermsDocumentClient({ docId }: { docId: TermsDocumentId }) {
  const doc = termsDocuments.find((item) => item.id === docId);

  if (!doc) {
    notFound();
  }

  const effective = getEffectiveVersion(doc);
  // 짝이 없는 문서(개인정보처리방침·이메일무단수집거부)는 전환 UI 자체를 그리지 않는다.
  const hasCounterpart = getTermsCounterpart(docId) !== null;

  return (
    <>
      {/* 가입·재동의 도중 열리는 화면이라 네비게이션 없는 헤더를 쓴다 — AuthHeader.tsx:5-6과 같은 취지. */}
      <AuthHeader />

      {/* min-h — "준비 중" 한 장짜리 화면에서 푸터가 화면 중간에 뜨지 않게 한다(MigrationCard와 같은 값). */}
      <main className="min-h-[calc(100vh-64px)] bg-white pb-24 pt-14 max-[760px]:pt-10">
        {/* 760px 본문 폭. globals.css의 .app-shell--text를 처음으로 쓰는 화면이다. */}
        <div className="app-shell--text">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">{doc.title}</h1>

          {effective ? (
            <p className="mt-2 text-[13px] font-medium text-[#8a94a3]">
              {effective.version.effectiveDate} {effective.upcoming ? "시행 예정" : "시행"}
            </p>
          ) : null}

          {/* 위 mt-8(32px) < 아래 mt-12(48px) — 전환 UI가 제목 덩어리에 붙고 본문과는 떨어져 보이게 한다.
              두 값 모두 이 파일이 이미 쓰던 것이다(준비 중 안내의 mt-8, 장 섹션의 mt-12). */}
          {hasCounterpart ? (
            <div className="mt-8">
              <TermsSwitch docId={docId} />
            </div>
          ) : null}

          {effective ? (
            <>
              {effective.version.chapters.map((chapter) => (
                <section key={chapter.no} className="mt-12">
                  <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#17202c]">
                    제{chapter.no}장 {chapter.title}
                  </h2>
                  {chapter.articles.map((article) => (
                    <TermsArticle key={article.no} article={article} />
                  ))}
                </section>
              ))}

              {/* 부칙은 장·조 밖의 마커 없는 문단이다(data/terms.ts:66-76). */}
              <section className="mt-14 border-t border-border pt-10">
                <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#17202c]">
                  {effective.version.addendum.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {effective.version.addendum.paragraphs.map((paragraph, index) => (
                    <p key={index} className={BODY_TEXT}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            </>
          ) : docId === "email" ? (
            <EmailRefusalNoticeView />
          ) : (
            <div className="mt-8">
              <InfoNoticeBox>이 문서는 준비 중입니다. 확정되는 대로 게시합니다.</InfoNoticeBox>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
