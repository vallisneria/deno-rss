export interface Enclosure {
  /** 미디어 객체의 URL */
  url: URL;

  /** 미디어 파일의 바이트 크기 */
  length: number;

  /** MIME 타입 */
  type: string;
}
