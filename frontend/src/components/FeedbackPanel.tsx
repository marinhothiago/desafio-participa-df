import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { api, type EntityFeedback, type FeedbackRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, Edit2, Loader2, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Tipos de PII disponíveis para reclassificação
const PII_TYPES = [
    'CPF', 'CNPJ', 'RG', 'CNH', 'PIS', 'CNS', 'TITULO_ELEITOR', 'PASSAPORTE', 'CTPS',
    'EMAIL', 'TELEFONE', 'CELULAR', 'TELEFONE_INTERNACIONAL',
    'ENDERECO', 'CEP', 'ENDERECO_BRASILIA',
    'NOME', 'NOME_COMPLETO',
    'PIX', 'CONTA_BANCARIA', 'CARTAO_CREDITO',
    'PLACA_VEICULO', 'PROCESSO_CNJ', 'MATRICULA',
    'CID', 'DADO_BIOMETRICO', 'MENOR_IDENTIFICADO',
    'IP_ADDRESS', 'COORDENADAS_GPS', 'USER_AGENT',
    'OUTRO'
];

interface EntityFeedbackItemProps {
    entity: {
        tipo: string;
        valor: string;
        confianca?: number;
        fonte?: string;
    };
    onFeedback: (feedback: EntityFeedback) => void;
    disabled?: boolean;
}

export function EntityFeedbackItem({ entity, onFeedback, disabled = false }: EntityFeedbackItemProps) {
    const [selectedValidation, setSelectedValidation] = useState<'CORRETO' | 'INCORRETO' | 'PARCIAL' | null>(null);
    const [showReclassify, setShowReclassify] = useState(false);
    const [newType, setNewType] = useState<string>('');
    const [comment, setComment] = useState('');

    const handleValidation = (validacao: 'CORRETO' | 'INCORRETO' | 'PARCIAL') => {
        setSelectedValidation(validacao);

        if (validacao === 'PARCIAL') {
            setShowReclassify(true);
        } else {
            onFeedback({
                tipo: entity.tipo,
                valor: entity.valor,
                confianca_modelo: entity.confianca ?? 0,
                fonte: entity.fonte,
                validacao_humana: validacao,
                comentario: comment || undefined,
            });
        }
    };

    const handleReclassify = () => {
        onFeedback({
            tipo: entity.tipo,
            valor: entity.valor,
            confianca_modelo: entity.confianca ?? 0,
            fonte: entity.fonte,
            validacao_humana: 'PARCIAL',
            tipo_corrigido: newType || undefined,
            comentario: comment || undefined,
        });
        setShowReclassify(false);
    };

    return (
        <div className={cn(
            "flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors",
            selectedValidation === 'CORRETO' && "bg-success/10 border-success/30",
            selectedValidation === 'INCORRETO' && "bg-destructive/10 border-destructive/30",
            selectedValidation === 'PARCIAL' && "bg-warning/10 border-warning/30",
            !selectedValidation && "bg-muted/50 border-border"
        )}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{entity.tipo}</span>
                    {entity.confianca !== undefined && (
                        <span className="text-xs text-muted-foreground">
                            ({(entity.confianca * 100).toFixed(0)}%)
                        </span>
                    )}
                </div>
                <p className="text-sm font-mono truncate" title={entity.valor}>
                    {entity.valor}
                </p>
            </div>

            <TooltipProvider>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant={selectedValidation === 'CORRETO' ? 'default' : 'outline'}
                                className={cn(
                                    "h-8 w-8 p-0",
                                    selectedValidation === 'CORRETO' && "bg-success hover:bg-success/90"
                                )}
                                onClick={() => handleValidation('CORRETO')}
                                disabled={disabled}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Correto - É PII</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant={selectedValidation === 'INCORRETO' ? 'default' : 'outline'}
                                className={cn(
                                    "h-8 w-8 p-0",
                                    selectedValidation === 'INCORRETO' && "bg-destructive hover:bg-destructive/90"
                                )}
                                onClick={() => handleValidation('INCORRETO')}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Incorreto - Falso Positivo</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant={selectedValidation === 'PARCIAL' ? 'default' : 'outline'}
                                className={cn(
                                    "h-8 w-8 p-0",
                                    selectedValidation === 'PARCIAL' && "bg-warning hover:bg-warning/90"
                                )}
                                onClick={() => handleValidation('PARCIAL')}
                                disabled={disabled}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Reclassificar Tipo</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>

            {/* Dialog de Reclassificação */}
            <Dialog open={showReclassify} onOpenChange={setShowReclassify}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reclassificar Entidade</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Valor detectado:</p>
                            <p className="font-mono text-sm bg-muted p-2 rounded">{entity.valor}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Tipo original: <strong>{entity.tipo}</strong></p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo correto:</label>
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo correto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PII_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Comentário (opcional):</label>
                            <Textarea
                                placeholder="Ex: É nome de rua, não pessoa..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReclassify(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleReclassify}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface FeedbackPanelProps {
    analysisId?: string;
    originalText: string;
    entities: Array<{
        tipo: string;
        valor: string;
        confianca?: number;
        fonte?: string;
    }>;
    classificacao: string;
    onFeedbackSubmitted?: () => void;
}

export function FeedbackPanel({
    analysisId,
    originalText,
    entities,
    classificacao,
    onFeedbackSubmitted
}: FeedbackPanelProps) {
    const [entityFeedbacks, setEntityFeedbacks] = useState<EntityFeedback[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [classificacaoCorrigida, setClassificacaoCorrigida] = useState<string | null>(null);

    const handleEntityFeedback = (feedback: EntityFeedback) => {
        setEntityFeedbacks(prev => {
            // Remove feedback anterior para mesma entidade
            const filtered = prev.filter(f => f.valor !== feedback.valor);
            return [...filtered, feedback];
        });
    };

    const handleSubmit = async () => {
        if (entityFeedbacks.length === 0) {
            toast.error('Valide pelo menos uma entidade antes de enviar');
            return;
        }

        setIsSubmitting(true);
        try {
            const feedbackRequest: FeedbackRequest = {
                analysis_id: analysisId,
                original_text: originalText,
                entity_feedbacks: entityFeedbacks,
                classificacao_modelo: classificacao,
                classificacao_corrigida: classificacaoCorrigida ?? undefined,
            };

            const response = await api.submitFeedback(feedbackRequest);

            toast.success(`Feedback enviado! Acurácia atual: ${(response.stats.accuracy * 100).toFixed(1)}%`);
            setSubmitted(true);
            onFeedbackSubmitted?.();
        } catch (error) {
            toast.error('Erro ao enviar feedback. Tente novamente.');
            console.error('Erro ao enviar feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const allValidated = entityFeedbacks.length === entities.length;
    const validatedCount = entityFeedbacks.length;

    if (submitted) {
        return (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                <Check className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-success">Feedback enviado com sucesso!</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Obrigado por ajudar a melhorar o sistema.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Validar Detecção</span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {validatedCount}/{entities.length} validados
                </span>
            </div>

            {/* Lista de entidades para validar */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {entities.map((entity, index) => (
                    <EntityFeedbackItem
                        key={`${entity.tipo}-${entity.valor}-${index}`}
                        entity={entity}
                        onFeedback={handleEntityFeedback}
                        disabled={isSubmitting}
                    />
                ))}
            </div>

            {/* Opção para corrigir classificação geral */}
            {classificacao === 'NÃO PÚBLICO' && (
                <div className="flex items-center gap-2 pt-2 border-t">
                    <input
                        type="checkbox"
                        id="corrigir-classificacao"
                        className="rounded border-border"
                        onChange={(e) => setClassificacaoCorrigida(e.target.checked ? 'PÚBLICO' : null)}
                    />
                    <label htmlFor="corrigir-classificacao" className="text-sm text-muted-foreground">
                        Na verdade, este texto é <strong>PÚBLICO</strong> (sem PII real)
                    </label>
                </div>
            )}

            {/* Botão de enviar */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || entityFeedbacks.length === 0}
                className="w-full"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        Enviar Feedback ({validatedCount} {validatedCount === 1 ? 'entidade' : 'entidades'})
                    </>
                )}
            </Button>

            {!allValidated && (
                <p className="text-xs text-muted-foreground text-center">
                    Valide todas as entidades para feedback completo
                </p>
            )}
        </div>
    );
}
