import { useState, useEffect } from "react";
import { Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VacancyCard } from "@/components/VacancyCard";
import { VacancyCardSkeleton } from "@/components/VacancyCardSkeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { vacanciesApi, applicationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

interface Vacancy {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  maxApplicants: number;
  currentApplicants: number;
  isActive: boolean;
}

interface Application {
  id: string;
  vacancyId: string;
  status: string;
}

export default function Vacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  // Extraemos user e isLoading del contexto de autenticación
  const { user } = useAuth();
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Cálculos seguros con encadenamiento opcional
  const activeApplicationsCount =
    user && Array.isArray(applications)
      ? applications.filter(
          (app) => app.status === "pendiente" || app.status === "aceptada"
        ).length
      : 0;

  const canApply = user?.role === "CODER" && activeApplicationsCount < 3;

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Solo pedimos aplicaciones si sabemos que el usuario es CODER
      const [vacanciesRes, applicationsRes] = await Promise.all([
        vacanciesApi.getAll({
          title: debouncedSearch || undefined,
          includeInactive:
            user && (user.role === "ADMIN" || user.role === "GESTOR"),
        }),
        user?.role === "CODER"
          ? applicationsApi.getMyApplications()
          : Promise.resolve([]),
      ]);

      // El backend devuelve { data: Vacancy[], meta: {...} }
      const raw = Array.isArray(vacanciesRes)
        ? vacanciesRes
        : (vacanciesRes as any)?.data || [];

      // Normalizar cada vacante al shape que esperamos en el frontend
      const vacanciesList = (raw as any[]).map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        company: v.company,
        location: v.location,
        // El backend puede devolver `salaryRange` (string) o `salary` numérico
        salary: typeof v.salary === "number" ? v.salary : undefined,
        salaryRange: v.salaryRange ?? (v.salary ? String(v.salary) : undefined),
        maxApplicants: v.maxApplicants ?? 0,
        currentApplicants: Array.isArray(v.applications)
          ? v.applications.length
          : 0,
        isActive: v.isActive,
      }));

      setVacancies(vacanciesList);
      setApplications(Array.isArray(applicationsRes) ? applicationsRes : []);
    } catch (error: any) {
      console.error("Error cargando vacantes:", error);
      setVacancies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (vacancyId: string) => {
    if (!canApply) return;
    setApplyingTo(vacancyId);
    try {
      await applicationsApi.apply(vacancyId);
      toast.success("¡Postulación enviada!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error al postularse");
    } finally {
      setApplyingTo(null);
    }
  };

  const hasApplied = (vacancyId: string) => {
    return (
      Array.isArray(applications) &&
      applications.some((app) => app.vacancyId === vacancyId)
    );
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-primary" />
              Explorar Vacantes
            </h1>
            {/* Solo mostramos info de aplicaciones si el usuario existe y es CODER */}
            {user?.role === "CODER" && (
              <p className="text-muted-foreground mt-1">
                Aplicaciones activas:{" "}
                <span
                  className={
                    activeApplicationsCount >= 3
                      ? "text-warning"
                      : "text-primary"
                  }
                >
                  {activeApplicationsCount}/3
                </span>
              </p>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <VacancyCardSkeleton key={i} />
            ))}
          </div>
        ) : vacancies.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No se encontraron vacantes
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacancies.map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                {...vacancy}
                onApply={() => handleApply(vacancy.id)}
                isApplying={applyingTo === vacancy.id}
                hasApplied={hasApplied(vacancy.id)}
                canApply={canApply}
                showAdminActions={
                  user?.role === "ADMIN" || user?.role === "GESTOR"
                }
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
