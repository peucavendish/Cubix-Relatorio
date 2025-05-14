import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/layout/Header';
import CoverPage from '@/components/sections/CoverPage';
import FinancialSummary from '@/components/sections/FinancialSummary';
import RetirementPlanning from '@/components/sections/RetirementPlanning';
import BeachHouse from '@/components/sections/BeachHouse';
import TaxPlanning from '@/components/sections/TaxPlanning';
import ProtectionPlanning from '@/components/sections/ProtectionPlanning';
import SuccessionPlanning from '@/components/sections/SuccessionPlanning';
import ActionPlan from '@/components/sections/ActionPlan';
import FloatingActions from '@/components/layout/FloatingActions';
import { DotNavigation, MobileDotNavigation } from '@/components/layout/DotNavigation';
import { useSectionObserver } from '@/hooks/useSectionObserver';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface IndexPageProps {
  accessor?: boolean;
  clientPropect?: boolean;
}

const IndexPage: React.FC<IndexPageProps> = ({ accessor, clientPropect }) => {
  const { activeSection, navigateToSection } = useSectionObserver();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState(null);

  const getClientData = () => ({
    cliente: {
      nome: userReports?.cliente?.nome || "",
      idade: userReports?.cliente?.idade || 0,
      estadoCivil: userReports?.cliente?.estadoCivil || "",
      regimeCasamento: userReports?.cliente?.regimeCasamento || "",
      residencia: userReports?.cliente?.residencia || ""
    },
    financas: {
      patrimonioLiquido: userReports?.financas?.resumo?.patrimonio_liquido || 0,
      excedenteMensal: userReports?.financas?.resumo?.excedente_mensal || 0,
      rendas: userReports?.financas?.rendas || [],
      despesasMensais: userReports?.financas?.resumo?.despesas_mensais || 0,
      // Utilizar diretamente a composição patrimonial do JSON, sem transformação
      composicaoPatrimonial: userReports?.financas?.composicao_patrimonial || {},
      // Processar os ativos de forma dinâmica, independente do tipo
      ativos: userReports?.financas?.ativos?.map(a => ({
        tipo: a.tipo,
        valor: a.valor,
        classe: a.classe
      })) || [],
      passivos: userReports?.financas?.passivos || []
    },
    aposentadoria: {
      patrimonioLiquido: userReports?.financas?.resumo?.patrimonio_liquido || 0,
      excedenteMensal: userReports?.financas?.resumo?.excedente_mensal || 0,
      totalInvestido: userReports?.financas?.composicao_patrimonial?.Investimentos || 0,

      rendaMensalDesejada: userReports?.planoAposentadoria?.renda_desejada || 50000,
      idadeAposentadoria: userReports?.planoAposentadoria?.idade_aposentadoria || 0,
      patrimonioAlvo: userReports?.planoAposentadoria?.capital_necessario || 13068655.02,

      idadeAtual: userReports?.planoAposentadoria?.idade_atual || 0,
      expectativaVida: userReports?.planoAposentadoria?.expectativa_vida || 0,

      cenarios: userReports?.planoAposentadoria?.cenarios?.map(c => ({
        idade: c.idade_aposentadoria,
        aporteMensal: c.aporte_mensal,
        capitalNecessario: c.capital_necessario
      })) || [],

      perfilInvestidor: userReports?.perfil_investidor || "",
      alocacaoAtivos: userReports?.alocacao_ativos?.composicao?.map(a => ({
        ativo: a.ativo,
        percentual: a.percentual
      })) || [],

      anosRestantes: (userReports?.planoAposentadoria?.idade_aposentadoria || 0) -
        (userReports?.planoAposentadoria?.idade_atual || 0),
      aporteMensalRecomendado: userReports?.planoAposentadoria?.cenarios?.[0]?.aporte_mensal || 0,

      possuiPGBL: userReports?.tributario?.deducoes?.some(d => d.tipo === "PGBL") || false,
      valorPGBL: userReports?.tributario?.deducoes?.find(d => d.tipo === "PGBL")?.valor || 0,

      taxaRetiradaSegura: 0.04,
      taxaInflacao: 0.035,
      taxaJurosReal: 0.04
    },
    objetivos: userReports?.objetivos || [],
    tributario: {
      resumo: userReports?.tributario?.resumo || {},
      estruturacaoPatrimonial: userReports?.tributario?.estruturacaoPatrimonial || [],
      investimentosIsentos: userReports?.tributario?.investimentosIsentos || [],
      deducoes: userReports?.tributario?.deducoes || [],
      holdingFamiliar: userReports?.tributario?.holdingFamiliar || {},
      previdenciaVGBL: userReports?.tributario?.previdenciaVGBL || {},
      economiaTributaria: userReports?.tributario?.economiaTributaria || {}
    },
    protecao: {
      titulo: userReports?.protecao?.titulo || "Proteção Patrimonial",
      resumo: userReports?.protecao?.resumo || "Proteção do patrimônio",
      analiseNecessidades: userReports?.protecao?.analiseNecessidades || {},
      seguroVida: userReports?.protecao?.seguroVida || {},
      seguroPatrimonial: userReports?.protecao?.seguroPatrimonial || {},
      seguroDO: userReports?.protecao?.seguroDO || {},
      seguroInternacional: userReports?.protecao?.seguroInternacional || {},
      protecaoJuridica: userReports?.protecao?.protecaoJuridica || {},
      recomendacoesAdicionais: userReports?.protecao?.recomendacoesAdicionais || {}
    },
    sucessao: userReports?.sucessao || {},
    planoAcao: {
      titulo: userReports?.planoAcao?.titulo || "Plano de Ação Financeira",
      resumo: userReports?.planoAcao?.resumo || "Plano de ação financeira",
      indicadorSegurancaFinanceira: userReports?.planoAcao?.indicadorSegurancaFinanceira || {},
      cronograma: userReports?.planoAcao?.cronograma || [],
      acoesPrioritarias: userReports?.planoAcao?.acoesPrioritarias || [],
      metasCurtoPrazo: userReports?.planoAcao?.metasCurtoPrazo || [],
      acompanhamentoProgresso: userReports?.planoAcao?.acompanhamentoProgresso || {},
      conclusao: userReports?.planoAcao?.conclusao || {}
    },
    imovelDesejado: userReports?.imovelDesejado || {}
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');

        if (sessionId) {
          const apiUrl = import.meta.env.VITE_API_THE_WAY;
          const response = await axios.get(`${apiUrl}/data-extract/${sessionId}`);
          setUser(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserReportsData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');

        if (sessionId) {
          const apiUrl = import.meta.env.VITE_API_THE_WAY;
          const response = await axios.get(`${apiUrl}/client-reports/${sessionId}`);

          const reportData = JSON.parse(response.data[0].report_data);
          setUserReports(reportData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserReportsData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="relative h-screen overflow-hidden">
        <Header />
        <main className="h-[calc(100vh-64px)] overflow-y-auto">
          <div className="min-h-screen">
            <CoverPage clientData={getClientData().cliente} />
          </div>
          <div className="min-h-screen">
            <FinancialSummary data={getClientData().financas} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <RetirementPlanning data={getClientData().aposentadoria} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <BeachHouse data={userReports} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <TaxPlanning data={getClientData()} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <ProtectionPlanning data={getClientData()} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <SuccessionPlanning data={getClientData()} hideControls={clientPropect} />
          </div>
          <div className="min-h-screen">
            <ActionPlan data={getClientData()} hideControls={clientPropect} />
          </div>
        </main>
        <DotNavigation />
        <MobileDotNavigation />
        <FloatingActions userReports={userReports} />
      </div>
    </ThemeProvider>
  );
};

export default IndexPage;