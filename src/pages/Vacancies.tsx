import { useState, useEffect } from 'react';
import { Search, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { VacancyCard } from '@/components/VacancyCard';
import { VacancyCardSkeleton } from '@/components/VacancyCardSkeleton';
import { MainLayout } from '@/components/layout/MainLayout';
import { vacanciesApi, applicationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const debouncedSearch = useDebounce(searchTerm, 300);

  const activeApplicationsCount = applications.filter(
    (app) => app.status === 'pendiente' || app.status === 'aceptada'
  ).length;
  const canApply = user?.role === 'CODER' && activeApplicationsCount < 3;

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [vacanciesRes, applicationsRes] = await Promise.all([
        vacanciesApi.getAll({ title: debouncedSearch || undefined }),
        user?.role === 'CODER' ? applicationsApi.getMyApplications() : Promise.resolve({ data: [] }),
      ]);

      const vacanciesData = vacanciesRes.data as any;
      setVacancies(vacanciesData?.items || vacanciesData || []);
      setApplications((applicationsRes.data as Application[]) || []);
    } catch (error: any) {
      toast.error('Error al cargar vacantes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (vacancyId: string) => {
    if (!canApply) {
      toast.error('Has alcanzado el límite de 3 aplicaciones activas');
      return;
    }

    setApplyingTo(vacancyId);

    try {
      await applicationsApi.apply(vacancyId);
      toast.success('¡Postulación enviada exitosamente!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al postularse');
    } finally {
      setApplyingTo(null);
    }
  };

  const hasApplied = (vacancyId: string) => {
    return applications.some((app) => app.vacancyId === vacancyId);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-primary" />
              Explorar Vacantes
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'CODER' && (
                <span>
                  Aplicaciones activas: <span className={activeApplicationsCount >= 3 ? 'text-warning' : 'text-primary'}>{activeApplicationsCount}/3</span>
                </span>
              )}
            </p>
          </div>

          {/* Search */}
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

        {/* Vacancies Grid */}
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
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'No hay vacantes disponibles en este momento'}
            </p>
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
                showAdminActions={user?.role === 'ADMIN' || user?.role === 'GESTOR'}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
