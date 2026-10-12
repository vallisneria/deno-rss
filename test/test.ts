import { expect, test } from "vitest";
import { ItemBuilder, RssBuilder } from "../src/mod.ts";

// ==================== 기본 빌더 테스트 ====================

test("ItemBuilder - 유효한 아이템 생성", () => {
  const item = new ItemBuilder()
    .title("Test Item")
    .description("Lorem Ipsum dolor sit amet")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guid("https://example.com", true)
    .build();

  expect(item.title).toEqual("Test Item");
  expect(item.description).toEqual("Lorem Ipsum dolor sit amet");
  expect(item.link.toString()).toEqual("https://example.com/");
  expect(item.guid.id).toEqual("https://example.com");
  expect(item.guid.isPermaLink).toEqual(true);
});

test("RssBuilder - 유효한 RSS 피드 생성", () => {
  const item = new ItemBuilder()
    .title("Test Item")
    .description("Lorem Ipsum dolor sit amet")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guid("https://example.com", true)
    .build();

  const rss = new RssBuilder()
    .title("Test RSS")
    .description("Lorem Ipsum dolor sit amet")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .item([item])
    .build();

  expect(rss.title).toEqual("Test RSS");
  expect(rss.description).toEqual("Lorem Ipsum dolor sit amet");
  expect(rss.link.toString()).toEqual("https://example.com/");
  expect(rss.item.length).toEqual(1);
});

// ==================== XML 생성 테스트 ====================

test("RssBuilder - XML 선언이 포함된 유효한 XML 생성", () => {
  const item = new ItemBuilder()
    .title("Test Item")
    .description("Test description")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com/item"))
    .guidNonPermalink("test-id")
    .build();

  const rss = new RssBuilder()
    .title("Test Feed")
    .link(new URL("https://example.com"))
    .description("Test feed description")
    .item([item])
    .buildRss();

  expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  expect(rss).toContain('<rss version="2.0">');
  expect(rss).toContain("<channel>");
  expect(rss).toContain("<title><![CDATA[Test Feed]]></title>");
  expect(rss).toContain("<link>https://example.com/</link>");
  expect(rss).toContain(
    "<description><![CDATA[Test feed description]]></description>",
  );
});

test("RssBuilder - XML에 아이템 포함", () => {
  const item = new ItemBuilder()
    .title("Item Title")
    .description("Item description")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com/item"))
    .guidNonPermalink("item-1")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .item([item])
    .buildRss();

  expect(rss).toContain("<item>");
  expect(rss).toContain("<title><![CDATA[Item Title]]></title>");
  expect(rss).toContain("<link>https://example.com/item</link>");
  expect(rss).toContain('<guid isPermaLink="false">item-1</guid>');
});

test("RssBuilder - XML에 선택적 필드 포함", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .language("ko-kr")
    .copyright("Copyright 2025")
    .ttl(60)
    .item([item])
    .buildRss();

  expect(rss).toContain("<language>ko-kr</language>");
  expect(rss).toContain("<copyright>Copyright 2025</copyright>");
  expect(rss).toContain("<ttl>60</ttl>");
});

test("RssBuilder - XML에 enclosure 포함", () => {
  const item = new ItemBuilder()
    .title("Test Item")
    .description("Lorem Ipsum dolor sit amet")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guid("https://example.com", true)
    .enclosure(
      new URL("https://example.com/enclosure.mp3"),
      1234567,
      "audio/mpeg",
    )
    .build();

  const rss = new RssBuilder()
    .title("Test RSS")
    .description("Lorem Ipsum dolor sit amet")
    .link(new URL("https://example.com"))
    .item([item])
    .buildRss();

  expect(rss).toContain("<enclosure");
  expect(rss).toContain('url="https://example.com/enclosure.mp3"');
  expect(rss).toContain('length="1234567"');
  expect(rss).toContain('type="audio/mpeg"');
});

// ==================== Author 형식 테스트 ====================

test("RssBuilder - 이메일이 있는 author는 올바른 형식 사용", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .author("John Doe", "john@example.com")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .managingEditor("Jane Doe", "jane@example.com")
    .item([item])
    .buildRss();

  // RSS 2.0 spec: email (name) format
  expect(rss).toContain("<author>john@example.com (John Doe)</author>");
  expect(rss).toContain(
    "<managingEditor>jane@example.com (Jane Doe)</managingEditor>",
  );
});

test("RssBuilder - 이메일이 없는 author는 이름만 사용", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .author("John Doe")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .webMaster("Jane Doe")
    .item([item])
    .buildRss();

  expect(rss).toContain("<author>John Doe</author>");
  expect(rss).toContain("<webMaster>Jane Doe</webMaster>");
});

// ==================== 검증 테스트 ====================

test("ItemBuilder - 빈 제목에 대해 에러 발생", () => {
  expect(() => {
    new ItemBuilder().title("");
  }).toThrow("제목은 비어있을 수 없습니다");
});

test("ItemBuilder - 공백만 있는 제목에 대해 에러 발생", () => {
  expect(() => {
    new ItemBuilder().title("   ");
  }).toThrow("제목은 비어있을 수 없습니다");
});

test("ItemBuilder - 제목에서 공백 제거", () => {
  const item = new ItemBuilder()
    .title("  Test Item  ")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  expect(item.title).toEqual("Test Item");
});

test("RssBuilder - 빈 제목에 대해 에러 발생", () => {
  expect(() => {
    new RssBuilder().title("");
  }).toThrow("제목은 비어있을 수 없습니다");
});

test("RssBuilder - 음수 ttl에 대해 에러 발생", () => {
  expect(() => {
    new RssBuilder().ttl(-1);
  }).toThrow("ttl은 양수여야 합니다");
});

