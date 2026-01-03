import type { Item, Rss } from "../model/mod.ts";
import { stringify } from "@libs/xml";
import * as utils from "./utils.ts";
import type { Category } from "../model/category.ts";

type RequireField = "title" | "link" | "description" | "items";
type Buildable<T extends string> = RequireField extends T ? true : false;

export class RssBuilder<P extends string = never> {
  private rss: Partial<Rss> = {};

  public title(title: string): RssBuilder<P | "title"> {
    title = title.trim();

    if (!title) {
      throw new Error("제목은 비어있을 수 없습니다");
    }

    this.rss.title = title;
    return this as unknown as RssBuilder<P | "title">;
  }

  public link(link: URL): RssBuilder<P | "link"> {
    this.rss.link = link;
    return this as unknown as RssBuilder<P | "link">;
  }

  public description(description: string): RssBuilder<P | "description"> {
    this.rss.description = description;
    return this as unknown as RssBuilder<P | "description">;
  }

  public pubDate(pubDate: Temporal.Instant): this {
    this.rss.pubDate = pubDate;
    return this;
  }

  public pubDateFromString(date: string): this {
    const pubDate = Temporal.Instant.from(date);
    return this.pubDate(pubDate);
  }

  public pubDateFromEpochMilliseconds(epochMilliseconds: number): this {
    const pubDate = Temporal.Instant.fromEpochMilliseconds(epochMilliseconds);
    return this.pubDate(pubDate);
  }

  public lastBuildDate(lastBuildDate: Temporal.Instant): this {
    this.rss.lastBuildDate = lastBuildDate;
    return this;
  }

  public lastBuildDateFromString(date: string): this {
    const lastBuildDate = Temporal.Instant.from(date);
    return this.lastBuildDate(lastBuildDate);
  }

  public lastBuildDateFromEpochMilliseconds(epochMilliseconds: number): this {
    const lastBuildDate = Temporal.Instant.fromEpochMilliseconds(
      epochMilliseconds,
    );
    return this.lastBuildDate(lastBuildDate);
  }

  public language(language: string): this {
    this.rss.language = language;
    return this;
  }

  public copyright(copyright: string): this {
    this.rss.copyright = copyright;
    return this;
  }

  public managingEditor(name: string, email?: string): this {
    this.rss.managingEditor = { name, email };
    return this;
  }

  public webMaster(name: string, email?: string): this {
    this.rss.webMaster = { name, email };
    return this;
  }

  public category(category: Array<Category>): this {
    this.rss.category = category;
    return this;
  }

  public generator(generator: string): this {
    this.rss.generator = generator;
    return this;
  }

  public docs(docs: URL): this {
    this.rss.docs = docs;
    return this;
  }

  public ttl(ttl: number): this {
    if (ttl < 0) {
      throw new Error("ttl은 양수여야 합니다");
    }

    this.rss.ttl = ttl;
    return this;
  }

  public item(items: Item[]): RssBuilder<P | "items"> {
    this.rss.item = items;
    return this as unknown as RssBuilder<P | "items">;
  }

  public build(this: Buildable<P> extends true ? this : never): Rss {
    return this.rss as Rss;
  }

  public buildRss(this: Buildable<P> extends true ? this : never): string {
    return stringify(utils.rssToXml(this.rss as Rss), {});
  }
}
