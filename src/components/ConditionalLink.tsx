interface ConditionalLinkProps {
  href: string;
  children: React.ReactNode;
  draft?: boolean;
}

export default function ConditionalLink({ href, children, draft = false }: ConditionalLinkProps) {
  if (draft) {
    return <span style={{ color: "rgb(120, 120, 120)" }}>{children} (coming soon)</span>;
  }

  return (
    <a href={href} style={{ color: "rgb(140, 169, 255)", textDecoration: "underline" }}>
      {children}
    </a>
  );
}
