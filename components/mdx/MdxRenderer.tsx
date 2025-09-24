import { MDXRemote } from "next-mdx-remote/rsc"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import Image from "next/image"

export default function MdxRenderer({ source }: { source: string }) {
  return (
    <div className="tracking-wide prose prose-invert max-w-none whitespace-normal break-words prose-headings:font-body prose-h1:font-heading prose-p:font-body prose-li:font-body prose-strong:text-white/90 prose-a:text-white/90 prose-a:font-normal prose-a:no-underline hover:prose-a:underline prose-h1:text-6xl md:prose-h1:text-7xl prose-h2:text-3xl prose-h3:text-base prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:opacity-80 prose-blockquote:italic">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm, remarkBreaks] } }}
        // Simple element overrides for styling
        components={{
          table: (p: { className?: string }) => <table className="w-full border-collapse" {...p} />,
          th: (p: { className?: string }) => <th className="border px-3 py-2 text-left" {...p} />,
          h1: (p: { className?: string }) => <h1 className="font-body text-2xl md:text-3xl" {...p} />,
          h2: (p: { className?: string }) => <h2 className="font-body text-2xl md:text-2xl" {...p} />,
          h3: (p: { className?: string }) => <h3 className="font-body text-md md:text-lg" {...p} />,
          p: (p: { className?: string }) => <p className="font-body text-md md:text-md" {...p} />,
          strong: (p: { className?: string }) => <strong className="font-body font-bold text-md md:text-md" {...p} />,
          li: (p: { className?: string }) => <li className="font-body text-md md:text-md" {...p} />,
          td: (p: { className?: string }) => <td className="border px-3 py-2 align-top text-md md:text-md" {...p} />,
          blockquote: (p: { className?: string }) => <blockquote className="border-l-4 pl-4 opacity-80 italic text-md md:text-md" {...p} />,
          a: (p: { className?: string }) => <a className="font-body text-md md:text-md" {...p} />,
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
            const { src, alt, width, height, className, ...rest } = props
            if (typeof src === 'string') {
              const w = typeof width === 'number' ? width : Number(width) || 800
              const h = typeof height === 'number' ? height : Number(height) || 450
              return <Image src={src} alt={alt ?? ''} width={w} height={h} className={className} />
            }
            // Fallback in case src is missing or not a string
            return <p {...rest} className={className} />
          },
          quote: (p: { className?: string }) => <blockquote className="border-l-4 pl-4 opacity-80 italic text-md md:text-md" {...p} />,
        }}
      />
    </div>
  )
}
