/**
 * SEO Structured Data (JSON-LD schemas)
 * Stage 45: Organization, Event, News, WebSite schemas.
 *
 * Inject as <script type="application/ld+json"> in <head> for Google rich results.
 */

type Org = {
  name: string;
  type: string;
  description: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  state?: { code: string; nameEn: string; nameAr: string } | null;
  city?: { nameEn: string; nameAr: string } | null;
};

type EventItem = {
  title: string;
  description: string;
  eventDate: string;
  location: string | null;
  isOnline: boolean;
  organizerName: string | null;
};

type NewsItem = {
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  authorName: string | null;
  orgName: string | null;
};

export function OrganizationSchema({ org }: { org: Org }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: org.name,
    description: org.description,
    ...(org.phone && { telephone: org.phone }),
    ...(org.email && { email: org.email }),
    ...(org.website && { url: org.website }),
    ...(org.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address,
        addressRegion: org.state?.code,
        addressCountry: "US",
      },
    }),
    areaServed: "US",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function EventSchema({ event }: { event: EventItem }) {
  const d = new Date(event.eventDate);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: d.toISOString(),
    endDate: new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(event.location && {
      location: event.isOnline
        ? { "@type": "VirtualLocation", url: "#" }
        : { "@type": "Place", name: event.location, address: event.location },
    }),
    ...(event.organizerName && {
      organizer: { "@type": "Organization", name: event.organizerName },
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function NewsSchema({ news }: { news: NewsItem }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.summary,
    articleBody: news.content,
    datePublished: new Date(news.publishedAt).toISOString(),
    dateModified: new Date(news.publishedAt).toISOString(),
    ...(news.authorName && {
      author: { "@type": "Person", name: news.authorName },
    }),
    ...(news.orgName && {
      publisher: { "@type": "Organization", name: news.orgName },
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SACA — Sudanese American Community Association",
    alternateName: "الجالية السودانية الأمريكية - ولاية ميريلاند",
    url: "https://saca-md.org",
    description:
      "Sudanese American Community Association — منصة رقمية موحدة للجالية السودانية في الولايات المتحدة.",
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://saca-md.org/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationListSchema({ orgs }: { orgs: Org[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: orgs.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NGO",
        name: o.name,
        description: o.description,
        ...(o.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: o.address,
            addressRegion: o.state?.code,
            addressCountry: "US",
          },
        }),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
