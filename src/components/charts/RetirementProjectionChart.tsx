import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area
} from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';
import { ChartContainer } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Custom currency input component
const CurrencyInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}> = ({ value, onChange, className, id }) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const numericValue = inputVal.replace(/[^0-9,.]/g, '');
    setDisplayValue(`R$ ${numericValue}`);
    const parsedValue = parseFloat(numericValue.replace(/\./g, '').replace(',', '.')) || 0;
    onChange(parsedValue);
  };

  useEffect(() => {
    setDisplayValue(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value));
  }, [value]);

  return (
    <Input
      id={id}
      value={displayValue}
      onChange={handleInputChange}
      className={className}
    />
  );
};

interface RetirementProjectionChartProps {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentPortfolio: number;
  monthlyContribution: number;
  rendaMensalDesejada: number;
  safeWithdrawalRate: number;
  inflationRate: number;
  scenarios?: Array<{
    idade: number;
    aporteMensal: number;
    capitalNecessario: number;
  }>;
  onProjectionChange?: (projection: {
    capitalNecessario: number;
    aporteMensal: number;
    idadeEsgotamento: number | null;
    rendaMensal: number;
    idadeAposentadoria: number;
  }) => void;
}

interface LiquidityEvent {
  id: string;
  name: string;
  age: number;
  value: number;
  isPositive: boolean;
}

interface DuracaoCapital {
  idadeFinal: number;
  duracaoAnos: number;
}

// Função PMT idêntica à usada na planilha
function PMT(taxa: number, periodos: number, vp: number, vf: number = 0, tipo: number = 0) {
  if (taxa === 0) return -(vp + vf) / periodos;
  const x = Math.pow(1 + taxa, periodos);
  return -(vp * x + vf) * taxa / ((x - 1) * (1 + taxa * tipo));
}

