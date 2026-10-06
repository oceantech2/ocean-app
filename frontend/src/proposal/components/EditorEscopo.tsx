import { ReactNode, useEffect } from 'react';
import { Editor, EditorContent, Extension, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { contarCaracteres, LIMITE_ESCOPO } from '../modelos/escopo';

// O modelo só suporta dois níveis de lista (lista com marcadores dentro de um item numerado)
const MAX_NIVEL = 2;

function nivelLista(editor: Editor): number {
  const { $from } = editor.state.selection;
  let nivel = 0;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'listItem') nivel++;
  }
  return nivel;
}

const LimiteNivel = Extension.create({
  name: 'limiteNivelLista',
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const nivel = nivelLista(this.editor);
        if (nivel === 0) return false;
        if (nivel >= MAX_NIVEL) return true;
        return this.editor.commands.sinkListItem('listItem');
      },
      'Shift-Tab': () => (nivelLista(this.editor) ? this.editor.commands.liftListItem('listItem') : false),
    };
  },
});

function Botao({
  titulo,
  ativo,
  desabilitado,
  onClick,
  children,
}: {
  titulo: string;
  ativo?: boolean;
  desabilitado?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      aria-pressed={ativo}
      disabled={desabilitado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
        ativo ? 'bg-ocean-700 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

const icone = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

interface Props {
  valor: string;
  onChange: (html: string) => void;
  erro?: string;
  rotulo: string;
}

const atributosEditor = (rotulo: string) => ({ 'aria-label': rotulo, 'aria-multiline': 'true', role: 'textbox' });

export default function EditorEscopo({ valor, onChange, erro, rotulo }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        italic: false,
        strike: false,
        underline: false,
        link: false,
        dropcursor: false,
        gapcursor: false,
        trailingNode: false,
      }),
      LimiteNivel,
    ],
    content: valor,
    editorProps: { attributes: atributosEditor(rotulo) },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Na Nova proposta o modelo (e com ele o rótulo) pode mudar com o editor já montado
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: atributosEditor(rotulo) } });
  }, [editor, rotulo]);

  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            negrito: e.isActive('bold'),
            numerada: e.isActive('orderedList'),
            marcadores: e.isActive('bulletList'),
            podeRecuar: nivelLista(e) === 1 && e.can().sinkListItem('listItem'),
            podeDesrecuar: nivelLista(e) > 0,
          }
        : null,
  });

  const caracteres = contarCaracteres(valor);
  const excedeu = caracteres > LIMITE_ESCOPO;

  return (
    <div>
      <div
        className={`border rounded-lg bg-white focus-within:ring-2 focus-within:ring-ocean-600 ${
          erro ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <div className="flex flex-wrap gap-1 border-b border-gray-200 px-2 py-1">
          <Botao titulo="Negrito (Ctrl+B)" ativo={estado?.negrito} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <span className="font-bold">B</span>
          </Botao>
          <Botao
            titulo="Lista numerada"
            ativo={estado?.numerada}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            {icone('M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1')}
          </Botao>
          <Botao
            titulo="Lista com marcadores"
            ativo={estado?.marcadores}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            {icone('M9 6h12M9 12h12M9 18h12M4.5 6h.01M4.5 12h.01M4.5 18h.01')}
          </Botao>
          <Botao
            titulo="Aumentar recuo (Tab)"
            desabilitado={!estado?.podeRecuar}
            onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}
          >
            {icone('M3 6h18M11 12h10M11 18h10M3 10l4 3-4 3')}
          </Botao>
          <Botao
            titulo="Diminuir recuo (Shift+Tab)"
            desabilitado={!estado?.podeDesrecuar}
            onClick={() => editor?.chain().focus().liftListItem('listItem').run()}
          >
            {icone('M3 6h18M11 12h10M11 18h10M7 10l-4 3 4 3')}
          </Botao>
        </div>
        <EditorContent
          editor={editor}
          className="text-gray-900 [&_.ProseMirror]:min-h-[9rem] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:my-1 [&_.ProseMirror_ul]:my-1 [&_.ProseMirror_strong]:font-semibold"
        />
      </div>
      <p className={`text-xs mt-1 text-right ${excedeu ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
        {caracteres.toLocaleString('pt-BR')} / {LIMITE_ESCOPO.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
