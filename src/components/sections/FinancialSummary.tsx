import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import HideableCard from '@/components/ui/HideableCard';
import StatusChip from '@/components/ui/StatusChip';
import DonutChart from '@/components/charts/DonutChart';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCardVisibility } from '@/context/CardVisibilityContext';

interface FinanceSummary {
  patrimonioLiquido: number;
  excedenteMensal: number;
  rendas: Array<{ fonte: string; valor: number; tributacao: string }>;
  despesasMensais: number;
  composicaoPatrimonial: Record<string, number>;
  ativos: Array<{ tipo: string; valor: number; classe?: string }>;
  passivos: Array<{ tipo: string; saldo_devedor: number }>;
}

interface FinancialSummaryProps {
  data: FinanceSummary;
  hideControls?: boolean;
}

// Cores para diferentes tipos de ativos
const assetColors: Record<string, string> = {
  'Imóveis': '#60A5FA',         // Azul
  'Investimentos': '#34D399',   // Verde
  'Participação em empresa': '#A78BFA', // Roxo
  'Outros': '#F59E0B',          // Amarelo
  'Veículos': '#EF4444',        // Vermelho
  'Obras de arte': '#EC4899',   // Rosa
  'Joias': '#8B5CF6',           // Índigo
  'Colecionáveis': '#F97316',   // Laranja
};

