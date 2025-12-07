'use client';

// =====================================================
// EDITOR MDX CON PREVIEW
// =====================================================

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import matter from 'gray-matter';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Importar MDEditor dinámicamente para evitar SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFrontmatterChange?: (frontmatter: Record<string, unknown>) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function MDXEditor({
  value,
  onChange,
  onFrontmatterChange,
  autoSave = true,
  autoSaveDelay = 2000,
}: MDXEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [content, setContent] = useState('');

  // Parsear MDX con front-matter
  useEffect(() => {
    try {
      const parsed = matter(localValue);
      setContent(parsed.content);
      onFrontmatterChange?.(parsed.data);
    } catch (error) {
      console.error('Error parsing MDX:', error);
    }
  }, [localValue, onFrontmatterChange]);

  // Auto-save con debounce
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, autoSave, autoSaveDelay]);

  const handleChange = useCallback((val?: string) => {
    setLocalValue(val || '');
  }, []);

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="split" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none bg-muted/50">
          <TabsTrigger value="split">Editor + Preview</TabsTrigger>
          <TabsTrigger value="edit">Solo Editor</TabsTrigger>
          <TabsTrigger value="preview">Solo Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="split" className="flex-1 mt-0">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Editor */}
            <div className="h-full overflow-hidden">
              <MDEditor
                value={localValue}
                onChange={handleChange}
                height="100%"
                preview="edit"
                hideToolbar={false}
                enableScroll={true}
                visibleDragbar={false}
              />
            </div>

            {/* Preview */}
            <Card className="p-6 overflow-auto h-full">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 mt-0">
          <MDEditor
            value={localValue}
            onChange={handleChange}
            height="100%"
            preview="edit"
            hideToolbar={false}
            enableScroll={true}
            visibleDragbar={false}
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-0">
          <Card className="p-6 overflow-auto h-full">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
