import { Star } from "lucide-react";
import type { PharmacyReviewRating } from "@/config/pharmacyReviewForm";

/**
 * 종합 평가 별점(읽기 전용). 작성 폼의 별점(PharmacyReviewFormSections)과 같은 두 색을 쓴다 —
 * 채운 별은 본문 검정(#111111), 빈 별은 채운 회색(#e6e9ee). 빈 별을 외곽선으로 두면 다섯 칸이
 * 서로 다른 굵기로 읽혀 몇 점인지가 한눈에 들어오지 않는다.
 *
 * CompanyReviewCard 안에 있던 것을 그대로 꺼냈다 — 허브 피드 카드(ReviewFeedCard)가 잠긴 약국
 * 후기에 같은 별점을 그리는데, 그쪽은 서버 컴포넌트라 카드 모듈에서 가져오면 useState를 든
 * 클라이언트 번들이 함께 딸려 온다. 마크업·클래스는 한 글자도 바뀌지 않았다.
 */
export function ReviewRatingStars({ value, size }: { value: PharmacyReviewRating; size: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`5점 만점에 ${value}점`}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          size={size}
          className={score <= value ? "fill-[#111111] text-[#111111]" : "fill-[#e6e9ee] text-[#e6e9ee]"}
          aria-hidden
        />
      ))}
    </span>
  );
}
