import React, { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Box, Stack, IconButton, Tooltip, Divider, alpha, Popover, Typography } from '@mui/material'
import {
  FormatBoldOutlined,
  FormatItalicOutlined,
  FormatListBulletedOutlined,
  FormatListNumberedOutlined,
  FormatColorTextOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@mui/icons-material'

const COLOR_PALETTE = [
  '#1F0A3B', '#3D1C6E', '#5C3594', '#7D5DAB',
  '#1F3670', '#3B5591', '#576FA2', '#768BB5',
  '#DC2626', '#EA580C', '#D97706', '#16A34A',
  '#0891B2', '#2563EB', '#7C3AED', '#DB2777',
]

const MAX_CHARS = 5000

export default function RichTextEditor({ content, onChange, placeholder }) {
  const [colorAnchor, setColorAnchor] = React.useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'What do you want to talk about?',
      }),
      TextStyle,
      Color,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
        'aria-label': 'Post content editor',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content])

  const handleFormat = useCallback((command) => {
    if (!editor) return
    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
    }
  }, [editor])

  const handleColorSelect = useCallback((color) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
    setColorAnchor(null)
  }, [editor])

  if (!editor) return null

  const charCount = editor.storage.characterCount?.characters?.() || editor.getText().length
  const charsRemaining = MAX_CHARS - charCount

  return (
    <Box sx={{ width: '100%' }}>
      <EditorContent
        editor={editor}
        sx={{
          '& .rich-text-editor': {
            minHeight: '120px',
            maxHeight: '400px',
            overflow: 'auto',
            padding: '12px 16px',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'text.primary',
            outline: 'none',
            '& p': {
              margin: '0 0 0.75em 0',
              '&:last-child': { mb: 0 },
            },
            '& ul, & ol': {
              pl: 3,
              my: 1,
            },
            '& li': {
              mb: 0.25,
            },
            '& strong': {
              fontWeight: 700,
            },
            '& em': {
              fontStyle: 'italic',
            },
          },
        }}
      />

      {/* Toolbar */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 1,
          mt: 1,
        }}
      >
        <Stack direction="row" spacing={0} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0}>
            <Tooltip title="Bold (Ctrl+B)">
              <IconButton
                size="small"
                onClick={() => handleFormat('bold')}
                aria-label="Bold"
                sx={{
                  color: editor.isActive('bold') ? 'primary.main' : 'text.secondary',
                  bgcolor: editor.isActive('bold') ? alpha('#3D1C6E', 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <FormatBoldOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic (Ctrl+I)">
              <IconButton
                size="small"
                onClick={() => handleFormat('italic')}
                aria-label="Italic"
                sx={{
                  color: editor.isActive('italic') ? 'primary.main' : 'text.secondary',
                  bgcolor: editor.isActive('italic') ? alpha('#3D1C6E', 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <FormatItalicOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Bullet List">
              <IconButton
                size="small"
                onClick={() => handleFormat('bulletList')}
                aria-label="Bullet list"
                sx={{
                  color: editor.isActive('bulletList') ? 'primary.main' : 'text.secondary',
                  bgcolor: editor.isActive('bulletList') ? alpha('#3D1C6E', 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <FormatListBulletedOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Numbered List">
              <IconButton
                size="small"
                onClick={() => handleFormat('orderedList')}
                aria-label="Numbered list"
                sx={{
                  color: editor.isActive('orderedList') ? 'primary.main' : 'text.secondary',
                  bgcolor: editor.isActive('orderedList') ? alpha('#3D1C6E', 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <FormatListNumberedOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Text Color">
              <IconButton
                size="small"
                onClick={(e) => setColorAnchor(e.currentTarget)}
                aria-label="Text color"
                sx={{
                  color: editor.isActive('textStyle') ? editor.getAttributes('textStyle').color || 'text.secondary' : 'text.secondary',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <FormatColorTextOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0}>
            <Tooltip title="Undo (Ctrl+Z)">
              <IconButton
                size="small"
                onClick={() => handleFormat('undo')}
                disabled={!editor.can().undo()}
                aria-label="Undo"
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <UndoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <IconButton
                size="small"
                onClick={() => handleFormat('redo')}
                disabled={!editor.can().redo()}
                aria-label="Redo"
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <RedoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Character count */}
        {charCount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: charsRemaining < 0 ? 'error.main' : charsRemaining < 200 ? 'warning.main' : 'text.secondary',
              }}
            >
              {charsRemaining.toLocaleString()} remaining
            </Typography>
          </Box>
        )}
      </Box>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
            Text Color
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {COLOR_PALETTE.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: color,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: editor.getAttributes('textStyle').color === color ? 'primary.main' : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': { transform: 'scale(1.15)', borderColor: 'text.secondary' },
                }}
              />
            ))}
            <Box
              onClick={() => handleColorSelect('')}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: !editor.getAttributes('textStyle').color ? 'primary.main' : 'divider',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { borderColor: 'text.secondary' },
              }}
            >
              A
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Box>
  )
}
