import { useCallback, useMemo, useState } from 'react';
import { BOTAO_PADRAO, SELECAO } from '../classes';
import ModalInteresse from '../components/ModalInteresse';
import { AREAS, NIVEIS, VAGAS, type Vaga } from '../dados/vagas';
import { IconeChevronBaixo, IconeLocal } from '../icones';

function Filtro({ id, rotulo, valor, opcoes, onChange }: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
        {rotulo}
      </label>
      <div className="relative w-full sm:w-56">
        <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={SELECAO}>
          {opcoes.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <IconeChevronBaixo className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
      </div>
    </div>
  );
}

export default function Vagas() {
  const [area, setArea] = useState('Todas');
  const [nivel, setNivel] = useState('Todos');
  const [vagaAberta, setVagaAberta] = useState<Vaga | null>(null);
  const fechar = useCallback(() => setVagaAberta(null), []);

  const filtradas = useMemo(
    () => VAGAS.filter((v) => (area === 'Todas' || v.area === area) && (nivel === 'Todos' || v.nivel === nivel)),
    [area, nivel],
  );

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">Vagas</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">Confira nossas vagas em andamento.</h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/75">
            Filtre por área e nível hierárquico. Para confidencialidade, detalhes adicionais são compartilhados após
            contato.
          </p>
        </div>
      </section>
      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Filtro id="filtro-area" rotulo="Área" valor={area} opcoes={AREAS} onChange={setArea} />
            <Filtro id="filtro-nivel" rotulo="Nível" valor={nivel} opcoes={NIVEIS} onChange={setNivel} />
            <p className="text-sm text-muted-foreground sm:ml-auto">
              {filtradas.length} {filtradas.length === 1 ? 'vaga' : 'vagas'}
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {filtradas.map((v) => (
              <div key={v.id} className="h-full rounded-xl border border-border bg-surface text-card-foreground shadow">
                <div className="flex h-full flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {v.area} · {v.nivel}
                  </p>
                  <h2 className="mt-3 font-display text-2xl text-primary">{v.titulo}</h2>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <IconeLocal className="h-3.5 w-3.5" /> {v.local}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/75">{v.resumo}</p>
                  <div className="mt-6">
                    <button type="button" onClick={() => setVagaAberta(v)} className={BOTAO_PADRAO}>
                      Tenho interesse
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtradas.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma vaga encontrada para os filtros atuais.</p>
            )}
          </div>
        </div>
      </section>
      <ModalInteresse vaga={vagaAberta} onFechar={fechar} />
    </>
  );
}
