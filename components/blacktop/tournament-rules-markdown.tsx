'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TournamentRulesMarkdownProps {
  content: string;
}

export function TournamentRulesMarkdown({ content }: TournamentRulesMarkdownProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-red-600 mb-3 mt-5 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-red-500 mb-2 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-white/80 mb-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-white/80" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-white/80" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-white/80" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-red-500" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-white/90" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-red-400 hover:text-red-300 underline" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-red-500 pl-4 italic text-white/70 my-4" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-400 text-sm" {...props} />
            ) : (
              <code className="block bg-white/10 p-3 rounded text-sm text-white/90 overflow-x-auto" {...props} />
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
