import { MapPin, DollarSign, Users, Building2, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VacancyCardProps {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  maxApplicants?: number;
  currentApplicants?: number;
  isActive: boolean;
  onApply?: () => void;
  onManage?: () => void;
  isApplying?: boolean;
  hasApplied?: boolean;
  canApply?: boolean;
  showAdminActions?: boolean;
}

export function VacancyCard({
  title,
  description,
  company,
  location,
  salary,
  salaryRange,
  maxApplicants,
  currentApplicants,
  isActive,
  onApply,
  onManage,
  isApplying,
  hasApplied,
  canApply = true,
  showAdminActions = false,
}: VacancyCardProps) {
  const safeCurrent = Number(currentApplicants ?? 0);
  const safeMax = Number(maxApplicants ?? 0);
  const isFull = safeMax > 0 ? safeCurrent >= safeMax : false;
  const spotsLeft = safeMax - safeCurrent;

  const formattedSalary = salaryRange
    ? salaryRange
    : typeof salary === "number" && !isNaN(salary)
    ? `$${salary.toLocaleString()}`
    : "—";

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="secondary">Inactiva</Badge>;
    }
    if (isFull) {
      return <Badge className="badge-warning">Vacante Llena</Badge>;
    }
    return <Badge className="badge-success">Activa</Badge>;
  };

  return (
    <Card className="card-hover bg-card border-border overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Building2 size={14} />
              <span className="text-sm">{company}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-primary" />
            <span className="text-muted-foreground truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-primary" />
            <span className="text-muted-foreground">{formattedSalary}</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Users size={14} className="text-primary" />
            <span
              className={cn("text-muted-foreground", isFull && "text-warning")}
            >
              {safeCurrent}/{safeMax} postulantes
              {!isFull && safeMax > 0 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  ({spotsLeft} lugares)
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border pt-4 gap-2">
        {showAdminActions ? (
          <Button variant="outline" className="w-full" onClick={onManage}>
            Gestionar
          </Button>
        ) : (
          <>
            {hasApplied ? (
              <Button variant="secondary" className="w-full" disabled>
                <Clock size={16} className="mr-2" />
                Ya postulado
              </Button>
            ) : (
              <Button
                variant={
                  isFull || !canApply || !isActive ? "secondary" : "default"
                }
                className="w-full"
                onClick={onApply}
                disabled={isFull || !canApply || !isActive || isApplying}
              >
                {isApplying
                  ? "Postulando..."
                  : isFull
                  ? "Vacante Llena"
                  : !canApply
                  ? "Límite alcanzado"
                  : !isActive
                  ? "No disponible"
                  : "Postularse"}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
