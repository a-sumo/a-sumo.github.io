import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description, ogImage, icon } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  const thumbnailSrc =
    typeof ogImage === "string" ? ogImage : ogImage?.src;

  const titleContent = (
    <span className="inline-flex items-center gap-2">
      {icon && (
        <img
          src={icon}
          alt=""
          className="h-6 w-6 inline-block"
          style={{ border: 'none', margin: 0 }}
        />
      )}
      {title}
    </span>
  );

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {thumbnailSrc && (
          <img
            src={thumbnailSrc}
            alt={title}
            className="mb-2 rounded-lg w-full max-w-md object-cover aspect-video"
          />
        )}
        {secHeading ? (
          <h2 {...headerProps}>{titleContent}</h2>
        ) : (
          <h3 {...headerProps}>{titleContent}</h3>
        )}
      </a>
      <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
      <p>{description}</p>
    </li>
  );
}