// Função para obter uma cor baseada no tipo de ativo ou gerar uma se não existir
const getColorForAssetType = (assetType: string): string => {
  if (assetType in assetColors) {
    return assetColors[assetType];
  }

  // Gera uma cor para tipos não mapeados
  const hash = assetType.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ data, hideControls }) => {
  const headerRef = useScrollAnimation();
  const summaryCardRef = useScrollAnimation();
  const patrimonioCardRef = useScrollAnimation();
  const incomeExpenseCardRef = useScrollAnimation();
  const assetsCardRef = useScrollAnimation();
  const liabilitiesCardRef = useScrollAnimation();

  const { isCardVisible, toggleCardVisibility } = useCardVisibility();

  // Calculate total income from all sources
  const totalIncome = data.rendas.reduce((sum, renda) => sum + renda.valor, 0);

  // Calculate total assets and liabilities
  const totalAssets = data.ativos.reduce((sum, asset) => sum + asset.valor, 0);
  const totalLiabilities = data.passivos.reduce((sum, liability) => sum + liability.saldo_devedor, 0);

  // Calculate total composition for normalization
  // Soma todos os valores da composição patrimonial
  const totalComposition = Object.values(data.composicaoPatrimonial).reduce((sum, value) => sum + value, 0);

  // Prepare data for the composition chart
  // Cria um array com todas as categorias presentes na composição patrimonial
  const compositionChartData = Object.entries(data.composicaoPatrimonial).map(([key, value]) => ({
    name: key,
    value: totalComposition > 0 ? Math.round((value / totalComposition) * 100) : 0,
    color: getColorForAssetType(key),
    rawValue: formatCurrency(value)
  }));

  // Get income by source for display
  const getIncomeBySource = (source: string) => {
    const renda = data.rendas.find(r => r.fonte === source);
    return renda ? renda.valor : 0;
  };

  return (
    <section className="py-16 px-4" id="summary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="mb-12 text-center animate-on-scroll"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-financial-info/10 p-3 rounded-full">
                <DollarSign size={28} className="text-financial-info" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">Resumo Financeiro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Visão geral da sua situação financeira atual, incluindo patrimônio,
              renda, gastos e composição patrimonial.
            </p>
          </div>
        </div>

        {/* Financial Overview */}
        <div
          ref={summaryCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll"
        >
          <HideableCard
            id="financial-resumo"
            isVisible={isCardVisible("financial-resumo")}
            onToggleVisibility={() => toggleCardVisibility("financial-resumo")}
            hideControls={hideControls}
          >
            <div className="grid md:grid-cols-3 gap-6 p-8">
              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Investimentos Financeiros</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(
                    data.ativos.find(a => a.tipo === "Investimentos")?.valor || 0
                  )}
                </div>
                <StatusChip
                  status="success"
                  label="Sólido"
                  icon={<TrendingUp size={14} />}
                />
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Renda Mensal</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(totalIncome)}
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {data.rendas.map((renda, index) => (
                    <StatusChip
                      key={index}
                      status={renda.tributacao === 'Isento' ? 'success' : 'info'}
                      label={`${renda.fonte}: ${formatCurrency(renda.valor)}`}
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Excedente Mensal</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(data.excedenteMensal)}
                </div>
                <StatusChip
                  status={data.excedenteMensal > 0 ? "success" : "danger"}
                  label={data.excedenteMensal > 0 ? "Positivo" : "Negativo"}
                  icon={data.excedenteMensal > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                />
              </div>
            </div>
          </HideableCard>
        </div>

        {/* Income & Expenses */}
        <div
          ref={incomeExpenseCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll delay-1"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <HideableCard
              id="renda-despesas"
              isVisible={isCardVisible("renda-despesas")}
              onToggleVisibility={() => toggleCardVisibility("renda-despesas")}
              hideControls={hideControls}
            >
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-4">Renda vs. Despesas</h3>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Renda Total</span>
                    <span className="font-medium">{formatCurrency(totalIncome)}</span>
                  </div>
                  <ProgressBar
                    value={totalIncome}
                    max={totalIncome}
                    size="lg"
                    color="success"
                  />
                </div>

                <div className="mb-2">
                  <div className="flex justify-between mb-2">
                    <span>Despesas</span>
                    <span className="font-medium">{formatCurrency(data.despesasMensais)}</span>
                  </div>
                  <ProgressBar
                    value={data.despesasMensais}
                    max={totalIncome}
                    size="lg"
                    color={data.despesasMensais > totalIncome ? "danger" : "warning"}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Excedente Mensal</span>
                    <div className="text-xl font-semibold">
                      {formatCurrency(data.excedenteMensal)}
                    </div>
                  </div>
                  <StatusChip
                    status={data.excedenteMensal > 0 ? "success" : "danger"}
                    label={`${totalIncome > 0 ? Math.round((data.excedenteMensal / totalIncome) * 100) : 0}% da renda`}
                  />
                </div>
              </div>
            </HideableCard>

            <HideableCard
              id="composicao-patrimonial"
              isVisible={isCardVisible("composicao-patrimonial")}
              onToggleVisibility={() => toggleCardVisibility("composicao-patrimonial")}
              hideControls={hideControls}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Composição Patrimonial</h3>
                <DonutChart
                  data={compositionChartData}
                  height={160}
                  innerRadius={45}
                  outerRadius={65}
                />
              </div>
            </HideableCard>
          </div>
        </div>

        {/* Assets & Liabilities */}
        <div className="grid md:grid-cols-2 gap-6">
          <div
            ref={assetsCardRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll delay-2"
          >
            <HideableCard
              id="ativos"
              isVisible={isCardVisible("ativos")}
              onToggleVisibility={() => toggleCardVisibility("ativos")}
              hideControls={hideControls}
            >
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-4">Ativos</h3>
                <div className="space-y-4">
                  {data.ativos.map((asset, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{asset.tipo}{asset.classe ? ` - ${asset.classe}` : ''}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(asset.valor)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({totalAssets > 0 ? Math.round((asset.valor / totalAssets) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-semibold">Total de Ativos</span>
                    <span className="font-semibold">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </HideableCard>
          </div>

          <div
            ref={liabilitiesCardRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll delay-3"
          >
            <HideableCard
              id="passivos"
              isVisible={isCardVisible("passivos")}
              onToggleVisibility={() => toggleCardVisibility("passivos")}
              hideControls={hideControls}
            >
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-4">Passivos</h3>
                {data.passivos && data.passivos.length > 0 ? (
                  <div className="space-y-4">
                    {data.passivos.map((liability, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{liability.tipo}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(liability.saldo_devedor > 0 ? liability.saldo_devedor : 0)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({totalLiabilities > 0 ? Math.round((liability.saldo_devedor / totalLiabilities) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <span className="font-semibold">Total de Passivos</span>
                      <span className="font-semibold">{formatCurrency(totalLiabilities > 0 ? totalLiabilities : 0)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-muted-foreground">Nenhum passivo registrado</p>
                  </div>
                )}
              </div>
            </HideableCard>
          </div>
        </div>

        {/* Patrimonio */}
        <div
          ref={patrimonioCardRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll delay-4 pt-8"
        >
          <HideableCard
            id="patrimonio-resumo"
            isVisible={isCardVisible("patrimonio-resumo")}
            onToggleVisibility={() => toggleCardVisibility("patrimonio-resumo")}
            hideControls={hideControls}
          >
            <div className="grid md:grid-cols-3 gap-6 p-8">
              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Total de Ativos</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(data.ativos.reduce((sum, asset) => sum + asset.valor, 0))}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Total de passivos</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(data.passivos.reduce((sum, liability) => sum + liability.saldo_devedor, 0))}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Patrimônio Líquido</h3>
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(data.ativos.reduce((sum, asset) => sum + asset.valor, 0) - data.passivos.reduce((sum, liability) => sum + liability.saldo_devedor, 0))}
                </div>
              </div>
            </div>
          </HideableCard>
        </div>
      </div>
    </section>
  );
};

export default FinancialSummary;