import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import { ItemBuilder, RssBuilder } from "@vallisneria/rss";

// ==================== 기본 빌더 테스트 ====================

Deno.test("ItemBuilder - 유효한 아이템 생성", () => {
  const item = new ItemBuilder()
    .title("Test Item")
    .description("Lorem Ipsum dolor sit amet")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guid("https://example.com", true)
    .build();

  assertEquals(item.title, "Test Item");
  assertEquals(item.description, "Lorem Ipsum dolor sit amet");
  assertEquals(item.link.toString(), "https://example.com/");
  assertEquals(item.guid.id, "https://example.com");
  assertEquals(item.guid.isPermaLink, true);
});

Deno.test("RssBuilder - 유효한 RSS 피드 생성", () => {
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

  assertEquals(rss.title, "Test RSS");
  assertEquals(rss.description, "Lorem Ipsum dolor sit amet");
  assertEquals(rss.link.toString(), "https://example.com/");
  assertEquals(rss.item.length, 1);
});

// ==================== XML 생성 테스트 ====================

Deno.test("RssBuilder - XML 선언이 포함된 유효한 XML 생성", () => {
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

  assertStringIncludes(rss, '<?xml version="1.0" encoding="UTF-8"?>');
  assertStringIncludes(rss, '<rss version="2.0">');
  assertStringIncludes(rss, "<channel>");
  assertStringIncludes(rss, "<title><![CDATA[Test Feed]]></title>");
  assertStringIncludes(rss, "<link>https://example.com/</link>");
  assertStringIncludes(
    rss,
    "<description><![CDATA[Test feed description]]></description>",
  );
});

Deno.test("RssBuilder - XML에 아이템 포함", () => {
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

  assertStringIncludes(rss, "<item>");
  assertStringIncludes(rss, "<title><![CDATA[Item Title]]></title>");
  assertStringIncludes(rss, "<link>https://example.com/item</link>");
  assertStringIncludes(rss, '<guid isPermaLink="false">item-1</guid>');
});

Deno.test("RssBuilder - XML에 선택적 필드 포함", () => {
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

  assertStringIncludes(rss, "<language>ko-kr</language>");
  assertStringIncludes(rss, "<copyright>Copyright 2025</copyright>");
  assertStringIncludes(rss, "<ttl>60</ttl>");
});

Deno.test("RssBuilder - XML에 enclosure 포함", () => {
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

  assertStringIncludes(rss, "<enclosure");
  assertStringIncludes(rss, 'url="https://example.com/enclosure.mp3"');
  assertStringIncludes(rss, 'length="1234567"');
  assertStringIncludes(rss, 'type="audio/mpeg"');
});

// ==================== Author 형식 테스트 ====================

Deno.test("RssBuilder - 이메일이 있는 author는 올바른 형식 사용", () => {
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
  assertStringIncludes(rss, "<author>john@example.com (John Doe)</author>");
  assertStringIncludes(
    rss,
    "<managingEditor>jane@example.com (Jane Doe)</managingEditor>",
  );
});

Deno.test("RssBuilder - 이메일이 없는 author는 이름만 사용", () => {
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

  assertStringIncludes(rss, "<author>John Doe</author>");
  assertStringIncludes(rss, "<webMaster>Jane Doe</webMaster>");
});

// ==================== 검증 테스트 ====================

Deno.test("ItemBuilder - 빈 제목에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new ItemBuilder().title("");
    },
    Error,
    "제목은 비어있을 수 없습니다",
  );
});

Deno.test("ItemBuilder - 공백만 있는 제목에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new ItemBuilder().title("   ");
    },
    Error,
    "제목은 비어있을 수 없습니다",
  );
});

Deno.test("ItemBuilder - 제목에서 공백 제거", () => {
  const item = new ItemBuilder()
    .title("  Test Item  ")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  assertEquals(item.title, "Test Item");
});

Deno.test("RssBuilder - 빈 제목에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new RssBuilder().title("");
    },
    Error,
    "제목은 비어있을 수 없습니다",
  );
});

Deno.test("RssBuilder - 음수 ttl에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new RssBuilder().ttl(-1);
    },
    Error,
    "ttl은 양수여야 합니다",
  );
});

Deno.test("RssBuilder - 0 ttl 허용", () => {
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

  assertEquals(rss.ttl, 0);
});

Deno.test("ItemBuilder - 음수 enclosure length에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new ItemBuilder().enclosure(
        new URL("https://example.com/file.mp3"),
        -1,
        "audio/mpeg",
      );
    },
    Error,
    "길이는 양수여야 합니다",
  );
});

Deno.test("ItemBuilder - 0 enclosure length 허용", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .enclosure(new URL("https://example.com/file.mp3"), 0, "audio/mpeg")
    .build();

  assertEquals(item.enclosure?.length, 0);
});

// ==================== 날짜 처리 테스트 ====================

Deno.test("ItemBuilder - 문자열에서 날짜 처리", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromString("2025-01-01T00:00:00Z")
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .build();

  assertEquals(
    item.pubDate.toString(),
    Temporal.Instant.from("2025-01-01T00:00:00Z").toString(),
  );
});

Deno.test("ItemBuilder - 잘못된 날짜 문자열에 대해 에러 발생", () => {
  assertThrows(
    () => {
      new ItemBuilder().pubDateFromString("invalid date");
    },
    Error,
  );
});

Deno.test("RssBuilder - epoch milliseconds로부터 lastBuildDate 처리", () => {
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

  assertEquals(
    rss.lastBuildDate?.toString(),
    Temporal.Instant.fromEpochMilliseconds(timestamp).toString(),
  );
});

// ==================== GUID 테스트 ====================

Deno.test("ItemBuilder - guidPermalink는 isPermaLink를 true로 설정", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidPermalink(new URL("https://example.com/item"))
    .build();

  assertEquals(item.guid.id, "https://example.com/item");
  assertEquals(item.guid.isPermaLink, true);
});

Deno.test("ItemBuilder - guidNonPermalink는 isPermaLink를 false로 설정", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("unique-id-123")
    .build();

  assertEquals(item.guid.id, "unique-id-123");
  assertEquals(item.guid.isPermaLink, false);
});

// ==================== 카테고리 테스트 ====================

Deno.test("ItemBuilder - 카테고리 추가", () => {
  const item = new ItemBuilder()
    .title("Test")
    .description("Test")
    .pubDateFromEpochMilliseconds(1234)
    .link(new URL("https://example.com"))
    .guidNonPermalink("test")
    .category([{ name: "Technology" }, {
      name: "News",
      domain: new URL("https://example.com/news"),
    }])
    .build();

  assertEquals(item.category, [{ name: "Technology" }, {
    name: "News",
    domain: new URL("https://example.com/news"),
  }]);
});

Deno.test("RssBuilder - 카테고리 추가", () => {
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

  assertStringIncludes(
    rss,
    '<category domain="https://example.com/tech">Tech</category>',
  );
  assertStringIncludes(rss, "<category>Blog</category>");
});

// ==================== 여러 아이템 테스트 ====================

Deno.test("RssBuilder - 여러 아이템 처리", () => {
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

  assertStringIncludes(rss, "<title><![CDATA[Item 1]]></title>");
  assertStringIncludes(rss, "<title><![CDATA[Item 2]]></title>");
  assertStringIncludes(rss, "https://example.com/1");
  assertStringIncludes(rss, "https://example.com/2");
});
