import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstantNavigation } from "@/hooks/useInstantNavigation";
import { useInstantFeedback } from "@/hooks/useInstantFeedback";
import { useQuery } from "@tanstack/react-query";

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: string;
}

export function Register() {
  const { navigateInstantly } = useInstantNavigation();
  const { createInstantClickHandler } = useInstantFeedback();

  // Configuraciones del sitio
  const { data: configs = [] } = useQuery<SiteConfig[]>({
    queryKey: ["/api/site-configs"],
  });

  const logoUrl = configs.find(c => c.key === 'logo_url')?.value || 'https://i.postimg.cc/3R2Nzj1g/untitled-0-removebg-preview.png';
  const siteName = configs.find(c => c.key === 'site_name')?.value || 'FULLTECH';

  const handlePhoneAuth = () => {
    navigateInstantly('/phone-auth');
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLoginRedirect = () => {
    navigateInstantly('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-3">
      <div className="w-full max-w-md">
        {/* BOTÓN VOLVER AL CATÁLOGO */}
        <div className="mb-3 text-center">
          <Button
            variant="ghost" 
            onClick={createInstantClickHandler(() => navigateInstantly('/'))}
            className="text-white/70 hover:text-white hover:bg-white/10 text-sm py-1 px-3 transition-all duration-100"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Volver al Catálogo
          </Button>
        </div>

        {/* 🚫 REGISTRO TEMPORALMENTE DESHABILITADO */}
        <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl relative overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <i className="fas fa-exclamation-triangle text-2xl text-white"></i>
            </div>
            <CardTitle className="text-2xl text-white mb-3">{siteName}</CardTitle>
            <p className="text-orange-100 text-lg font-semibold mb-2">
              Registro Temporalmente Deshabilitado
            </p>
            <p className="text-white/70 text-sm">
              El sistema de cuentas de usuario está temporalmente deshabilitado.
            </p>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="space-y-4">
              <Button
                onClick={createInstantClickHandler(() => navigateInstantly('/admin/login'))}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-user-shield mr-2"></i>
                Acceso de Administrador
              </Button>
              
              <div className="text-center">
                <p className="text-white/60 text-xs">
                  Solo administradores pueden acceder al sistema actualmente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}