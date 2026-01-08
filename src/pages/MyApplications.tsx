import { useState, useEffect } from "react";
import { FileText, Inbox } from "lucide-react";
import { ApplicationCard } from "@/components/ApplicationCard";
import { MainLayout } from "@/components/layout/MainLayout";
import { applicationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface Application {
  id: string;
  vacancyId: string;
  vacancy: {
    title: string;
    company: string;
  };
  status: "pendiente" | "aceptada" | "rechazada";
  createdAt: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsApi.getMyApplications();
      setApplications((response as Application[]) || []);
    } catch (error: any) {
      toast.error("Error al cargar postulaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = applications.filter(
    (app) => app.status === "pendiente" || app.status === "aceptada"
  ).length;

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" />
            Mis Postulaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Aplicaciones activas:{" "}
            <span
              className={activeCount >= 3 ? "text-warning" : "text-primary"}
            >
              {activeCount}/3
            </span>
          </p>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Sin postulaciones
            </h3>
            <p className="text-muted-foreground">
              Aún no te has postulado a ninguna vacante
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                id={application.id}
                vacancyTitle={application.vacancy?.title || "Vacante"}
                company={application.vacancy?.company || "Empresa"}
                status={application.status}
                appliedAt={application.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
