import { Calendar, Building2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  id: string;
  vacancyTitle: string;
  company: string;
  status: 'pendiente' | 'aceptada' | 'rechazada';
  appliedAt: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  isUpdating?: boolean;
}

export function ApplicationCard({
  vacancyTitle,
  company,
  status,
  appliedAt,
  onAccept,
  onReject,
  showActions = false,
  isUpdating = false,
}: ApplicationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'aceptada':
        return <Badge className="badge-success">Aceptada</Badge>;
      case 'rechazada':
        return <Badge className="badge-destructive">Rechazada</Badge>;
      default:
        return <Badge className="badge-warning">Pendiente</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-primary" />
              <h3 className="text-base font-semibold text-foreground line-clamp-1">
                {vacancyTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 size={14} />
              <span className="text-sm">{company}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar size={14} />
          <span>Aplicado el {new Date(appliedAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</span>
        </div>

        {showActions && status === 'pendiente' && (
          <div className="flex gap-2 pt-3 border-t border-border">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              onClick={onAccept}
              disabled={isUpdating}
            >
              Aceptar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={onReject}
              disabled={isUpdating}
            >
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
