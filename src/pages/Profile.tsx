import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User, Mail, Edit2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

function initials(name?: string) {
  if (!name) return "";
  const parts = name.includes("@")
    ? name.split("@")[0].split(".")
    : name.split(" ");
  return parts
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Profile() {
  const { user, isLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(isLoading);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    toast("Funcionalidad de edición pendiente", { type: "info" });
    console.log(user);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-95" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-20 p-6 lg:p-10 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/10 flex items-center justify-center text-2xl md:text-3xl font-extrabold text-white shadow-lg ring-4 ring-white/20">
                      {user?.name ? (
                        <span>{initials(user.name ?? user?.email)}</span>
                      ) : (
                        <User size={36} />
                      )}
                    </div>
                    <div className="absolute -right-2 -bottom-2 bg-white/10 p-1 rounded-full">
                      <Edit2 size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                    {user?.name ?? user?.email ?? "Nombre no establecido"}
                  </h1>
                  <p className="mt-2 text-sm md:text-base text-white/90 flex items-center gap-2">
                    <Mail size={14} />
                    <a
                      href={`mailto:${user?.email}`}
                      className="underline underline-offset-2"
                    >
                      {user?.email}
                    </a>
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-400" />{" "}
                      {user?.role}
                    </span>
                    <span className="text-sm text-white/80">
                      Miembro activo
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-auto flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/vacancies")}
                  >
                    <LinkIcon className="mr-2" /> Ver vacantes
                  </Button>
                  <Button onClick={handleEdit}>
                    <Edit2 className="mr-2" /> Editar perfil
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="-mt-8">
            <Card className="mx-4 lg:mx-0 relative z-30">
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold">
                        Información personal
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Aquí puedes ver los datos básicos de tu cuenta.
                      </p>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="text-xs text-muted-foreground">
                            Correo
                          </div>
                          <div className="font-medium text-foreground">
                            {user?.email}
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="text-xs text-muted-foreground">
                            Rol
                          </div>
                          <div className="font-medium text-foreground">
                            {user?.role}
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="text-xs text-muted-foreground">
                            Registrado
                          </div>
                          <div className="font-medium text-foreground">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "Fecha desconocida"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <h3 className="text-lg font-semibold">
                        Acciones rápidas
                      </h3>
                      <div className="mt-3 space-y-3">
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() =>
                            (window.location.href = "/my-applications")
                          }
                        >
                          Ver mis postulaciones
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => toast("Función pendiente")}
                        >
                          Cambiar contraseña
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            window.location.href = "/login";
                          }}
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
