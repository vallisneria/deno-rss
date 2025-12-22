import type { Author, Item, Rss } from "../model/mod.ts";

export function rfc822(date: Temporal.ZonedDateTime) {
  const jsDate = new Date(date.epochMilliseconds);
  return jsDate.toUTCString();
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
    title: rss.title,
    link: rss.link.toString(),
    description: rss.description,
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
    channel.pubDate = rfc822(rss.pubDate?.toZonedDateTimeISO("UTC"));
  }

  if (rss.lastBuildDate) {
    channel.lastBuildDate = rfc822(
      rss.lastBuildDate?.toZonedDateTimeISO("UTC"),
    );
  }

  if (rss.category) {
    channel.category = rss.category;
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
    title: item.title,
    link: item.link.toString(),
    description: item.description,
    guid: {
      "@isPermaLink": item.guid.isPermaLink,
      "#text": item.guid.id,
    },
    pubDate: rfc822(item.pubDate.toZonedDateTimeISO("UTC")),
  };

  if (item.author) {
    data.author = authorString(item.author);
  }

  if (item.category) {
    data.category = item.category;
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
