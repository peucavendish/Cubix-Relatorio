import React from 'react';
import { CircleDollarSign, Shield, Briefcase, Umbrella, Plane, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HideableCard from '@/components/ui/HideableCard';
import { useCardVisibility } from '@/context/CardVisibilityContext';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Separator } from '@/components/ui/separator';

interface ProtectionPlanningProps {
  data: any;
  hideControls?: boolean;
}

const ProtectionPlanning: React.FC<ProtectionPlanningProps> = ({ data, hideControls }) => {
  const protectionData = data?.protecao;
  const { isCardVisible, toggleCardVisibility } = useCardVisibility();

  if (!protectionData) {
    return <div>Dados de proteção patrimonial não disponíveis</div>;
  }

  return (
    <section className="py-16 px-4" id="protection">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Shield size={28} className="text-accent" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">{protectionData.titulo}</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {protectionData.resumo}
            </p>
          </div>
        </div>

        {/* Insurance Needs Analysis */}
        <HideableCard
          id="analise-necessidades"
          isVisible={isCardVisible("analise-necessidades")}
          onToggleVisibility={() => toggleCardVisibility("analise-necessidades")}
          hideControls={hideControls}
          className="mb-10"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <CardTitle>Análise de Necessidades</CardTitle>
                <CardDescription>Avaliação de riscos e necessidades de proteção</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3">Perfil de Risco</h4>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Renda Anual</span>
                    <span className="font-medium">{formatCurrency(protectionData.analiseNecessidades.rendaAnual)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Patrimônio Total</span>
                    <span className="font-medium">{formatCurrency(protectionData.analiseNecessidades.patrimonioTotal)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Participação Empresarial</span>
                    <span className="font-medium">{protectionData.analiseNecessidades.atividadeEmpresarial}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-3">Dependentes e Considerações</h4>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dependentes</span>
                    <span className="font-medium">{protectionData?.analiseNecessidades?.numeroDependentes} ({protectionData?.analiseNecessidades?.tiposDependentes?.join(", ") ?? ""})</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Anos de Suporte</span>
                    <span className="font-medium">{protectionData.analiseNecessidades.anosSuporteDependentes} anos</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Viagens Internacionais</span>
                    <span className="font-medium">{protectionData.analiseNecessidades.viagensInternacionais}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </HideableCard>

        {/* Tabela Visual de Riscos */}
        <HideableCard
          id="tabela-seguros"
          isVisible={isCardVisible("tabela-seguros")}
          onToggleVisibility={() => toggleCardVisibility("tabela-seguros")}
          hideControls={hideControls}
          className="mb-10"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={28} className="text-accent" />
                  Gestão de Riscos
                </CardTitle>
                <CardDescription>Tabela visual de riscos sugeridos e soluções</CardDescription>
              </div>
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded text-xs font-semibold bg-muted text-accent-foreground border border-accent">ANUAL</button>
                <button className="px-3 py-1 rounded text-xs font-semibold bg-muted text-muted-foreground border border-muted-foreground cursor-not-allowed opacity-60" disabled>MENSAL</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Riscos em Morte */}
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-base">Riscos em Morte</span>
                  <span className="text-muted-foreground text-xs">▼</span>
                </div>
                <table className="min-w-full text-sm border-separate border-spacing-y-1">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">&nbsp;</th>
                      <th className="px-2 py-2 text-right font-semibold">Capital Sugerido</th>
                      <th className="px-2 py-2 text-right font-semibold">Apólice Atual</th>
                      <th className="px-2 py-2 text-right font-semibold">Total de Capital Sugerido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Custos com Inventário</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Reestabelecimento de Padrão de Vida</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Despesas com Outros Dependentes</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Despesas até a Formação dos Filhos</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Morte Acidental</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/50 rounded">
                      <td className="px-2 py-2">Assistência Funeral</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4">
                  <span className="font-semibold text-sm mb-1 block">Soluções Sugeridas</span>
                  <table className="min-w-full text-sm border-separate border-spacing-y-1">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">&nbsp;</th>
                        <th className="px-2 py-2 text-right font-semibold">MAG</th>
                        <th className="px-2 py-2 text-right font-semibold">Prudential</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded font-bold"><td className="px-2 py-2">Total</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Riscos em Vida */}
              <div className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-base">Riscos em Vida</span>
                  <span className="text-muted-foreground text-xs">▼</span>
                </div>
                <table className="min-w-full text-sm border-separate border-spacing-y-1">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold">&nbsp;</th>
                      <th className="px-2 py-2 text-right font-semibold">Capital Sugerido</th>
                      <th className="px-2 py-2 text-right font-semibold">Apólice Atual</th>
                      <th className="px-2 py-2 text-right font-semibold">Total de Capital Sugerido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">Necessidades por Invalidez</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                    <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">Renda Diária por Incapacidade</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                    <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">Doenças Graves</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                  </tbody>
                </table>
                <div className="mt-4">
                  <span className="font-semibold text-sm mb-1 block">Soluções Sugeridas</span>
                  <table className="min-w-full text-sm border-separate border-spacing-y-1">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold">&nbsp;</th>
                        <th className="px-2 py-2 text-right font-semibold">MAG</th>
                        <th className="px-2 py-2 text-right font-semibold">Prudential</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded"><td className="px-2 py-2">&nbsp;</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                      <tr className="bg-white hover:bg-muted/50 rounded font-bold"><td className="px-2 py-2">Total</td><td className="px-2 py-2 text-right">0,00</td><td className="px-2 py-2 text-right">0,00</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </HideableCard>

        {/* Legal Protection */}
        {/* Removido conforme solicitado */}

        {/* Additional Recommendations */}
        <HideableCard
          id="recomendacoes-adicionais"
          isVisible={isCardVisible("recomendacoes-adicionais")}
          onToggleVisibility={() => toggleCardVisibility("recomendacoes-adicionais")}
          className={cn("bg-accent/5 border-accent/20")}
        >
          <CardHeader>
            <CardTitle>{protectionData?.recomendacoesAdicionais?.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {Array.isArray(protectionData?.recomendacoesAdicionais?.itens) && protectionData.recomendacoesAdicionais.itens.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </HideableCard>
      </div>
    </section>
  );
};

export default ProtectionPlanning;
