import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import HideableCard from '@/components/ui/HideableCard';
import StatusChip from '@/components/ui/StatusChip';
import DonutChart from '@/components/charts/DonutChart';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrendingUp, TrendingDown, DollarSign, ArrowRight, Target, BarChart3, PieChart, AlertTriangle } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCardVisibility } from '@/context/CardVisibilityContext';

interface Investment {
  tipo: string;
  valor: number;
  percentual: number;
  risco: 'Baixo' | 'Médio' | 'Alto';
  liquidez: 'Alta' | 'Média' | 'Baixa';
  rentabilidade: number;
}

interface InvestmentComparison {
  investimentosAtuais: Investment[];
  sugestaoAltaVista: Investment[];
  perfilInvestidor: string;
  scoreDiversificacao: number;
  scoreRisco: number;
  scoreLiquidez: number;
  recomendacoes: string[];
  impactoEsperado: {
    rentabilidadeEsperada: number;
    reducaoRisco: number;
    melhoriaLiquidez: number;
  };
}

interface InvestmentManagementProps {
  data: InvestmentComparison;
  hideControls?: boolean;
}

// Cores para diferentes tipos de investimentos
const investmentColors: Record<string, string> = {
  'Renda Fixa': '#60A5FA',           // Azul
  'Renda Variável': '#34D399',       // Verde
  'Fundos Imobiliários': '#A78BFA',  // Roxo
  'Previdência': '#F59E0B',          // Amarelo
  'Tesouro Direto': '#EF4444',       // Vermelho
  'CDB': '#EC4899',                  // Rosa
  'LCI/LCA': '#8B5CF6',              // Índigo
  'Ações': '#F97316',                // Laranja
  'Fundos de Investimento': '#10B981', // Esmeralda
  'Criptomoedas': '#6366F1',         // Índigo
  'Ouro': '#FCD34D',                 // Amarelo claro
  'Internacional': '#06B6D4',        // Ciano
};

