import type { Item } from "./item.ts";
import type { Author } from "./author.ts";

export interface Rss {
  /**
   * 채널의 이름입니다.
   */
  title: string;

  /**
   * 채널에 해당하는 HTML 웹사이트의 URL입니다.
   */
  link: URL;

  /**
   * 채널을 설명하는 문구나 문장입니다.
   */
  description: string;

  /**
   * 채널이 작성된 언어입니다. 예: `ko-kr`
   */
  language?: string;

  /**
   * 채널 콘텐츠에 대한 저작권 고지입니다.
   */
  copyright?: string;

  /**
   * 편집 콘텐츠 책임자 정보입니다.
   */
  managingEditor?: Author;

  /**
   * 채널 관련 기술 문제 책임자의 정보입니다.
   */
  webMaster?: Author;

  /**
   * 채널 콘텐츠의 게시 날짜입니다.
   */
  pubDate?: Temporal.Instant;

  /**
   * 채널 콘텐츠가 마지막으로 변경된 시간입니다.
   */
  lastBuildDate?: Temporal.Instant;

  /**
   * 채널이 속한 하나 이상의 카테고리입니다.
   */
  category?: Array<string>;

  /**
   * 채널을 생성하는 데 사용된 프로그램을 나타내는 문자열입니다.
   */
  generator?: string;

  /**
   * RSS 파일에 사용된 형식에 대한 설명서가 있는 URL입니다.
   */
  docs?: URL;

  /**
   * Time to Live. 소스에서 새로 고치기 전에 채널을 캐시할 수 있는 시간을 나타내는 분 단위 숫자입니다.
   */
  ttl?: number;

  /**
   * RSS 피드의 개별 항목(기사) 배열입니다.
   */
  item: Array<Item>;
}
