import { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, FileText, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { VacancyCard } from '@/components/VacancyCard';
import { ApplicationCard } from '@/components/ApplicationCard';
import { VacancyCardSkeleton } from '@/components/VacancyCardSkeleton';
import { vacanciesApi, applicationsApi } from '@/lib/api';
import { toast } from 'sonner';

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
  applications?: Application[];
}

interface Application {
  id: string;
  vacancyId: string;
  vacancy?: {
    title: string;
    company: string;
  };
  user?: {
    name: string;
    email: string;
  };
  status: 'pendiente' | 'aceptada' | 'rechazada';
  createdAt: string;
}

export default function Admin() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await vacanciesApi.getAll();
      const data = response.data as any;
      setVacancies(data?.items || data || []);
    } catch (error: any) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateVacancy = async (id: string) => {
    try {
      await vacanciesApi.updateStatus(id);
      toast.success('Vacante desactivada');
      fetchVacancies();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar vacante');
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: 'aceptada' | 'rechazada') => {
    setUpdatingId(id);
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Postulación ${status}`);
      fetchVacancies();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    totalVacancies: vacancies.length,
    activeVacancies: vacancies.filter((v) => v.isActive).length,
    totalApplications: vacancies.reduce((acc, v) => acc + (v.currentApplicants || 0), 0),
    pendingApplications: vacancies.reduce(
      (acc, v) => acc + (v.applications?.filter((a) => a.status === 'pendiente').length || 0),
      0
    ),
  };

  return (
    <MainLayout>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona vacantes y postulaciones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Vacantes
              </CardTitle>
              <Briefcase className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalVacancies}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vacantes Activas
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.activeVacancies}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Postulaciones
              </CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalApplications}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
              <Users className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.pendingApplications}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vacancies" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="vacancies">Vacantes</TabsTrigger>
            <TabsTrigger value="applications">Postulaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="vacancies" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <VacancyCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    {...vacancy}
                    showAdminActions
                    onManage={() => handleDeactivateVacancy(vacancy.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vacancies.flatMap((vacancy) =>
                  (vacancy.applications || []).map((application) => (
                    <ApplicationCard
                      key={application.id}
                      id={application.id}
                      vacancyTitle={vacancy.title}
                      company={vacancy.company}
                      status={application.status}
                      appliedAt={application.createdAt}
                      showActions
                      isUpdating={updatingId === application.id}
                      onAccept={() =>
                        handleUpdateApplicationStatus(application.id, 'aceptada')
                      }
                      onReject={() =>
                        handleUpdateApplicationStatus(application.id, 'rechazada')
                      }
                    />
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
