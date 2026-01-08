import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { vacanciesApi } from "@/lib/api";
import { toast } from "sonner";

export default function CreateVacancy() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salaryRange: "",
    seniority: "",
    softSkills: "",
    modality: "remoto",
    maxApplicants: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      title,
      description,
      company,
      location,
      salaryRange,
      maxApplicants,
      seniority,
      softSkills,
      modality,
    } = formData;

    if (
      !title ||
      !description ||
      !company ||
      !location ||
      !salaryRange ||
      !maxApplicants ||
      !seniority ||
      !softSkills ||
      !modality
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      await vacanciesApi.create({
        title,
        description,
        company,
        location,
        seniority,
        softSkills,
        modality,
        salaryRange,
        maxApplicants: Number(maxApplicants),
      });

      toast.success("¡Vacante creada exitosamente!");
      navigate("/vacancies");
    } catch (error: any) {
      toast.error(error.message || "Error al crear la vacante");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Crear Nueva Vacante</CardTitle>
                <CardDescription>
                  Completa los detalles de la vacante
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del puesto</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: Frontend Developer"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Ej: TechCorp S.A."
                    value={formData.company}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe las responsabilidades y requisitos del puesto..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ej: Ciudad de México / Remoto"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Input
                    id="seniority"
                    name="seniority"
                    placeholder="Ej: Senior"
                    value={formData.seniority}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="softSkills">Soft Skills</Label>
                  <Input
                    id="softSkills"
                    name="softSkills"
                    placeholder="Ej: Liderazgo, Comunicación"
                    value={formData.softSkills}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modality">Modalidad</Label>
                  <select
                    id="modality"
                    name="modality"
                    value={formData.modality}
                    onChange={handleChange as any}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryRange">Rango salarial</Label>
                <Input
                  id="salaryRange"
                  name="salaryRange"
                  placeholder="Ej: $1.000.000 - $2.000.000"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxApplicants">Máximo de postulantes</Label>
                <Input
                  id="maxApplicants"
                  name="maxApplicants"
                  type="number"
                  placeholder="Ej: 10"
                  value={formData.maxApplicants}
                  onChange={handleChange}
                  disabled={isLoading}
                  min={1}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/vacancies")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="glow"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Vacante"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
