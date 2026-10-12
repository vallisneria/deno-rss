import type { Author, Item, Rss } from "../model/mod.ts";
import { cdata } from "@libs/xml";

/**
 * `Date`를 복사하여 반환합니다. 유효하지 않은 날짜면 에러를 던집니다.
 */
export function toDate(date: Date | string | number): Date {
  const copied = new Date(date instanceof Date ? date.getTime() : date);

  if (Number.isNaN(copied.getTime())) {
    throw new Error("유효하지 않은 날짜입니다");
  }

  return copied;
}

export function rfc822(date: Date) {
  return date.toUTCString();
}

export function authorString(author: Author) {
  if (author.email) {
    return `${author.email} (${author.name})`;
  } else {
    return author.name;
  }
}

export function rssToXml(rss: Rss) {
  const channel: Partial<Record<keyof Rss, unknown>> = {
    title: cdata(rss.title),
    link: rss.link.toString(),
    description: cdata(rss.description),
    item: rss.item.map(itemToXml),
  };

  if (rss.language) {
    channel.language = rss.language;
  }

  if (rss.copyright) {
    channel.copyright = rss.copyright;
  }

  if (rss.managingEditor) {
    channel.managingEditor = authorString(rss.managingEditor);
  }

  if (rss.webMaster) {
    channel.webMaster = authorString(rss.webMaster);
  }

  if (rss.pubDate) {
    channel.pubDate = rfc822(rss.pubDate);
  }

  if (rss.lastBuildDate) {
    channel.lastBuildDate = rfc822(rss.lastBuildDate);
  }

  if (rss.category) {
    channel.category = rss.category.map((category) => {
      if (category.domain) {
        return {
          "@domain": category.domain.toString(),
          "#text": category.name,
        };
      }
      return category.name;
    });
  }

  if (rss.generator) {
    channel.generator = rss.generator;
  }

  if (rss.docs) {
    channel.docs = rss.docs.toString();
  }

  if (rss.ttl) {
    channel.ttl = rss.ttl;
  }

  return {
    "@version": "1.0",
    "@encoding": "UTF-8",
    rss: {
      "@version": "2.0",
      channel,
    },
  };
}

function itemToXml(item: Item) {
  const data: Partial<Record<keyof Item, unknown>> = {
    title: cdata(item.title),
    link: item.link.toString(),
    description: cdata(item.description),
    guid: {
      "@isPermaLink": item.guid.isPermaLink,
      "#text": item.guid.id,
    },
    pubDate: rfc822(item.pubDate),
  };

  if (item.author) {
    data.author = authorString(item.author);
  }

  if (item.category) {
    data.category = item.category.map((category) => {
      if (category.domain) {
        return {
          "@domain": category.domain.toString(),
          "#text": category.name,
        };
      }
      return category.name;
    });
  }

  if (item.comments) {
    data.comments = item.comments.toString();
  }

  if (item.enclosure) {
    data.enclosure = {
      "@url": item.enclosure.url.toString(),
      "@length": item.enclosure.length,
      "@type": item.enclosure.type,
    };
  }

  return data;
}
