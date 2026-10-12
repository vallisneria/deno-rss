import type { Author } from "./author.ts";
import { Category } from "./category.ts";
import type { Enclosure } from "./enclosure.ts";
import type { Guid } from "./guid.ts";

export interface Item {
  /**
   * 항목의 제목입니다.
   */
  title: string;

  /**
   * 항목의 URL입니다.
   */
  link: URL;

  /**
   * 항목의 요약입니다.
   */
  description: string;

  /**
   * 항목 작성자의 이름입니다.
   */
  author?: Author;

  /**
   * 항목이 속한 하나 이상의 카테고리입니다.
   */
  category?: Array<Category>;

  /**
   * 항목에 대한 댓글 페이지의 URL입니다.
   */
  comments?: URL;

  /**
   * 항목에 첨부된 미디어 객체(팟캐스트, 영상 등)를 설명합니다.
   */
  enclosure?: Enclosure;

  /**
   * 항목을 고유하게 식별하는 문자열입니다.
   */
  guid: Guid;

  /**
   * 항목이 게시된 날짜입니다.
   */
  pubDate: Date;
}