// Função para obter uma cor baseada no tipo de investimento
const getColorForInvestmentType = (investmentType: string): string => {
  if (investmentType in investmentColors) {
    return investmentColors[investmentType];
  }

  // Gera uma cor para tipos não mapeados
  const hash = investmentType.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// Função para obter status baseado no score
const getScoreStatus = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const InvestmentManagement: React.FC<InvestmentManagementProps> = ({ data, hideControls }) => {
  const headerRef = useScrollAnimation();
  const overviewCardRef = useScrollAnimation();
  const currentInvestmentsCardRef = useScrollAnimation();
  const suggestedInvestmentsCardRef = useScrollAnimation();
  const comparisonCardRef = useScrollAnimation();
  const recommendationsCardRef = useScrollAnimation();

  const { isCardVisible, toggleCardVisibility } = useCardVisibility();

  // Preparar dados para os gráficos
  const currentChartData = data.investimentosAtuais.map(inv => ({
    name: inv.tipo,
    value: inv.percentual,
    color: getColorForInvestmentType(inv.tipo),
    rawValue: formatCurrency(inv.valor)
  }));

  const suggestedChartData = data.sugestaoAltaVista.map(inv => ({
    name: inv.tipo,
    value: inv.percentual,
    color: getColorForInvestmentType(inv.tipo),
    rawValue: formatCurrency(inv.valor)
  }));

  // Calcular totais
  const totalCurrent = data.investimentosAtuais.reduce((sum, inv) => sum + inv.valor, 0);
  const totalSuggested = data.sugestaoAltaVista.reduce((sum, inv) => sum + inv.valor, 0);

  return (
    <section className="py-16 px-4" id="investment-management">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="mb-12 text-center animate-on-scroll"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-investment-primary/10 p-3 rounded-full">
                <BarChart3 size={28} className="text-investment-primary" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">Gestão de Investimentos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Análise comparativa entre seus investimentos atuais e as recomendações 
              personalizadas da Alta Vista para otimizar seu portfólio.
            </p>
          </div>
        </div>

        {/* Overview */}
        <div
          ref={overviewCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll"
        >
          <HideableCard
            id="investment-overview"
            isVisible={isCardVisible("investment-overview")}
            onToggleVisibility={() => toggleCardVisibility("investment-overview")}
            hideControls={hideControls}
          >
            <div className="grid md:grid-cols-4 gap-6 p-8">
              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Perfil do Investidor</h3>
                <div className="text-xl font-bold mb-1">{data.perfilInvestidor}</div>
                <StatusChip
                  status="info"
                  label="Definido"
                  icon={<Target size={14} />}
                />
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Diversificação</h3>
                <div className="text-3xl font-bold mb-1">{data.scoreDiversificacao}%</div>
                <StatusChip
                  status={getScoreStatus(data.scoreDiversificacao)}
                  label={data.scoreDiversificacao >= 80 ? "Excelente" : data.scoreDiversificacao >= 60 ? "Boa" : "Melhorar"}
                  icon={data.scoreDiversificacao >= 80 ? <TrendingUp size={14} /> : <AlertTriangle size={14} />}
                />
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Gestão de Risco</h3>
                <div className="text-3xl font-bold mb-1">{data.scoreRisco}%</div>
                <StatusChip
                  status={getScoreStatus(data.scoreRisco)}
                  label={data.scoreRisco >= 80 ? "Ótima" : data.scoreRisco >= 60 ? "Adequada" : "Atenção"}
                  icon={data.scoreRisco >= 80 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                />
              </div>

              <div className="text-center">
                <h3 className="text-muted-foreground text-sm mb-1">Liquidez</h3>
                <div className="text-3xl font-bold mb-1">{data.scoreLiquidez}%</div>
                <StatusChip
                  status={getScoreStatus(data.scoreLiquidez)}
                  label={data.scoreLiquidez >= 80 ? "Alta" : data.scoreLiquidez >= 60 ? "Média" : "Baixa"}
                  icon={data.scoreLiquidez >= 80 ? <TrendingUp size={14} /> : <AlertTriangle size={14} />}
                />
              </div>
            </div>
          </HideableCard>
        </div>

        {/* Current vs Suggested Investments */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Current Investments */}
          <div
            ref={currentInvestmentsCardRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll"
          >
            <HideableCard
              id="current-investments"
              isVisible={isCardVisible("current-investments")}
              onToggleVisibility={() => toggleCardVisibility("current-investments")}
              hideControls={hideControls}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={20} className="text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Investimentos Atuais</h3>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-1">{formatCurrency(totalCurrent)}</div>
                  <p className="text-sm text-muted-foreground">Total investido</p>
                </div>
                <DonutChart 
                  data={currentChartData} 
                  height={200}
                  legendPosition="bottom"
                />
                <div className="mt-4 space-y-2">
                  {data.investimentosAtuais.map((inv, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">{inv.tipo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{inv.percentual}%</span>
                        <StatusChip
                          status={inv.risco === 'Baixo' ? 'success' : inv.risco === 'Médio' ? 'warning' : 'danger'}
                          label={inv.risco}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HideableCard>
          </div>

          {/* Suggested Investments */}
          <div
            ref={suggestedInvestmentsCardRef as React.RefObject<HTMLDivElement>}
            className="animate-on-scroll delay-1"
          >
            <HideableCard
              id="suggested-investments"
              isVisible={isCardVisible("suggested-investments")}
              onToggleVisibility={() => toggleCardVisibility("suggested-investments")}
              hideControls={hideControls}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={20} className="text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Sugestão Alta Vista</h3>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-1">{formatCurrency(totalSuggested)}</div>
                  <p className="text-sm text-muted-foreground">Alocação recomendada</p>
                </div>
                <DonutChart 
                  data={suggestedChartData} 
                  height={200}
                  legendPosition="bottom"
                />
                <div className="mt-4 space-y-2">
                  {data.sugestaoAltaVista.map((inv, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-primary/10 rounded">
                      <span className="text-sm font-medium">{inv.tipo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{inv.percentual}%</span>
                        <StatusChip
                          status={inv.risco === 'Baixo' ? 'success' : inv.risco === 'Médio' ? 'warning' : 'danger'}
                          label={inv.risco}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HideableCard>
          </div>
        </div>

        {/* Impact Analysis */}
        <div
          ref={comparisonCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll delay-2"
        >
          <HideableCard
            id="investment-impact"
            isVisible={isCardVisible("investment-impact")}
            onToggleVisibility={() => toggleCardVisibility("investment-impact")}
            hideControls={hideControls}
          >
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-6">Impacto Esperado da Reestruturação</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-success/10 p-4 rounded-lg mb-3">
                    <TrendingUp size={24} className="text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold text-success">
                      +{data.impactoEsperado.rentabilidadeEsperada}%
                    </div>
                  </div>
                  <h4 className="font-medium mb-1">Rentabilidade Esperada</h4>
                  <p className="text-sm text-muted-foreground">
                    Melhoria na rentabilidade anual do portfólio
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-warning/10 p-4 rounded-lg mb-3">
                    <AlertTriangle size={24} className="text-warning mx-auto mb-2" />
                    <div className="text-2xl font-bold text-warning">
                      -{data.impactoEsperado.reducaoRisco}%
                    </div>
                  </div>
                  <h4 className="font-medium mb-1">Redução de Risco</h4>
                  <p className="text-sm text-muted-foreground">
                    Diminuição da volatilidade do portfólio
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-info/10 p-4 rounded-lg mb-3">
                    <DollarSign size={24} className="text-info mx-auto mb-2" />
                    <div className="text-2xl font-bold text-info">
                      +{data.impactoEsperado.melhoriaLiquidez}%
                    </div>
                  </div>
                  <h4 className="font-medium mb-1">Melhoria na Liquidez</h4>
                  <p className="text-sm text-muted-foreground">
                    Aumento da facilidade de resgate
                  </p>
                </div>
              </div>
            </div>
          </HideableCard>
        </div>

        {/* Recommendations */}
        <div
          ref={recommendationsCardRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll delay-3"
        >
          <HideableCard
            id="investment-recommendations"
            isVisible={isCardVisible("investment-recommendations")}
            onToggleVisibility={() => toggleCardVisibility("investment-recommendations")}
            hideControls={hideControls}
          >
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-6">Recomendações Específicas</h3>
              <div className="space-y-4">
                {data.recomendacoes.map((recomendacao, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <ArrowRight size={16} className="text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed">{recomendacao}</p>
                  </div>
                ))}
              </div>
            </div>
          </HideableCard>
        </div>
      </div>
    </section>
  );
};

export default InvestmentManagement; 