test("RssBuilder - 0 ttl 허용", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .ttl(0)
    .item([item])
    .build();

  expect(rss.ttl).toEqual(0);
});

test("ItemBuilder - 음수 enclosure length에 대해 에러 발생", () => {
  expect(() => {
    new ItemBuilder().enclosure(
      new URL("https://example.com/file.mp3"),
      -1,
      "audio/mpeg",
    );
  }).toThrow("길이는 양수여야 합니다");
});

test("ItemBuilder - 0 enclosure length 허용", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .enclosure(new URL("https://example.com/file.mp3"), 0, "audio/mpeg")
    .build();

  expect(item.enclosure?.length).toEqual(0);
});

// ==================== 날짜 처리 테스트 ====================

test("ItemBuilder - 문자열에서 날짜 처리", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromString("2025-01-01T00:00:00Z")
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  expect(item.pubDate.toISOString()).toEqual("2025-01-01T00:00:00.000Z");
});

test("ItemBuilder - 잘못된 날짜 문자열에 대해 에러 발생", () => {
  expect(() => {
    new ItemBuilder().pubDateFromString("invalid date");
  }).toThrow(Error);
});

test("RssBuilder - epoch milliseconds로부터 lastBuildDate 처리", () => {
  const timestamp = 1609459200000; // 2021-01-01T00:00:00Z
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .lastBuildDateFromEpochMilliseconds(timestamp)
    .item([item])
    .build();

  expect(rss.lastBuildDate?.getTime()).toEqual(timestamp);
});

test("ItemBuilder - Date로 pubDate 설정", () => {
  const date = new Date("2025-01-01T00:00:00Z");
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDate(date)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  expect(item.pubDate).toEqual(date);
});

test("ItemBuilder - 전달한 Date를 수정해도 pubDate는 바뀌지 않음", () => {
  const date = new Date("2025-01-01T00:00:00Z");
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDate(date)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  date.setTime(0);

  expect(item.pubDate.toISOString()).toEqual("2025-01-01T00:00:00.000Z");
});

test("ItemBuilder - 유효하지 않은 Date에 대해 에러 발생", () => {
  expect(() => {
    new ItemBuilder().pubDate(new Date("invalid"));
  }).toThrow("유효하지 않은 날짜입니다");
});

test("RssBuilder - 유효하지 않은 Date에 대해 에러 발생", () => {
  expect(() => {
    new RssBuilder().lastBuildDate(new Date(NaN));
  }).toThrow("유효하지 않은 날짜입니다");
});

test("RssBuilder - XML에 RFC 822 형식의 날짜 포함", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDate(new Date("2025-01-01T09:30:00+09:00"))
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .pubDate(new Date("2025-01-02T00:00:00Z"))
    .lastBuildDateFromEpochMilliseconds(1609459200000)
    .item([item])
    .buildRss();

  expect(rss).toContain("<pubDate>Wed, 01 Jan 2025 00:30:00 GMT</pubDate>");
  expect(rss).toContain("<pubDate>Thu, 02 Jan 2025 00:00:00 GMT</pubDate>");
  expect(rss).toContain(
    "<lastBuildDate>Fri, 01 Jan 2021 00:00:00 GMT</lastBuildDate>",
  );
});

// ==================== GUID 테스트 ====================

test("ItemBuilder - guidPermalink는 isPermaLink를 true로 설정", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidPermalink(new URL("https://example.com/item"))
    .build();

  expect(item.guid.id).toEqual("https://example.com/item");
  expect(item.guid.isPermaLink).toEqual(true);
});

test("ItemBuilder - guidNonPermalink는 isPermaLink를 false로 설정", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("unique-id-123")
    .build();

  expect(item.guid.id).toEqual("unique-id-123");
  expect(item.guid.isPermaLink).toEqual(false);
});

// ==================== 카테고리 테스트 ====================

test("ItemBuilder - 카테고리 추가", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .category([
      { name: "Technology" },
      {
        name: "News",
        domain: new URL("https://example.com/news"),
      },
    ])
    .build();

  expect(item.category).toEqual([
    { name: "Technology" },
    {
      name: "News",
      domain: new URL("https://example.com/news"),
    },
  ]);
});

test("RssBuilder - 카테고리 추가", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .category([
      { name: "Tech", domain: new URL("https://example.com/tech") },
      { name: "Blog" },
    ])
    .item([item])
    .buildRss();

  expect(rss).toContain(
    '<category domain="https://example.com/tech">Tech</category>',
  );
  expect(rss).toContain("<category>Blog</category>");
});

// ==================== 여러 아이템 테스트 ====================

test("RssBuilder - 여러 아이템 처리", () => {
  const items = [
    new ItemBuilder()
      .title("Item 1")
      .description("Description 1")
      .pubDateFromEpochMilliseconds(1000)
      .link(new URL("https://example.com/1"))
      .guidNonPermalink("id-1")
      .build(),
    new ItemBuilder()
      .title("Item 2")
      .description("Description 2")
      .pubDateFromEpochMilliseconds(2000)
      .link(new URL("https://example.com/2"))
      .guidNonPermalink("id-2")
      .build(),
  ];

  const rss = new RssBuilder()
    .title("Feed")
    .link(new URL("https://example.com"))
    .description("Description")
    .item(items)
    .buildRss();

  expect(rss).toContain("<title><![CDATA[Item 1]]></title>");
  expect(rss).toContain("<title><![CDATA[Item 2]]></title>");
  expect(rss).toContain("https://example.com/1");
  expect(rss).toContain("https://example.com/2");
});
