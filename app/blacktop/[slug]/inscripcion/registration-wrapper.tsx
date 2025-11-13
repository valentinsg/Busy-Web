'use client';

import { RegistrationForm } from '@/components/blacktop/registration-form';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/blacktop';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface RegistrationWrapperProps {
  tournament: Tournament;
  slug: string;
}

export default function RegistrationWrapper({ tournament, slug }: RegistrationWrapperProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: tournament.primary_color,
        color: '#ffffff',
      }}
    >
      <div className="max-w-4xl mx-auto font-body">
        {/* Solo mostrar el botón Volver si NO hay éxito */}
        {!isSuccess && (
          <div className="pt-24 pb-4">
            <Link href={`/blacktop/${slug}`}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        )}

        {/* Agregar padding top cuando hay éxito para compensar la falta del botón */}
        <div className={isSuccess ? 'pt-24' : ''}>
          <RegistrationForm 
            tournament={tournament} 
            onSuccessChange={setIsSuccess}
          />
        </div>
      </div>
    </div>
  );
}
