import type { Category, Item } from "../model/mod.ts";
import { toDate } from "./utils.ts";

type RequireField = "title" | "link" | "description" | "pubDate" | "guid";
type Buildable<T extends string> = RequireField extends T ? true : false;

export class ItemBuilder<P extends string = never> {
  private item: Partial<Item> = {};

  public title(title: string): ItemBuilder<P | "title"> {
    title = title.trim();

    if (!title) {
      throw new Error("제목은 비어있을 수 없습니다.");
    }

    this.item.title = title;
    return this as unknown as ItemBuilder<P | "title">;
  }

  public link(link: URL): ItemBuilder<P | "link"> {
    this.item.link = link;
    return this as unknown as ItemBuilder<P | "link">;
  }

  public description(description: string): ItemBuilder<P | "description"> {
    this.item.description = description;
    return this as unknown as ItemBuilder<P | "description">;
  }

  public author(name: string, email?: string): this {
    this.item.author = { name, email };
    return this;
  }

  public category(category: Array<Category>): this {
    this.item.category = category;
    return this;
  }

  public comments(comments: URL): this {
    this.item.comments = comments;
    return this;
  }

  public enclosure(url: URL, length: number, type: string): this {
    if (length < 0) {
      throw new Error("길이는 양수여야 합니다.");
    }

    this.item.enclosure = { url, length, type };
    return this;
  }

  public guid(id: string, isPermaLink: boolean): ItemBuilder<P | "guid"> {
    this.item.guid = { id, isPermaLink };
    return this as unknown as ItemBuilder<P | "guid">;
  }

  public guidPermalink(link: URL): ItemBuilder<P | "guid"> {
    return this.guid(link.toString(), true);
  }

  public guidNonPermalink(id: string): ItemBuilder<P | "guid"> {
    return this.guid(id, false);
  }

  public pubDate(pubDate: Date): ItemBuilder<P | "pubDate"> {
    this.item.pubDate = toDate(pubDate);
    return this as unknown as ItemBuilder<P | "pubDate">;
  }

  public pubDateFromString(date: string): ItemBuilder<P | "pubDate"> {
    return this.pubDate(toDate(date));
  }

  public pubDateFromEpochMilliseconds(
    timestamp: number,
  ): ItemBuilder<P | "pubDate"> {
    return this.pubDate(toDate(timestamp));
  }

  public build(
    this: Buildable<P> extends true ? this : never,
  ): Item {
    return this.item as Item;
  }
}