// Função principal de cálculo alinhada com a planilha
const calculateRetirementProjection = (
  idade_atual: number,
  idade_para_aposentar: number,
  expectativa_de_vida: number,
  capitalDisponivelHoje: number,
  capital_disponivel_mensal: number,
  saque_mensal_desejado: number,
  rentabilidade_real_liquida_acumulacao: number = 0.03,
  rentabilidade_real_liquida_consumo: number = 0.03,
  eventosLiquidez: LiquidityEvent[] = []
) => {
  // Taxa mensal equivalente (igual à planilha)
  const taxa_mensal_real = Math.pow(1 + rentabilidade_real_liquida_acumulacao, 1 / 12) - 1;

  // Cálculo do capital necessário (usando a mesma abordagem da planilha)
  const calculaCapitalNecessario = () => {
    const meses_consumo = (expectativa_de_vida - idade_para_aposentar) * 12;
    // Fórmula idêntica à usada na planilha (célula C9 em Apos(2))
    return (saque_mensal_desejado * (1 - Math.pow(1 + taxa_mensal_real, -meses_consumo)) / taxa_mensal_real);
  };

  const capitalNecessario = calculaCapitalNecessario();

  // Simulação do fluxo de capital (ajustado para a lógica da planilha)
  const simularFluxoCapital = () => {
    const fluxo = [];
    let capital = capitalDisponivelHoje;
    let idade = idade_atual;

    // Fase de acumulação
    while (idade < idade_para_aposentar) {
      // Aplica eventos de liquidez no ano atual
      const eventosAno = eventosLiquidez.filter(e => e.age === idade);
      eventosAno.forEach(evento => {
        // Entrada aumenta o capital, saída diminui
        capital += evento.isPositive ? evento.value : -evento.value;
      });

      fluxo.push({ idade, capital });

      // Rendimento anual
      const rendimento = capital * rentabilidade_real_liquida_acumulacao;
      // Aporte anual
      const aporteAnual = capital_disponivel_mensal * 12;

      capital = capital + rendimento + aporteAnual;
      idade++;
    }

    // Fase de consumo
    const saqueAnual = saque_mensal_desejado * 12;
    let idadeEsgotamento = null;

    while (idade <= expectativa_de_vida) {
      // Aplica eventos de liquidez no ano atual
      const eventosAno = eventosLiquidez.filter(e => e.age === idade);
      eventosAno.forEach(evento => {
        // Entrada aumenta o capital, saída diminui
        capital += evento.isPositive ? evento.value : -evento.value;
      });

      fluxo.push({ idade, capital: capital > 0 ? capital : 0 });

      if (capital <= 0) {
        if (idadeEsgotamento === null) idadeEsgotamento = idade;
        idade++;
        continue;
      }

      // Rendimento durante a fase de consumo (taxa igual à da planilha)
      const rendimento = capital * rentabilidade_real_liquida_consumo;
      capital = capital + rendimento - saqueAnual;
      idade++;
    }

    return { fluxo, idadeEsgotamento };
  };

  const calculaAporteMensal = () => {
    const meses_acumulacao = (idade_para_aposentar - idade_atual) * 12;
    if (meses_acumulacao <= 0) return 0;

    // Calcula o valor futuro dos eventos de liquidez
    let valorFuturoEventos = 0;
    eventosLiquidez.forEach(evento => {
      if (evento.age < idade_para_aposentar) {
        const mesesAteEvento = (evento.age - idade_atual) * 12;
        const mesesAteAposentadoria = meses_acumulacao - mesesAteEvento;
        // Calcula quanto o evento vai render até a aposentadoria
        const valorFuturo = evento.value * Math.pow(1 + taxa_mensal_real, mesesAteAposentadoria);
        // Se for entrada, diminui o aporte necessário. Se for saída, aumenta
        valorFuturoEventos += evento.isPositive ? valorFuturo : -valorFuturo;
      }
    });

    // Calcula quanto o capital atual vai render até a aposentadoria
    const capitalAtualFuturo = capitalDisponivelHoje * Math.pow(1 + taxa_mensal_real, meses_acumulacao);

    // Calcula quanto falta para atingir o capital necessário
    const capitalFaltante = capitalNecessario - (capitalAtualFuturo + valorFuturoEventos);

    // Se o capital atual + eventos já for suficiente, retorna 0
    if (capitalFaltante <= 0) return 0;

    // Calcula o aporte mensal necessário para atingir o capital faltante
    return Math.abs(PMT(
      taxa_mensal_real,
      meses_acumulacao,
      0,
      capitalFaltante
    ));
  };

  const aporteMensal = calculaAporteMensal();

  const resultado = simularFluxoCapital();
  const fluxoCapital = resultado.fluxo;

  // Cálculo da duração do capital (ajustado)
  const calcularDuracaoCapital = () => {
    const capitalInicioAposentadoria = fluxoCapital.find(
      item => item.idade === idade_para_aposentar
    )?.capital || 0;

    let capital = capitalInicioAposentadoria;
    let idade = idade_para_aposentar;
    const saqueAnual = saque_mensal_desejado * 12;

    while (capital > 0 && idade < expectativa_de_vida) {
      // Aplica eventos de liquidez no ano atual
      const eventosAno = eventosLiquidez.filter(e => e.age === idade);
      eventosAno.forEach(evento => {
        // Entrada aumenta o capital, saída diminui
        capital += evento.isPositive ? evento.value : -evento.value;
      });

      const rendimento = capital * rentabilidade_real_liquida_consumo;
      capital = capital + rendimento - saqueAnual;
      idade++;
    }

    return {
      idadeFinal: capital > 0 ? expectativa_de_vida : idade - 1,
      duracaoAnos: capital > 0 ?
        expectativa_de_vida - idade_para_aposentar :
        (idade - 1) - idade_para_aposentar
    };
  };

  const duracaoCapital = calcularDuracaoCapital();

  return {
    fluxoCapital,
    idadeAposentadoria: idade_para_aposentar,
    capitalNecessario,
    aporteMensal,
    duracaoCapital,
    idadeEsgotamento: resultado.idadeEsgotamento
  };
};

const chartConfig = {
  capital: {
    label: "Patrimônio acumulado",
    theme: {
      light: "#7EC866",
      dark: "#7EC866",
    }
  },
};

