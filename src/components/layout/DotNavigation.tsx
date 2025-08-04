import React from 'react';
import { cn } from '@/lib/utils';
import { useSectionObserver } from '@/hooks/useSectionObserver';

// Definição das seções usando os mesmos IDs e ícones do componente original
const sections = [
  { id: 'cover', label: 'Capa' },
  { id: 'summary', label: 'Resumo Financeiro' },
  { id: 'investment-management', label: 'Gestão de Investimentos' },
  { id: 'retirement', label: 'Aposentadoria' },
  { id: 'beach-house', label: 'Imóvel' },
  { id: 'tax', label: 'Planejamento Tributário' },
  { id: 'protection', label: 'Proteção Patrimonial' },
  { id: 'succession', label: 'Planejamento Sucessório' },
  { id: 'action-plan', label: 'Plano de Ação' }
];

export function DotNavigation() {
  const { activeSection, navigateToSection } = useSectionObserver();
  const activeIndex = sections.findIndex(section => section.id === activeSection);

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
      <div className="flex flex-col items-center">
        {/* Linha de progresso */}
        <div className="absolute w-0.5 h-full bg-border rounded-full">
          <div 
            className="w-0.5 bg-accent rounded-full transition-all duration-500"
            style={{
              height: `${(activeIndex / (sections.length - 1)) * 100}%`,
              maxHeight: activeIndex === 0 ? '0%' : '100%'
            }}
          />
        </div>

        {/* Indicadores de navegação */}
        <div className="flex flex-col space-y-6 relative">
          {sections.map((section, index) => {
            const isActive = section.id === activeSection;
            const isPast = index < activeIndex;

            return (
              <button
                key={section.id}
                onClick={() => navigateToSection(section.id)}
                className="group relative outline-none focus:ring-0"
                aria-label={`Ir para ${section.label}`}
              >
                {/* Tooltip */}
                <span className="absolute right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-3 py-1 bg-card rounded-md shadow-md border border-border text-sm transform -translate-y-1/2">
                  {section.label}
                </span>
                
                {/* Ponto de navegação */}
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300 relative z-10",
                    isActive
                      ? "bg-accent scale-125" 
                      : isPast
                        ? "bg-accent/70" 
                        : "bg-muted hover:bg-accent/30"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MobileDotNavigation() {
  const { activeSection, navigateToSection } = useSectionObserver();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center md:hidden">
      <div className="flex space-x-4 px-4 py-3 bg-card/80 backdrop-blur-md rounded-full border border-border shadow-lg">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          
          return (
            <button
              key={section.id}
              onClick={() => navigateToSection(section.id)}
              className="outline-none focus:ring-0"
              aria-label={`Ir para ${section.label}`}
            >
              <div 
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-accent scale-125" 
                    : "bg-muted hover:bg-accent/30"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
} 