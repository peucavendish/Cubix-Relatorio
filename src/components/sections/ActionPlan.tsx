import React from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  ListChecks,
  ShieldCheck,
  User
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import HideableCard from '@/components/ui/HideableCard';
import { useCardVisibility } from '@/context/CardVisibilityContext';
import StatusChip from '@/components/ui/StatusChip';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

interface ActionPlanProps {
  data: any;
  hideControls?: boolean;
}

// Componente customizado que estende o Card básico
const CardWithHighlight = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { highlight?: boolean }
>(({ className, highlight, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      highlight && "border-accent/50 bg-accent/5",
      className
    )}
    {...props}
  />
));
CardWithHighlight.displayName = "CardWithHighlight";

const ActionPlan: React.FC<ActionPlanProps> = ({ data, hideControls }) => {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const securityIndexRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const timelineRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const priorityRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const nextStepsRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  const { isCardVisible, toggleCardVisibility } = useCardVisibility();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-financial-danger/20 text-financial-danger';
      case 'Média':
        return 'bg-financial-warning/20 text-financial-warning';
      case 'Baixa':
        return 'bg-financial-success/20 text-financial-success';
      default:
        return 'bg-financial-info/20 text-financial-info';
    }
  };

  if (!data || !data.planoAcao) {
    console.error('Dados do plano de ação não disponíveis:', data);
    return <div className="py-12 px-4 text-center">Dados do plano de ação não disponíveis</div>;
  }

  // Dados fixos (mock) para o indicador de segurança financeira
  const mockIndicadorSeguranca = {
    valor: 72,
    nivel: "Adequado",
    elementosAvaliados: [
      "Reserva de emergência",
      "Diversificação de ativos",
      "Proteção patrimonial",
      "Fluxo de caixa mensal",
      "Endividamento"
    ]
  };

  // Períodos predefinidos para o cronograma
  const periodos = [
    {
      periodo: "Curto Prazo (1-3 meses)",
      objetivoPrincipal: "Estruturação inicial"
    },
    {
      periodo: "Médio Prazo (4-12 meses)",
      objetivoPrincipal: "Otimização fiscal e proteção"
    },
    {
      periodo: "Longo Prazo (1-3 anos)",
      objetivoPrincipal: "Acumulação patrimonial"
    }
  ];

  // Mapear cronograma usando os dados do JSON e os períodos predefinidos
  const cronograma = data.planoAcao.cronograma.map((item: any, index: number) => {
    // Usando os períodos predefinidos, mas limitando ao tamanho do array
    const periodoIndex = index < periodos.length ? index : periodos.length - 1;

    return {
      periodo: periodos[periodoIndex].periodo,
      objetivoPrincipal: periodos[periodoIndex].objetivoPrincipal,
      descricao: item.etapa,
      prazo: item.prazo,
      acoes: [item.acao]
    };
  });

  // Verifica se o cliente precisa de uma holding familiar
  const precisaHolding = () => {
    // Verifica se a estruturação patrimonial inclui "Holding Familiar"
    return data.tributario?.estruturacaoPatrimonial?.includes("Holding Familiar") || false;
  };

  // Ações prioritárias dinâmicas
  const getAcoesPrioritarias = () => {
    const acoes = [];

    // Adiciona a ação de Holding Familiar apenas se necessário
    if (precisaHolding()) {
      acoes.push({
        titulo: "Holding Familiar",
        descricao: "Constituição de holding patrimonial para proteção de bens e otimização fiscal",
        prioridade: "Alta",
        prazo: data.planoAcao.cronograma[2]?.prazo || "90 dias",
        responsavel: "Advogado societário",
        passos: [
          "Análise da estrutura patrimonial atual",
          "Definição do tipo societário",
          "Elaboração de contrato/estatuto social",
          "Integralização dos bens imóveis"
        ],
        impacto: "Redução de até 50% em impostos sucessórios",
        status: "Não iniciado"
      });
    }

    // Adiciona as outras ações prioritárias
    acoes.push({
      titulo: "Planejamento Sucessório",
      descricao: "Estruturação de instrumentos jurídicos para proteção sucessória",
      prioridade: "Alta",
      prazo: data.planoAcao.cronograma[2]?.prazo || "120 dias",
      responsavel: "Advogado especialista",
      passos: [
        "Elaboração de testamento",
        "Estruturação de doações em vida",
        "Definição de beneficiários de previdência",
        "Criação de mandato duradouro"
      ],
      impacto: "Segurança jurídica e financeira para a família",
      status: "Não iniciado"
    });

    acoes.push({
      titulo: "Consórcio do Imóvel Desejado",
      descricao: data.imovelDesejado?.estrategiaRecomendada === "Consórcio" ?
        `Contratação de consórcio para aquisição da casa de praia no valor de ${data.imovelDesejado?.objetivo?.valorImovel ?
          'R$ ' + data.imovelDesejado.objetivo.valorImovel.toLocaleString('pt-BR') : 'R$ 1.000.000'}` :
        "Contratação de consórcio para aquisição da casa de praia",
      prioridade: "Média",
      prazo: data.planoAcao.cronograma[3]?.prazo || "30 dias",
      responsavel: "Assessor de Investimentos",
      passos: [
        "Pesquisa das melhores administradoras",
        "Análise das condições contratuais",
        "Definição do valor da carta",
        "Contratação e início dos pagamentos"
      ],
      impacto: `Aquisição do imóvel em até ${data.imovelDesejado?.objetivo?.prazoDesejado || "5 anos"}`,
      status: "Em progresso"
    });

    acoes.push({
      titulo: "Diversificação de Investimentos",
      descricao: "Reestruturação da carteira para maior diversificação e proteção",
      prioridade: "Média",
      prazo: data.planoAcao.cronograma[1]?.prazo || "60 dias",
      responsavel: "Assessor de Investimentos",
      passos: [
        "Análise da carteira atual",
        "Definição de nova alocação estratégica",
        "Implementação das mudanças",
        "Monitoramento de resultados"
      ],
      impacto: "Redução de volatilidade e potencial aumento de retorno",
      status: "Não iniciado"
    });

    return acoes;
  };

  // Obter as ações prioritárias dinâmicas
  const acoesPrioritarias = getAcoesPrioritarias();

  // Dados para a conclusão
  const conclusao = {
    titulo: "Próximos Passos e Conclusão",
    mensagemPrincipal: "Este plano de ação representa um roteiro personalizado para maximizar sua segurança financeira e alcançar seus objetivos patrimoniais.",
    compromissoAssessoria: "Nossa equipe estará disponível para acompanhar cada etapa deste processo, oferecendo suporte contínuo e ajustes conforme necessário.",
    recomendacaoFinal: precisaHolding()
      ? "Recomendamos iniciar imediatamente pelas ações de alta prioridade, especialmente a constituição da holding familiar e a implementação das estratégias de proteção patrimonial."
      : "Recomendamos iniciar imediatamente pelas ações de alta prioridade, focando na implementação das estratégias de proteção patrimonial e planejamento sucessório."
  };

  return (
    <section className="py-16 px-4" id="action-plan">
      <div className="max-w-5xl mx-auto">
        <div
          ref={titleRef}
          className="mb-12 text-center animate-on-scroll"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <ListChecks size={28} className="text-accent" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-3">Plano de Ação Financeira</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conjunto de ações estratégicas para alcançar seus objetivos financeiros e patrimoniais
            </p>
          </div>
        </div>

        <div
          ref={securityIndexRef}
          className="max-w-5xl mx-auto mb-8 animate-on-scroll"
        >
          <HideableCard
            id="indicador-seguranca"
            isVisible={isCardVisible("indicador-seguranca")}
            onToggleVisibility={() => toggleCardVisibility("indicador-seguranca")}
            hideControls={hideControls}
          >
            <Card className="border border-muted-foreground/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldCheck className="text-accent h-5 w-5" />
                  {data.planoAcao.indicadorSegurancaFinanceira.titulo}
                </CardTitle>
                <CardDescription>
                  {data.planoAcao.indicadorSegurancaFinanceira.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                  <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-accent/20">
                    <div className="absolute inset-0 rounded-full border-8 border-accent"
                      style={{
                        clipPath: `inset(0 ${100 - mockIndicadorSeguranca.valor}% 0 0)`
                      }}
                    />
                    <div className="text-center">
                      <div className="text-4xl font-bold">{mockIndicadorSeguranca.valor}</div>
                      <div className="text-sm text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Nível atual:</span>
                      <StatusChip
                        status={mockIndicadorSeguranca.valor >= 70 ? 'success' : mockIndicadorSeguranca.valor >= 50 ? 'info' : 'warning'}
                        label={mockIndicadorSeguranca.nivel}
                      />
                    </div>
                    <h4 className="text-lg font-medium mb-3">Elementos avaliados:</h4>
                    <ul className="space-y-2">
                      {mockIndicadorSeguranca.elementosAvaliados.map((elemento, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="text-accent h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span>{elemento}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HideableCard>
        </div>

        <div
          ref={timelineRef}
          className="max-w-5xl mx-auto mb-8 animate-on-scroll"
        >
          <h3 className="text-xl font-semibold mb-6">Cronograma de Implementação</h3>
          <div className="relative">
            {cronograma.map((fase, index) => (
              <div key={index} className="mb-8 md:mb-10">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <div className="md:w-1/4">
                    <CardWithHighlight highlight={index === 0} className={index === 0 ? 'border-accent' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-accent" />
                          <h4 className="font-semibold">{fase.periodo}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{fase.objetivoPrincipal}</p>
                      </CardContent>
                    </CardWithHighlight>
                  </div>
                  <div className="md:w-3/4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="mb-3 font-medium">{fase.descricao}</p>
                        <ul className="space-y-2">
                          {fase.acoes.map((acao, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <ArrowRight className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                {index < cronograma.length - 1 && (
                  <div className="hidden md:block h-8 w-0.5 bg-border mx-auto my-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          ref={priorityRef}
          className="max-w-5xl mx-auto mb-6 animate-on-scroll"
        >
          <h3 className="text-xl font-semibold mb-6">Ações Prioritárias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acoesPrioritarias.map((acao, index) => (
              <Card key={index} className={acao.prioridade === 'Alta' ? 'border-financial-danger/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{acao.titulo}</CardTitle>
                    <Badge className={getPriorityColor(acao.prioridade)}>
                      {acao.prioridade}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">{acao.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Prazo: <span className="font-medium">{acao.prazo}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Responsável: <span className="font-medium">{acao.responsavel}</span></span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-2">Passos principais:</h5>
                    <ol className="text-sm space-y-1">
                      {acao.passos.map((passo, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-xs inline-flex items-center justify-center size-5 rounded-full bg-accent/10 text-accent font-medium">{i + 1}</span>
                          {passo}
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">Impacto: {acao.impacto}</span>
                  <StatusChip
                    status={acao.status === 'Concluído' ? 'success' : acao.status === 'Em progresso' ? 'info' : 'warning'}
                    label={acao.status}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div ref={nextStepsRef} className="max-w-5xl mx-auto mb-6 animate-on-scroll delay-1">
          <Card className="bg-gradient-to-br from-accent/10 to-background border-accent/30">
            <CardHeader className="pb-3">
              <CardTitle>{conclusao.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <p className="text-lg mb-4">{conclusao.mensagemPrincipal}</p>
              <p className="mb-4">{conclusao.compromissoAssessoria}</p>
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                <h4 className="flex items-center gap-2 font-medium mb-2">
                  <ArrowRight className="text-accent" />
                  Recomendação Final
                </h4>
                <p>{conclusao.recomendacaoFinal}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ActionPlan;