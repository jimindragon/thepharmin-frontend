import type { ResourceFile } from "@/data/resources";

export function formatResourcePrice(file: ResourceFile) {
  return file.isFree ? "무료" : `${file.price.toLocaleString("ko-KR")}원`;
}
