# deno-rss

A simple RSS feed generator for Deno.

This library uses Deno's unstable
[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
API. To use this library, you must enable the `temporal` flag in the `unstable`
field of your `deno.json` file.

For example:

```json
{
  "unstable": ["temporal"]
}
```

## Example

```ts
import { ItemBuilder, RssBuilder } from "@vallisneria/deno-rss";

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
import { ItemBuilder, RssBuilder } from "@vallisneria/deno-rss";

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
