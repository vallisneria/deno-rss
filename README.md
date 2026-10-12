# deno-rss

A simple RSS 2.0 feed generator. It has no runtime-specific dependencies, so it
works on Deno, Node.js, Bun, and Cloudflare Workers.

## Dates

Dates are plain `Date` objects. You can also pass an epoch milliseconds number
or a date string.

```ts
new ItemBuilder().pubDate(new Date());
new ItemBuilder().pubDateFromEpochMilliseconds(Date.now());
new ItemBuilder().pubDateFromString("2025-01-01T00:00:00Z");
```

### Migrating from 0.1.x

Since 0.2.0, `pubDate()` and `lastBuildDate()` take a `Date` instead of a
`Temporal.Instant`, and `Item.pubDate`, `Rss.pubDate`, `Rss.lastBuildDate` are
`Date`. Convert an existing `Temporal.Instant` like this:

```ts
builder.pubDate(new Date(instant.epochMilliseconds));
```

## Example

```ts
import { ItemBuilder, RssBuilder } from "@vallisneria/rss";

const item = new ItemBuilder()
  .title("My First Post")
  .link(new URL("https://example.com/posts/1"))
  .description("This is my first blog post")
  .pubDateFromEpochMilliseconds(Date.now())
  .guidNonPermalink("post-1")
  .build();

const rss = new RssBuilder()
  .title("My Blog")
  .link(new URL("https://example.com"))
  .description("A blog about programming")
  .language("ko-kr")
  .item([item])
  .buildRss();

console.log(rss);
```

## Advanced Example

```ts
import { ItemBuilder, RssBuilder } from "@vallisneria/rss";

// Create multiple items
const items = [
  {
    title: "Post 1",
    url: "https://example.com/1",
    description: "First post",
    date: Date.now(),
  },
  {
    title: "Post 2",
    url: "https://example.com/2",
    description: "Second post",
    date: Date.now() - 86400000,
  },
];

const rssItems = items.map((item) =>
  new ItemBuilder()
    .title(item.title)
    .link(new URL(item.url))
    .description(item.description)
    .pubDateFromEpochMilliseconds(item.date)
    .guidPermalink(new URL(item.url))
    .author("John Doe", "john@example.com")
    .category(["Technology", "Programming"])
    .build()
);

const rss = new RssBuilder()
  .title("Tech Blog")
  .link(new URL("https://example.com"))
  .description("Latest tech articles")
  .language("en-us")
  .copyright("Copyright 2025")
  .managingEditor("Editor Name", "editor@example.com")
  .category(["Technology", "Blog"])
  .item(rssItems)
  .buildRss();

console.log(rss);
```
