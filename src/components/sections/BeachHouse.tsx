import React, { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { formatCurrency } from '@/utils/formatCurrency';
import StatusChip from '@/components/ui/StatusChip';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import HideableCard from '@/components/ui/HideableCard';
import { useCardVisibility } from '@/context/CardVisibilityContext';
import { Home, Umbrella, Calculator, Check, X, PiggyBank, ArrowRight, TrendingDown, Calendar } from 'lucide-react';
import RealEstateSimulator from '../charts/RealEstateSimulator';

interface Strategy {
  estrategia: string;
  parcelaMensal: number;
  totalPago: number;
  tempoContemplacao?: string;
}

interface BeachHouseProps {
  data?: {
    imovelDesejado?: {
      objetivo?: {
        tipo?: string;
        localizacao?: string | null;
        valorImovel?: number;
        prazoDesejado?: string;
      };
      vantagens?: string[];
      desvantagens?: string[];
      impactoFinanceiro?: {
        parcela?: number;
        observacao?: string;
        excedenteMensalApos?: number;
        excedenteMensalAtual?: number;
      };
      estrategiaRecomendada?: string;
      comparativoEstrategias?: Array<{
        totalPago?: number;
        estrategia?: string;
        parcelaMensal?: number;
        tempoContemplacao?: string;
      }>;
    };
  };
  hideControls?: boolean;
}

const BeachHouse: React.FC<BeachHouseProps> = ({ data, hideControls }) => {
  const headerRef = useScrollAnimation();
  const objectiveCardRef = useScrollAnimation();
  const strategiesCardRef = useScrollAnimation();
  const impactCardRef = useScrollAnimation();
  const { isCardVisible, toggleCardVisibility } = useCardVisibility();
  const [impactoTipo, setImpactoTipo] = useState<'financiamento' | 'consorcio'>('financiamento');

  const imovelDesejado = data?.imovelDesejado;

  // Find details of recommended strategy
  const recommendedStrategy = imovelDesejado?.comparativoEstrategias?.find(
    s => s.estrategia === imovelDesejado.estrategiaRecomendada
  );

  // Obter dados de impacto para cada tipo
  const financiamento = imovelDesejado?.comparativoEstrategias?.find(e => e.estrategia === 'Financiamento Bancário');
  const consorcio = imovelDesejado?.comparativoEstrategias?.find(e => e.estrategia === 'Consórcio');

  const impacto = impactoTipo === 'financiamento' ? financiamento : consorcio;
  const parcela = impacto?.parcelaMensal || 0;
  const excedenteMensalAtual = imovelDesejado?.impactoFinanceiro?.excedenteMensalAtual || 0;
  const excedenteMensalApos = excedenteMensalAtual - parcela;

  // Format value based on size
  const formatImovelValue = (value: number) => {
    if (value >= 1000000) {
      // For values 1M and above, use a more compact format
      return formatCurrency(value).replace(/\s+/g, ' ');
    }
    return formatCurrency(value);
  };

  // Calculate appropriate text size class based on value length
  const getValueTextClass = (value: number) => {
    const valueStr = formatImovelValue(value);

    if (valueStr.length > 16) {
      return "text-xl"; // Smallest text for very large values
    } else if (valueStr.length > 12) {
      return "text-2xl"; // Medium text for large values
    }

    return "text-3xl"; // Default size for regular values
  };

  return (
    <section className="py-16 px-4" id="beach-house">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="mb-12 text-center animate-on-scroll"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Home size={28} className="text-accent" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">Oportunidades em imóveis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estratégias para aquisição de um imóvel desejado, otimizando o investimento e preservando o planejamento financeiro.
            </p>
          </div>
        </div>

        {/* Objective Card */}
        <div
          ref={objectiveCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll delay-1"
        >
          <HideableCard
            id="objetivo-casa-praia"
            isVisible={isCardVisible("objetivo-casa-praia")}
            onToggleVisibility={() => toggleCardVisibility("objetivo-casa-praia")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center">
                <Home size={22} className="mr-2 text-accent" />
                Objetivo: Aquisição de {imovelDesejado?.objetivo?.tipo || "Imóvel"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64 bg-accent/5 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-accent/20 animate-spin-slow"></div>
                    <div className="text-center px-4">
                      <div className={`${getValueTextClass(imovelDesejado?.objetivo?.valorImovel || 0)} font-bold text-accent break-words`}>
                        {formatImovelValue(imovelDesejado?.objetivo?.valorImovel || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Valor do imóvel
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="text-xl font-medium mb-4">Detalhes do Objetivo</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Calendar className="mr-3 text-accent mt-1" size={18} />
                      <div>
                        <div className="font-medium">Prazo Desejado</div>
                        <div className="text-muted-foreground">
                          {imovelDesejado?.objetivo?.prazoDesejado}
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <PiggyBank className="mr-3 text-accent mt-1" size={18} />
                      <div>
                        <div className="font-medium">Estratégia Recomendada</div>
                        <div className="text-muted-foreground">
                          {imovelDesejado?.estrategiaRecomendada}
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Calculator className="mr-3 text-accent mt-1" size={18} />
                      <div>
                        <div className="font-medium">Valor Mensal</div>
                        <div className="text-muted-foreground">
                          {recommendedStrategy ? formatCurrency(recommendedStrategy.parcelaMensal || 0) : '-'} / mês
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </HideableCard>
        </div>

        {/* Strategies Comparison */}
        <div
          ref={strategiesCardRef as React.RefObject<HTMLDivElement>}
          className="mb-10 animate-on-scroll delay-2"
        >
          <HideableCard
            id="estrategias-casa-praia"
            isVisible={isCardVisible("estrategias-casa-praia")}
            onToggleVisibility={() => toggleCardVisibility("estrategias-casa-praia")}
            hideControls={hideControls}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center">
                <Calculator size={22} className="mr-2 text-accent" />
                Comparativo de Estratégias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Estratégia</th>
                      <th className="text-right py-3 px-4">Parcela Mensal</th>
                      <th className="text-right py-3 px-4">Total Pago</th>
                      <th className="text-right py-3 px-4">Tempo Contemplação</th>
                      <th className="text-right py-3 px-4">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imovelDesejado?.comparativoEstrategias?.map((strategy, index) => {
                      const isRecommended = strategy.estrategia === imovelDesejado.estrategiaRecomendada;
                      const difference = (strategy.totalPago || 0) - (imovelDesejado.objetivo?.valorImovel || 0);
                      const percentDifference = ((difference / (imovelDesejado.objetivo?.valorImovel || 1)) * 100).toFixed(1);

                      return (
                        <tr
                          key={index}
                          className={`
                            border-b border-border last:border-0 
                            ${isRecommended ? 'bg-accent/5' : ''}
                          `}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {isRecommended && (
                                <div className="bg-accent/10 p-1 rounded-full mr-2">
                                  <Check size={16} className="text-accent" />
                                </div>
                              )}
                              <span className={isRecommended ? 'font-medium' : ''}>
                                {strategy.estrategia}
                              </span>
                              {isRecommended && (
                                <span className="ml-2 text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                                  Recomendado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {formatCurrency(strategy.parcelaMensal || 0)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {formatCurrency(strategy.totalPago || 0)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {strategy.tempoContemplacao}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end">
                              {difference > 0 ? (
                                <TrendingDown size={16} className="text-financial-danger mr-1" />
                              ) : (
                                <Check size={16} className="text-financial-success mr-1" />
                              )}
                              <span className={difference > 0 ? 'text-financial-danger' : 'text-financial-success'}>
                                {difference > 0 ? `+${formatCurrency(difference)}` : 'Ideal'}
                                {difference > 0 ? ` (+${percentDifference}%)` : ''}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <Check size={18} className="text-financial-success mr-2" />
                    Vantagens do {imovelDesejado?.estrategiaRecomendada}
                  </h3>
                  <ul className="space-y-2">
                    {imovelDesejado?.vantagens?.map((vantagem, i) => (
                      <li key={i} className="flex items-center">
                        <Check size={16} className="text-financial-success mr-2 shrink-0" />
                        <span>{vantagem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <X size={18} className="text-financial-danger mr-2" />
                    Desvantagens do {imovelDesejado?.estrategiaRecomendada}
                  </h3>
                  <ul className="space-y-2">
                    {imovelDesejado?.desvantagens?.map((desvantagem, i) => (
                      <li key={i} className="flex items-center">
                        <X size={16} className="text-financial-danger mr-2 shrink-0" />
                        <span>{desvantagem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </HideableCard>
        </div>

        {/* Simulador de Financiamento Imobiliário e Consórcio */}
        <RealEstateSimulator />

        {/* Financial Impact */}
        <div
          ref={impactCardRef as React.RefObject<HTMLDivElement>}
          className="animate-on-scroll delay-3"
        >
          <HideableCard
            id="impacto-casa-praia"
            isVisible={isCardVisible("impacto-casa-praia")}
            onToggleVisibility={() => toggleCardVisibility("impacto-casa-praia")}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center">
                <TrendingDown size={22} className="mr-2 text-accent" />
                Impacto Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex w-full justify-start mb-2">
                  <div className="inline-flex rounded-lg overflow-hidden border border-border">
                    <button
                      className={`px-5 py-2 text-sm font-semibold transition-colors duration-100 ${impactoTipo === 'financiamento' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                      onClick={() => setImpactoTipo('financiamento')}
                    >
                      Financiamento Bancário
                    </button>
                    <button
                      className={`px-5 py-2 text-sm font-semibold transition-colors duration-100 ${impactoTipo === 'consorcio' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                      onClick={() => setImpactoTipo('consorcio')}
                    >
                      Consórcio
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full">
                    <div className="text-center min-w-[180px]">
                      <div className="text-muted-foreground mb-1">Excedente Mensal Atual</div>
                      <div className="text-2xl font-bold">{formatCurrency(excedenteMensalAtual)}</div>
                    </div>
                    <div className="flex items-center text-muted-foreground mx-2">
                      <ArrowRight size={24} />
                    </div>
                    <div className="text-center min-w-[220px]">
                      <div className="text-muted-foreground mb-1">Parcela {impactoTipo === 'financiamento' ? 'Financiamento Bancário' : 'Consórcio'}</div>
                      <div className="text-2xl font-bold text-financial-danger">- {formatCurrency(parcela)}</div>
                    </div>
                    <div className="flex items-center text-muted-foreground mx-2">
                      <ArrowRight size={24} />
                    </div>
                    <div className="text-center min-w-[180px]">
                      <div className="text-muted-foreground mb-1">Excedente Mensal Após</div>
                      <div className="text-2xl font-bold text-financial-success">{formatCurrency(excedenteMensalApos)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 mt-2 mb-2 max-w-2xl mx-auto">
                <h3 className="font-medium mb-1 flex items-center">
                  <Check size={18} className="text-accent mr-2" />
                  Observação
                </h3>
                <p>
                  {impactoTipo === 'financiamento'
                    ? 'Parcela estimada para financiamento bancário'
                    : 'Parcela estimada para consórcio'}
                </p>
              </div>
              <div className="mt-4">
                <StatusChip
                  status="success"
                  label="Objetivo viável dentro do planejamento financeiro"
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </HideableCard>
        </div>
      </div>
    </section>
  );
};

export default BeachHouse;