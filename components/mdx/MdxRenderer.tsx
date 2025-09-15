import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

export default function MdxRenderer({ source }: { source: string }) {
  return (
    <div className="tracking-wide prose prose-invert max-w-none whitespace-normal break-words prose-headings:font-body prose-h1:font-heading prose-p:font-body prose-li:font-body prose-strong:text-white/90 prose-a:text-white/90 prose-a:font-normal prose-a:no-underline hover:prose-a:underline prose-h1:text-6xl md:prose-h1:text-7xl prose-h2:text-3xl prose-h3:text-base prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:opacity-80 prose-blockquote:italic">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm, remarkBreaks] } }}
        // Simple element overrides for styling
        components={{
          table: (p: any) => <table className="w-full border-collapse" {...p} />,
          th: (p: any) => <th className="border px-3 py-2 text-left" {...p} />,
          h1: (p: any) => <h1 className="font-body text-2xl md:text-3xl" {...p} />,
          h2: (p: any) => <h2 className="font-body text-2xl md:text-2xl" {...p} />,
          h3: (p: any) => <h3 className="font-body text-md md:text-lg" {...p} />,
          p: (p: any) => <p className="font-body text-md md:text-md" {...p} />,
          strong: (p: any) => <strong className="font-body font-bold text-white/60 text-md md:text-md" {...p} />,
          li: (p: any) => <li className="font-body text-md md:text-md" {...p} />,
          td: (p: any) => <td className="border px-3 py-2 align-top text-md md:text-md" {...p} />,
          blockquote: (p: any) => <blockquote className="border-l-4 pl-4 opacity-80 italic text-md md:text-md" {...p} />,
          a: (p: any) => <a className="font-body text-md md:text-md" {...p} />,
          img: (p: any) => <img className="font-body text-md md:text-md" {...p} />,
          quote: (p: any) => <blockquote className="border-l-4 pl-4 opacity-80 italic text-md md:text-md" {...p} />,
        }}
      />
    </div>
  )
}
