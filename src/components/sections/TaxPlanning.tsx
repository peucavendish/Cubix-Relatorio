import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import HideableCard from '@/components/ui/HideableCard';
import { useCardVisibility } from '@/context/CardVisibilityContext';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import StatusChip from '@/components/ui/StatusChip';
import {
  Calculator,
  FileText,
  Shield,
  PiggyBank,
  Wallet,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface TaxPlanningProps {
  data: any;
  hideControls?: boolean;
}

const TaxPlanning: React.FC<TaxPlanningProps> = ({ data, hideControls }) => {
  // Get access to the tax planning data
  const { tributario } = data || {};
  const headerRef = useScrollAnimation();
  const summaryRef = useScrollAnimation();
  const strategiesRef = useScrollAnimation();
  const investmentsRef = useScrollAnimation();
  const holdingRef = useScrollAnimation();
  const savingsRef = useScrollAnimation();
  const { isCardVisible, toggleCardVisibility } = useCardVisibility();

  // Calculate the savings percentage
  const savingsPercentage = Math.round(
    (tributario?.economiaTributaria?.economia / (tributario?.economiaTributaria?.semPlanejamento?.totalImpostos || 1)) * 100
  );

  return (
    <section className="min-h-screen py-16 px-4" id="tax">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="mb-12 text-center animate-on-scroll"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-financial-info/30 p-3 rounded-full">
                <Calculator size={28} className="text-financial-info" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">Planejamento Tributário</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estratégias para otimização fiscal e redução da carga tributária através de estruturação
              patrimonial e organização financeira.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div
          ref={summaryRef as React.RefObject<HTMLDivElement>}
          className="mb-8 animate-on-scroll delay-1"
        >
          <HideableCard
            id="resumo-tributario"
            isVisible={isCardVisible("resumo-tributario")}
            onToggleVisibility={() => toggleCardVisibility("resumo-tributario")}
          >
            <CardHeader>
              <CardTitle className="text-xl">Resumo do Planejamento Tributário</CardTitle>
              <CardDescription>
                Visão geral das estratégias de otimização fiscal
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Objetivo</span>
                <span className="font-medium">{tributario?.resumo?.objetivo}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Potencial de Economia</span>
                <span className="font-medium text-financial-success">
                  {formatCurrency(tributario?.resumo?.potencialEconomia)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Prazo para Implementação</span>
                <span className="font-medium">{tributario?.resumo?.prazoImplementacao}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
              <span>Estratégias personalizadas para seu perfil financeiro</span>
            </CardFooter>
          </HideableCard>
        </div>

        {/* Tax Strategies */}
        <div
          ref={strategiesRef as React.RefObject<HTMLDivElement>}
          className="mb-8 grid md:grid-cols-2 gap-6 animate-on-scroll delay-2"
        >
          {/* Asset Structuring */}
          <HideableCard
            id="estruturacao-patrimonial"
            isVisible={isCardVisible("estruturacao-patrimonial")}
            onToggleVisibility={() => toggleCardVisibility("estruturacao-patrimonial")}
            hideControls={hideControls}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield size={18} className="text-financial-info" />
                Estruturação Patrimonial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(tributario?.estruturacaoPatrimonial) && tributario.estruturacaoPatrimonial.map((estrategia: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-md"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-financial-info"></div>
                    <span>{estrategia}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </HideableCard>

          {/* Tax Deductions */}
          <HideableCard
            id="deducoes-fiscais"
            isVisible={isCardVisible("deducoes-fiscais")}
            onToggleVisibility={() => toggleCardVisibility("deducoes-fiscais")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet size={18} className="text-financial-success" />
                Principais Deduções Fiscais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(tributario?.deducoes) && tributario.deducoes.map((deducao: any, index: number) => (
                  <li key={index} className="border-b border-border/50 last:border-0 py-2">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{deducao}</span>
                      {/* <span className="text-financial-success">{formatCurrency(deducao.valor)} </span> */}
                    </div>
                    {/* <p className="text-sm text-muted-foreground">{deducao.beneficio}</p> */}
                  </li>
                ))}
              </ul>
            </CardContent>
          </HideableCard>
        </div>

        {/* Tax-Free Investments */}
        <div
          ref={investmentsRef as React.RefObject<HTMLDivElement>}
          className="mb-8 animate-on-scroll delay-3"
        >
          <HideableCard
            id="investimentos-vantagens"
            isVisible={isCardVisible("investimentos-vantagens")}
            onToggleVisibility={() => toggleCardVisibility("investimentos-vantagens")}
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PiggyBank size={20} className="text-financial-info" />
                Investimentos com Vantagens Tributárias
              </CardTitle>
              <CardDescription>
                Opções de investimentos com redução ou isenção de impostos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investimento</TableHead>
                    {/* <TableHead>Limite</TableHead>
                    <TableHead>Tributação</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(tributario?.investimentosIsentos) && tributario.investimentosIsentos.map((investimento, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{investimento.tipo}</TableCell>
                      <TableCell>{formatCurrency(investimento.valor)}</TableCell>
                      <TableCell>
                        <StatusChip
                          status="success"
                          label={investimento.isencao}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </HideableCard>
        </div>

        {/* Family Holding */}
        <div
          ref={holdingRef as React.RefObject<HTMLDivElement>}
          className="mb-8 animate-on-scroll delay-4"
        >
          <HideableCard
            id="holding-familiar"
            isVisible={isCardVisible("holding-familiar")}
            onToggleVisibility={() => toggleCardVisibility("holding-familiar")}
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase size={20} className="text-financial-info" />
                Holding Familiar
              </CardTitle>
              <CardDescription>
                {tributario?.holdingFamiliar?.descricao}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Custo de Implementação</span>
                  <span className="font-medium">
                    {formatCurrency(tributario?.holdingFamiliar?.custoConstrucao)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Tempo para Implementação</span>
                  <span className="font-medium">{tributario?.holdingFamiliar?.tempoImplementacao}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Recomendação</span>
                  <StatusChip status="info" label="Altamente Recomendado" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Principais Benefícios</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {(tributario?.holdingFamiliar?.beneficios ?? []).map((beneficio: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <ChevronRight size={16} className="text-financial-info" />
                      <span className="text-sm">{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                <p className="text-sm">
                  <span className="font-medium">Recomendação: </span>
                  {tributario?.holdingFamiliar?.recomendacao}
                </p>
              </div>
            </CardContent>
          </HideableCard>
        </div>

        {/* Tax Savings - Movido para logo após o Holding Familiar */}
        <div
          ref={savingsRef as React.RefObject<HTMLDivElement>}
          className="mb-8 animate-on-scroll delay-5"
        >
          <HideableCard
            id="economia-tributaria"
            isVisible={isCardVisible("economia-tributaria")}
            onToggleVisibility={() => toggleCardVisibility("economia-tributaria")}
            className="border-financial-success/30 bg-financial-success/5"
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calculator size={20} className="text-financial-success" />
                Economia Tributária Estimada
              </CardTitle>
              <CardDescription>
                Projeção de economia com a implementação do planejamento tributário no período de {tributario?.economiaTributaria?.periodoEstimado}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Savings Overview */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Sem Planejamento</span>
                  <div className="flex items-center gap-1">
                    <ArrowUp size={16} className="text-financial-danger" />
                    <span className="font-medium text-financial-danger">
                      {formatCurrency(tributario?.economiaTributaria?.semPlanejamento?.totalImpostos)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Com Planejamento</span>
                  <div className="flex items-center gap-1">
                    <ArrowDown size={16} className="text-financial-success" />
                    <span className="font-medium text-financial-success">
                      {formatCurrency(tributario?.economiaTributaria?.comPlanejamento?.totalImpostos)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Economia Total</span>
                  <span className="font-medium text-xl text-financial-success">
                    {formatCurrency(tributario?.economiaTributaria?.economia)}
                  </span>
                </div>
              </div>

              {/* Savings Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Percentual de economia</span>
                  <span className="text-sm font-medium text-financial-success">
                    {tributario?.economiaTributaria?.percentualEconomia}%
                  </span>
                </div>
                <Progress value={tributario?.economiaTributaria?.percentualEconomia} className="h-2.5 bg-financial-danger/20">
                  <div
                    className={cn(
                      "h-full w-full flex-1 transition-all rounded-full",
                      "bg-financial-success"
                    )}
                    style={{ transform: `translateX(-${100 - tributario?.economiaTributaria?.percentualEconomia}%)` }}
                  />
                </Progress>
              </div>

              {/* Items Considered */}
              <div>
                <h4 className="font-medium mb-2">Itens Considerados na Análise</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {tributario?.economiaTributaria?.itensConsiderados?.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <ChevronRight size={16} className="text-financial-success" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </HideableCard>
        </div>


      </div>
    </section>
  );
};

export default TaxPlanning;
