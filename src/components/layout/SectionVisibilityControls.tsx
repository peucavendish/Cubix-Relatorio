import React, { useState } from 'react';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { useSectionVisibility } from '@/context/SectionVisibilityContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Configuração das seções com ícones e descrições
const SECTIONS_CONFIG = [
  {
    id: "summary",
    label: "Resumo Financeiro",
    description: "Visão geral da situação financeira atual",
    icon: "📊"
  },
  {
    id: "investment-management",
    label: "Gestão de Investimentos",
    description: "Comparação de investimentos atuais vs. sugestões",
    icon: "📈"
  },
  {
    id: "retirement",
    label: "Aposentadoria",
    description: "Planejamento para aposentadoria",
    icon: "🏖️"
  },
  {
    id: "beach-house",
    label: "Aquisição de Imóveis",
    description: "Planejamento para aquisição de imóveis",
    icon: "🏠"
  },
  {
    id: "tax",
    label: "Planejamento Tributário",
    description: "Estratégias de otimização fiscal",
    icon: "💰"
  },
  {
    id: "protection",
    label: "Proteção Patrimonial",
    description: "Proteção do patrimônio e seguros",
    icon: "🛡️"
  },
  {
    id: "succession",
    label: "Planejamento Sucessório",
    description: "Transferência de patrimônio",
    icon: "👥"
  },
  {
    id: "action-plan",
    label: "Plano de Ação",
    description: "Ações prioritárias e cronograma",
    icon: "📋"
  }
];

interface SectionVisibilityControlsProps {
  className?: string;
}

const SectionVisibilityControls: React.FC<SectionVisibilityControlsProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { hiddenSections, toggleSectionVisibility, isSectionVisible } = useSectionVisibility();

  const visibleSectionsCount = SECTIONS_CONFIG.filter(section => isSectionVisible(section.id)).length;
  const hiddenSectionsCount = SECTIONS_CONFIG.length - visibleSectionsCount;

  return (
    <>
      <div
        className={cn(
          'fixed bottom-36 right-6 z-50 flex flex-col gap-3',
          className
        )}
      >
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-accent text-white shadow-lg hover:bg-accent/90 transition-colors relative"
          aria-label="Controle de visibilidade das seções"
          title="Controle de visibilidade das seções"
        >
          <Settings size={18} />
          {hiddenSectionsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {hiddenSectionsCount}
            </Badge>
          )}
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} />
              Controle de Visibilidade das Seções
            </DialogTitle>
            <DialogDescription>
              Gerencie quais seções ficarão visíveis no relatório do cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Resumo</p>
                <p className="text-sm text-muted-foreground">
                  {visibleSectionsCount} de {SECTIONS_CONFIG.length} seções visíveis
                </p>
              </div>
              <Badge variant={hiddenSectionsCount > 0 ? "destructive" : "default"}>
                {hiddenSectionsCount} ocultas
              </Badge>
            </div>

            <div className="space-y-3">
              {SECTIONS_CONFIG.map((section) => {
                const isVisible = isSectionVisible(section.id);
                return (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      isVisible 
                        ? "bg-background border-border" 
                        : "bg-muted/30 border-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{section.icon}</div>
                      <div>
                        <h3 className="font-medium">{section.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionVisibility(section.id)}
                      className="flex items-center gap-2"
                    >
                      {isVisible ? (
                        <>
                          <Eye size={16} />
                          <span className="hidden sm:inline">Visível</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          <span className="hidden sm:inline">Oculta</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye size={16} />
                Informações Importantes
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seções ocultas não aparecerão no relatório do cliente</li>
                <li>• As configurações são salvas automaticamente</li>
                <li>• Você pode alterar a visibilidade a qualquer momento</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SectionVisibilityControls; 