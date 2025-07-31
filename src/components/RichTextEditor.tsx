import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Saisissez votre texte ici...",
  label,
  id
}) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 
    'align', 'list', 'bullet'
  ];

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="border border-input rounded-md overflow-hidden">
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          theme="snow"
          style={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))'
          }}
        />
      </div>
      <style>{`
        .ql-toolbar {
          border-bottom: 1px solid hsl(var(--border)) !important;
          background: hsl(var(--muted)) !important;
        }
        
        .ql-container {
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        
        .ql-editor {
          min-height: 120px;
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground)) !important;
          font-style: normal !important;
        }
        
        .ql-snow .ql-tooltip {
          background: hsl(var(--popover)) !important;
          border: 1px solid hsl(var(--border)) !important;
          color: hsl(var(--popover-foreground)) !important;
        }
        
        .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground)) !important;
        }
        
        .ql-snow .ql-fill {
          fill: hsl(var(--foreground)) !important;
        }
        
        .ql-snow .ql-picker-label {
          color: hsl(var(--foreground)) !important;
        }
        
        .ql-snow .ql-picker-options {
          background: hsl(var(--popover)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .ql-snow .ql-picker-item:hover {
          background: hsl(var(--muted)) !important;
        }
        
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover,
        .ql-snow.ql-toolbar button.ql-active,
        .ql-snow .ql-toolbar button.ql-active {
          background: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;