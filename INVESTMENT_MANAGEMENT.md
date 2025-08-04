# Gestão de Investimentos - Nova Seção

## Visão Geral

A seção de **Gestão de Investimentos** foi adicionada ao relatório financeiro para comparar os investimentos atuais do cliente com as sugestões personalizadas da Alta Vista. Esta seção oferece uma análise detalhada do portfólio atual e recomendações para otimização.

## Funcionalidades

### 1. Visão Geral do Perfil
- **Perfil do Investidor**: Exibe o perfil de risco definido (Conservador, Moderado, Agressivo)
- **Score de Diversificação**: Avaliação da diversificação atual do portfólio (0-100%)
- **Score de Gestão de Risco**: Análise da adequação do risco ao perfil (0-100%)
- **Score de Liquidez**: Avaliação da facilidade de resgate dos investimentos (0-100%)

### 2. Comparação de Investimentos

#### Investimentos Atuais
- Gráfico de pizza mostrando a alocação atual
- Lista detalhada com:
  - Tipo de investimento
  - Valor investido
  - Percentual do portfólio
  - Nível de risco (Baixo/Médio/Alto)
  - Liquidez (Alta/Média/Baixa)
  - Rentabilidade esperada

#### Sugestão Alta Vista
- Gráfico de pizza com a alocação recomendada
- Mesma estrutura de detalhamento dos investimentos atuais
- Foco na otimização baseada no perfil do cliente

### 3. Análise de Impacto
- **Rentabilidade Esperada**: Melhoria percentual esperada
- **Redução de Risco**: Diminuição da volatilidade do portfólio
- **Melhoria na Liquidez**: Aumento da facilidade de resgate

### 4. Recomendações Específicas
- Lista de ações recomendadas para otimizar o portfólio
- Foco em diversificação, gestão de risco e liquidez

## Estrutura de Dados

```typescript
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
```

## Tipos de Investimentos Suportados

- **Tesouro Direto**: Títulos públicos federais
- **CDB**: Certificados de Depósito Bancário
- **Ações**: Investimentos em renda variável
- **Fundos Imobiliários**: FIIs
- **Previdência**: Planos de previdência privada
- **Internacional**: Ativos internacionais
- **Fundos de Investimento**: Fundos especializados

## Cores e Estilização

A seção utiliza um esquema de cores específico para investimentos:
- **Primary**: #6366F1 (Índigo)
- **Success**: #10B981 (Esmeralda)
- **Warning**: #F59E0B (Âmbar)
- **Danger**: #EF4444 (Vermelho)
- **Info**: #3B82F6 (Azul)
- **Accent**: #8B5CF6 (Roxo)

## Integração

### Navegação
- Adicionada à navegação por pontos (DotNavigation)
- Incluída nos controles de visibilidade de seções
- Posicionada entre "Resumo Financeiro" e "Aposentadoria"

### Dados
- Os dados podem vir da API (`userReports?.investimentos`)
- Dados mock disponíveis para demonstração
- Estrutura flexível para diferentes tipos de investimentos

## Responsividade

- Layout responsivo com grid adaptativo
- Gráficos otimizados para mobile
- Navegação touch-friendly
- Controles de visibilidade adaptados

## Acessibilidade

- Labels ARIA apropriados
- Contraste de cores adequado
- Navegação por teclado
- Tooltips informativos

## Próximas Melhorias

1. **Gráficos Interativos**: Adicionar interatividade aos gráficos
2. **Simulador de Cenários**: Permitir simulação de diferentes alocações
3. **Histórico de Performance**: Mostrar evolução do portfólio ao longo do tempo
4. **Comparação com Benchmarks**: Comparar performance com índices de referência
5. **Alertas de Rebalanceamento**: Notificações quando rebalanceamento for necessário 