# Feature: Markdown Editor

## 1. Overview

The markdown editor provides a rich text editing experience for trip descriptions. It includes a toolbar with formatting buttons and supports standard markdown syntax. The system also includes markdown-to-HTML conversion for display and markdown cleaning for previews.

**Purpose:**
- Write trip descriptions in markdown format
- Format text with bold, italic, code, links, and lists
- Preview markdown in rendered HTML
- Clean markdown syntax for card previews
- Provide formatting toolbar for easy editing

**Key Capabilities:**
- **Formatting Toolbar**: Quick access to common markdown syntax
- **Live Preview**: See formatted text in trip detail view
- **Markdown Cleaning**: Remove markdown syntax for previews
- **HTML Conversion**: Convert markdown to HTML for display
- **Text Selection**: Wrap selected text with markdown syntax

---

## 2. Architecture / Flow

### Markdown Editing Flow
```
User types in textarea → Text stored as markdown
  → User clicks formatting button (e.g., Bold)
  → wrapSelection() function wraps selected text
  → Text updated in textarea
  → User submits form
  → Markdown stored in database
```

### Markdown Display Flow
```
Trip description loaded → Markdown string
  → markdownToHtml() converts to HTML
  → HTML rendered in trip detail view
  → Formatted text displayed
```

### Markdown Preview Flow
```
Trip card displayed → Description markdown
  → cleanMarkdown() removes syntax
  → Plain text displayed in preview
  → Truncated to 200 characters
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Custom Markdown Parser** | Convert markdown to HTML | - Lightweight<br>- No dependencies<br>- Customizable | Regex-based parsing. Replaces markdown syntax with HTML tags. Handles bold, italic, code, links, line breaks |
| **Textarea Selection API** | Text selection and manipulation | - Native browser API<br>- No dependencies<br>- Direct control | Uses `selectionStart` and `selectionEnd` to get selected text. Wraps with markdown syntax. Updates textarea value |

---

## 4. Core Logic

### 4.1 Formatting Functions

**Location:** `src/components/TripForm.vue`

```typescript
const wrapSelection = (before: string, after?: string) => {
  const el = descriptionTextareaRef.value
  if (!el) return

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const hasSelection = start !== end
  const selected = hasSelection ? value.slice(start, end) : 'ข้อความ'
  const suffix = after ?? before

  const next = value.slice(0, start) + before + selected + suffix + value.slice(end)
  description.value = next

  nextTick(() => {
    const from = start + before.length
    const to = from + selected.length
    el.focus()
    el.setSelectionRange(from, to)
  })
}

const formatBold = () => wrapSelection('**')
const formatItalic = () => wrapSelection('*')
const formatCode = () => wrapSelection('`')
```

### 4.2 Link Formatting

```typescript
const formatLink = () => {
  const el = descriptionTextareaRef.value
  if (!el) return

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const label = value.slice(start, end) || 'ลิงก์'
  const url = 'https://example.com'
  const inserted = `[${label}](${url})`

  description.value = value.slice(0, start) + inserted + value.slice(end)

  nextTick(() => {
    const pos = start + inserted.length
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}
```

### 4.3 Bullet List Formatting

```typescript
const formatBullet = () => {
  const el = descriptionTextareaRef.value
  if (!el) return

  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const value = description.value
  const selection = value.slice(start, end) || 'รายการ'

  const lines = selection.split('\n').map((line) => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('- ')) return trimmed
    return `- ${trimmed}`
  })

  const inserted = lines.join('\n')
  description.value = value.slice(0, start) + inserted + value.slice(end)

  nextTick(() => {
    const from = start
    const to = from + inserted.length
    el.focus()
    el.setSelectionRange(from, to)
  })
}
```

### 4.4 Markdown to HTML Conversion

**Location:** `src/utils/markdown.ts`

```typescript
export const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const markdownToHtml = (markdown: string): string => {
  const normalized = markdown.replace(/\\n/g, '\n')
  const safe = escapeHtml(normalized)

  let html = safe

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // Code: `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  
  // Line breaks
  html = html.replace(/\n/g, '<br />')

  return html
}
```

### 4.5 Markdown Cleaning (for Previews)

**Location:** `src/components/TripCard.vue`

```typescript
const cleanMarkdown = (text: string): string => {
  let cleaned = text
  // Replace \n with space
  cleaned = cleaned.replace(/\\n/g, ' ')
  // Remove markdown syntax
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1')  // Bold **text**
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1')      // Italic *text*
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1')       // Code `text`
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links [text](url)
  cleaned = cleaned.replace(/#+\s*/g, '')             // Headers # text
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '')        // List items - item
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '')       // Numbered list 1. item
  cleaned = cleaned.replace(/>\s*/g, '')             // Blockquote > text
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1')      // Strikethrough ~~text~~
  // Replace multiple spaces/newlines with single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}
```

---

## 5. Data Model / State Structure

### Component State

```typescript
const description = ref('')  // Markdown text
const descriptionTextareaRef = ref<HTMLTextAreaElement | null>(null)  // Textarea ref
```

### Supported Markdown Syntax

```markdown
**Bold text**
*Italic text*
`Code snippet`
[Link text](https://example.com)
- Bullet point 1
- Bullet point 2
1. Numbered item 1
2. Numbered item 2
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **No Selection**: Uses placeholder text if nothing selected
2. **Empty Textarea**: Handles empty description gracefully
3. **Special Characters**: Escapes HTML to prevent XSS
4. **Line Breaks**: Converts `\n` to `<br />` in HTML
5. **Nested Formatting**: Handles nested markdown (e.g., **bold *italic* text**)
6. **Invalid Links**: Only matches valid HTTP/HTTPS URLs

### Current Limitations

1. **No Live Preview**: No side-by-side markdown/HTML preview
2. **No Syntax Highlighting**: No code syntax highlighting
3. **No Table Support**: Cannot create markdown tables
4. **No Image Support**: Cannot embed images in markdown
5. **No Heading Support**: No H1-H6 formatting buttons
6. **No Blockquote Support**: No blockquote formatting button
7. **No Strikethrough Support**: No strikethrough formatting button
8. **No Undo/Redo**: No undo/redo functionality
9. **No Word Count**: No character/word count display
10. **No Auto-save**: No draft auto-save

### TODO / Future Enhancements

- [ ] **Live Preview**: Side-by-side markdown/HTML preview
- [ ] **Syntax Highlighting**: Code block syntax highlighting
- [ ] **Table Support**: Add table creation/editing
- [ ] **Image Embedding**: Embed images in markdown
- [ ] **Heading Buttons**: Add H1-H6 formatting buttons
- [ ] **Blockquote Button**: Add blockquote formatting
- [ ] **Strikethrough Button**: Add strikethrough formatting
- [ ] **Undo/Redo**: Implement undo/redo functionality
- [ ] **Word Count**: Display character/word count
- [ ] **Auto-save**: Auto-save drafts
- [ ] **Markdown Cheat Sheet**: Show markdown syntax reference
- [ ] **Keyboard Shortcuts**: Add keyboard shortcuts for formatting
- [ ] **Markdown Import**: Import from external markdown files
- [ ] **Markdown Export**: Export as markdown file

### Known Issues

- **Selection Range**: May lose selection on rapid clicks
- **Cursor Position**: Cursor may jump after formatting
- **Large Text**: Performance may degrade with very long text
- **Nested Lists**: Complex nested lists may not render correctly
- **Link Validation**: No validation of link URLs