const RetirementProjectionChart: React.FC<RetirementProjectionChartProps> = ({
  currentAge,
  retirementAge,
  lifeExpectancy,
  currentPortfolio,
  monthlyContribution,
  rendaMensalDesejada,
  safeWithdrawalRate,
  inflationRate,
  onProjectionChange
}) => {
  const [selectedView, setSelectedView] = useState<'completo' | '10anos' | '20anos' | '30anos'>('completo');
  const [taxaRetorno, setTaxaRetorno] = useState<number>(0.03); // 3% real ao ano como na planilha
  const [rendaMensal, setRendaMensal] = useState<number>(rendaMensalDesejada);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState<number>(retirementAge);
  const [aporteMensal, setAporteMensal] = useState<number>(() => {
    const result = calculateRetirementProjection(
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentPortfolio,
      monthlyContribution,
      rendaMensalDesejada,
      0.03,
      0.03,
      []
    );
    return result.aporteMensal;
  });
  const [liquidityEvents, setLiquidityEvents] = useState<LiquidityEvent[]>([]);
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventAge, setNewEventAge] = useState<number>(currentAge + 5);
  const [newEventValue, setNewEventValue] = useState<number>(0);
  const [newEventType, setNewEventType] = useState<'positive' | 'negative'>('positive');
  const [projection, setProjection] = useState(() => {
    const result = calculateRetirementProjection(
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentPortfolio,
      monthlyContribution,
      rendaMensalDesejada,
      0.03,
      0.03,
      []
    );
    return {
      ...result,
      fluxoCapital: result.fluxoCapital.map(item => ({
        age: item.idade,
        capital: Math.round(item.capital)
      }))
    };
  });

  const handleAddLiquidityEvent = () => {
    if (!newEventName || newEventAge < currentAge || newEventValue <= 0) return;

    const newEvent: LiquidityEvent = {
      id: Date.now().toString(),
      name: newEventName,
      age: newEventAge,
      value: newEventValue,
      isPositive: newEventType === 'positive'
    };

    const updatedEvents = [...liquidityEvents, newEvent];
    setLiquidityEvents(updatedEvents);
    setNewEventName('');
    setNewEventAge(currentAge + 5);
    setNewEventValue(0);
    setNewEventType('positive');

    // Recalcula a projeção com os novos valores
    const result = calculateRetirementProjection(
      currentAge,
      idadeAposentadoria,
      lifeExpectancy,
      currentPortfolio,
      aporteMensal,
      rendaMensal,
      taxaRetorno,
      taxaRetorno,
      updatedEvents
    );

    // Atualiza o aporte mensal com o valor calculado
    setAporteMensal(result.aporteMensal);

    // Atualiza o gráfico com os novos dados
    setProjection({
      ...result,
      fluxoCapital: result.fluxoCapital.map(item => ({
        age: item.idade,
        capital: Math.round(item.capital)
      }))
    });
  };

  const handleRemoveLiquidityEvent = (id: string) => {
    const updatedEvents = liquidityEvents.filter(event => event.id !== id);
    setLiquidityEvents(updatedEvents);

    // Recalcula a projeção com os novos valores
    const result = calculateRetirementProjection(
      currentAge,
      idadeAposentadoria,
      lifeExpectancy,
      currentPortfolio,
      aporteMensal,
      rendaMensal,
      taxaRetorno,
      taxaRetorno,
      updatedEvents
    );

    // Atualiza o aporte mensal com o valor calculado
    setAporteMensal(result.aporteMensal);

    // Atualiza o gráfico com os novos dados
    setProjection({
      ...result,
      fluxoCapital: result.fluxoCapital.map(item => ({
        age: item.idade,
        capital: Math.round(item.capital)
      }))
    });
  };

  useEffect(() => {
    if (idadeAposentadoria < currentAge + 1) {
      setIdadeAposentadoria(currentAge + 1);
    }
  }, [currentAge, idadeAposentadoria]);

  // Add effect to notify parent of projection changes
  useEffect(() => {
    onProjectionChange?.({
      capitalNecessario: projection.capitalNecessario,
      aporteMensal: projection.aporteMensal,
      idadeEsgotamento: projection.idadeEsgotamento,
      rendaMensal: rendaMensal,
      idadeAposentadoria: idadeAposentadoria
    });
  }, [projection, rendaMensal, idadeAposentadoria, onProjectionChange]);

  const xDomain = React.useMemo(() => {
    return [currentAge, lifeExpectancy];
  }, [currentAge, lifeExpectancy]);

  const filteredData = React.useMemo(() => {
    if (selectedView === '10anos') {
      return projection.fluxoCapital.filter(item => item.age <= currentAge + 10);
    } else if (selectedView === '20anos') {
      return projection.fluxoCapital.filter(item => item.age <= currentAge + 20);
    } else if (selectedView === '30anos') {
      return projection.fluxoCapital.filter(item => item.age <= currentAge + 30);
    }
    return projection.fluxoCapital;
  }, [projection.fluxoCapital, selectedView, currentAge]);

  const formatYAxis = (value: number) => {
    if (value === 0) return 'R$ 0';
    if (value >= 1000000) return `R$ ${Math.floor(value / 1000000)}M`;
    return formatCurrency(value);
  };

  return (
    <Card className="w-full h-full border-border/80 shadow-sm">
      <CardHeader className="px-6 pb-0">
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
            <div>
              <CardTitle className="text-xl font-semibold">Cenário de Aposentadoria</CardTitle>
              <CardDescription className="mt-1">
                Evolução do patrimônio no prazo desejado (alinhado com a planilha)
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              value={selectedView}
              onValueChange={(value) => {
                if (value) {
                  setSelectedView(value as 'completo' | '10anos' | '20anos' | '30anos');

                  // Define a nova idade de aposentadoria baseada no cenário selecionado
                  let novaIdadeAposentadoria = retirementAge;
                  if (value === '10anos') {
                    novaIdadeAposentadoria = currentAge + 10;
                  } else if (value === '20anos') {
                    novaIdadeAposentadoria = currentAge + 20;
                  } else if (value === '30anos') {
                    novaIdadeAposentadoria = currentAge + 30;
                  }

                  setIdadeAposentadoria(novaIdadeAposentadoria);

                  // Recalcula a projeção com os novos valores
                  const result = calculateRetirementProjection(
                    currentAge,
                    novaIdadeAposentadoria,
                    lifeExpectancy,
                    currentPortfolio,
                    aporteMensal,
                    rendaMensal,
                    taxaRetorno,
                    taxaRetorno,
                    liquidityEvents
                  );

                  // Atualiza o aporte mensal com o valor calculado
                  setAporteMensal(result.aporteMensal);

                  // Atualiza o gráfico com os novos dados
                  setProjection({
                    ...result,
                    fluxoCapital: result.fluxoCapital.map(item => ({
                      age: item.idade,
                      capital: Math.round(item.capital)
                    }))
                  });
                }
              }}
              className="bg-muted/30 p-1 rounded-lg"
            >
              <ToggleGroupItem
                value="completo"
                size="sm"
                className="text-xs px-3 py-1.5 rounded bg-transparent hover:bg-muted/50"
              >
                Completo
              </ToggleGroupItem>
              <ToggleGroupItem
                value="10anos"
                size="sm"
                className="text-xs px-3 py-1.5 rounded bg-transparent hover:bg-muted/50"
              >
                10 Anos
              </ToggleGroupItem>
              <ToggleGroupItem
                value="20anos"
                size="sm"
                className="text-xs px-3 py-1.5 rounded bg-transparent hover:bg-muted/50"
              >
                20 Anos
              </ToggleGroupItem>
              <ToggleGroupItem
                value="30anos"
                size="sm"
                className="text-xs px-3 py-1.5 rounded bg-transparent hover:bg-muted/50"
              >
                30 Anos
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="taxaRetorno">Taxa de Retorno Real</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="taxaRetorno"
                  value={[taxaRetorno * 100]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => {
                    const newTaxaRetorno = value[0] / 100;
                    setTaxaRetorno(newTaxaRetorno);

                    // Recalcula a projeção com os novos valores
                    const result = calculateRetirementProjection(
                      currentAge,
                      idadeAposentadoria,
                      lifeExpectancy,
                      currentPortfolio,
                      aporteMensal,
                      rendaMensal,
                      newTaxaRetorno,
                      newTaxaRetorno,
                      liquidityEvents
                    );

                    // Atualiza o aporte mensal com o valor calculado
                    setAporteMensal(result.aporteMensal);

                    // Atualiza o gráfico com os novos dados
                    setProjection({
                      ...result,
                      fluxoCapital: result.fluxoCapital.map(item => ({
                        age: item.idade,
                        capital: Math.round(item.capital)
                      }))
                    });
                  }}
                  className="flex-1"
                />
                <div className="w-12 text-center text-sm font-medium">{(taxaRetorno * 100).toFixed(1)}%</div>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa real líquida % a.a (igual para acumulação e consumo)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aporteMensal">Aporte Mensal</Label>
              <CurrencyInput
                id="aporteMensal"
                value={aporteMensal}
                onChange={(value) => {
                  setAporteMensal(value);

                  // Calcula o capital acumulado na idade de aposentadoria
                  const mesesAcumulacao = (idadeAposentadoria - currentAge) * 12;
                  const taxaMensal = Math.pow(1 + taxaRetorno, 1 / 12) - 1;

                  // FV = PV * (1 + i)^n + PMT * ((1 + i)^n - 1) / i
                  const capitalAcumulado = currentPortfolio * Math.pow(1 + taxaMensal, mesesAcumulacao) +
                    value * (Math.pow(1 + taxaMensal, mesesAcumulacao) - 1) / taxaMensal;

                  // Calcula a renda mensal que pode ser sustentada com esse capital
                  const mesesConsumo = (lifeExpectancy - idadeAposentadoria) * 12;
                  const rendaMensalCalculada = capitalAcumulado * taxaMensal / (1 - Math.pow(1 + taxaMensal, -mesesConsumo));

                  setRendaMensal(Math.round(rendaMensalCalculada));

                  // Recalcula a projeção com os novos valores
                  const result = calculateRetirementProjection(
                    currentAge,
                    idadeAposentadoria,
                    lifeExpectancy,
                    currentPortfolio,
                    value,
                    Math.round(rendaMensalCalculada),
                    taxaRetorno,
                    taxaRetorno,
                    liquidityEvents
                  );

                  // Atualiza o gráfico com os novos dados
                  setProjection({
                    ...result,
                    fluxoCapital: result.fluxoCapital.map(item => ({
                      age: item.idade,
                      capital: Math.round(item.capital)
                    }))
                  });
                }}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rendaMensal">Renda Mensal Desejada</Label>
              <CurrencyInput
                id="rendaMensal"
                value={rendaMensal}
                onChange={(value) => {
                  setRendaMensal(value);

                  // Recalcula a projeção com os novos valores
                  const result = calculateRetirementProjection(
                    currentAge,
                    idadeAposentadoria,
                    lifeExpectancy,
                    currentPortfolio,
                    aporteMensal,
                    value,
                    taxaRetorno,
                    taxaRetorno,
                    liquidityEvents
                  );

                  // Atualiza o aporte mensal com o valor calculado
                  setAporteMensal(result.aporteMensal);

                  // Atualiza o gráfico com os novos dados
                  setProjection({
                    ...result,
                    fluxoCapital: result.fluxoCapital.map(item => ({
                      age: item.idade,
                      capital: Math.round(item.capital)
                    }))
                  });
                }}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idadeAposentadoria">Idade de Aposentadoria</Label>
              <Input
                id="idadeAposentadoria"
                type="number"
                value={idadeAposentadoria}
                onChange={(e) => {
                  const newAge = parseInt(e.target.value) || retirementAge;
                  setIdadeAposentadoria(newAge);

                  // Recalcula a projeção com os novos valores
                  const result = calculateRetirementProjection(
                    currentAge,
                    newAge,
                    lifeExpectancy,
                    currentPortfolio,
                    aporteMensal,
                    rendaMensal,
                    taxaRetorno,
                    taxaRetorno,
                    liquidityEvents
                  );

                  // Atualiza o aporte mensal com o valor calculado
                  setAporteMensal(result.aporteMensal);

                  // Atualiza o gráfico com os novos dados
                  setProjection({
                    ...result,
                    fluxoCapital: result.fluxoCapital.map(item => ({
                      age: item.idade,
                      capital: Math.round(item.capital)
                    }))
                  });
                }}
                min={currentAge + 1}
                max={90}
                className="h-9"
              />
            </div>
          </div>

          {/* Seção de Eventos de Liquidez */}
          <div className="flex items-center justify-between mb-0.5">
            <Label>Eventos de Liquidez</Label>
            <div className="text-xs text-muted-foreground">
              Eventos que afetam seu patrimônio em momentos específicos
            </div>
          </div>

          <div className="border border-border rounded-md overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="py-2 px-3 text-left font-medium">Evento</th>
                  <th className="py-2 px-3 text-center font-medium">Idade</th>
                  <th className="py-2 px-3 text-center font-medium">Tipo</th>
                  <th className="py-2 px-3 text-right font-medium">Valor</th>
                  <th className="py-2 px-3 text-center font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {liquidityEvents.map(event => (
                  <tr key={event.id}>
                    <td className="py-2 px-3">{event.name}</td>
                    <td className="py-2 px-3 text-center">{event.age} anos</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${event.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {event.isPositive ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatCurrency(event.value)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleRemoveLiquidityEvent(event.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remover evento"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Formulário para adicionar novo evento */}
                <tr className="bg-accent/5">
                  <td className="py-2 px-3">
                    <Input
                      placeholder="Nome do evento"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Input
                      type="number"
                      value={newEventAge}
                      onChange={(e) => setNewEventAge(parseInt(e.target.value) || currentAge + 1)}
                      min={currentAge}
                      max={90}
                      className="h-8 text-xs w-20 mx-auto text-center"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value as 'positive' | 'negative')}
                      className="h-8 text-xs rounded-md border border-input bg-background px-2"
                    >
                      <option value="positive">Entrada</option>
                      <option value="negative">Saída</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <CurrencyInput
                      value={newEventValue}
                      onChange={(value) => setNewEventValue(value)}
                      className="h-8 text-xs w-28 ml-auto"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={handleAddLiquidityEvent}
                      className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold"
                      title="Adicionar evento"
                      disabled={!newEventName || newEventAge < currentAge || newEventValue <= 0}
                    >
                      +
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="h-[320px] mb-6">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 25, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="age"
                  label={{ value: 'Idade', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12 }}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#9CA3AF' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  padding={{ left: 10, right: 10 }}
                  domain={xDomain}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  domain={[0, 'auto']}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#9CA3AF' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  label={{
                    value: 'Patrimônio',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -5,
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/95 backdrop-blur-sm border border-border/80 px-3 py-2 rounded-md shadow-lg">
                          <p className="font-medium text-xs mb-1">{`Idade: ${payload[0]?.payload.age} anos`}</p>
                          <div className="space-y-1">
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-2.5 h-2.5 rounded-[2px]"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-muted-foreground">{entry.name}:</span>
                                </div>
                                <span className="font-medium tabular-nums">
                                  {formatCurrency(entry.value as number)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  wrapperStyle={{ outline: 'none' }}
                />

                {/* Linha de referência para a idade de aposentadoria */}
                <ReferenceLine
                  x={idadeAposentadoria}
                  stroke="#7EC866"
                  strokeDasharray="3 3"
                  label={{
                    value: `Aposentadoria (${idadeAposentadoria} anos)`,
                    position: 'insideTopRight',
                    fill: '#7EC866',
                    fontSize: 11
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="capital"
                  name="Patrimônio acumulado"
                  stroke="#7EC866"
                  fill="#7EC866"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 1 }}
                />

                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: 15,
                    fontSize: 11,
                    lineHeight: '1.2em'
                  }}
                  iconType="plainline"
                  iconSize={10}
                />

                {liquidityEvents.map((event, index) => (
                  <ReferenceLine
                    key={event.id}
                    x={event.age}
                    stroke={event.isPositive ? "#22c55e" : "#ef4444"}
                    strokeDasharray="3 3"
                    label={{
                      value: `${event.name} (${formatCurrency(event.value)})`,
                      position: 'insideTopRight',
                      fill: event.isPositive ? "#22c55e" : "#ef4444",
                      fontSize: 11
                    }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Tabela de informações sobre o cenário */}
        <div className="mt-6 border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="py-2 px-3 text-left font-medium">Detalhe</th>
                <th className="py-2 px-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3">Aporte Mensal Necessário</td>
                <td className="py-2 px-3 text-right">{formatCurrency(projection.aporteMensal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Investimentos Financeiros Alvo</td>
                <td className="py-2 px-3 text-right">{formatCurrency(Math.round(projection.capitalNecessario))}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Retirada Mensal Planejada</td>
                <td className="py-2 px-3 text-right">{formatCurrency(rendaMensal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Duração do Patrimônio</td>
                <td className="py-2 px-3 text-right">
                  {projection.idadeEsgotamento ?
                    `Até os ${projection.idadeEsgotamento} anos (${projection.idadeEsgotamento - idadeAposentadoria} anos)` :
                    `Até os ${lifeExpectancy} anos`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementProjectionChart;