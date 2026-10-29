import { Mark, mergeAttributes } from '@tiptap/core'

export interface AiHighlightOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiHighlight: {
      setAiHighlight: (attrs: { commentId: string; category: string }) => ReturnType
      unsetAiHighlight: () => ReturnType
    }
  }
}

export const AiHighlight = Mark.create<AiHighlightOptions>({
  name: 'aiHighlight',

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: el => el.getAttribute('data-comment-id'),
        renderHTML: attrs => (attrs.commentId ? { 'data-comment-id': attrs.commentId } : {}),
      },
      category: {
        default: 'language',
        parseHTML: el => el.getAttribute('data-category'),
        renderHTML: attrs => (attrs.category ? { 'data-category': attrs.category, class: `ai-mark ai-mark-${attrs.category}` } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-ai-highlight]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-ai-highlight': 'true' }), 0]
  },

  addCommands() {
    return {
      setAiHighlight: attrs => ({ commands }) => commands.setMark(this.name, attrs),
      unsetAiHighlight: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },
})
