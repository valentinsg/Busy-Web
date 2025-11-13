import { RegistrationForm } from '@/components/blacktop/registration-form';
import { Button } from '@/components/ui/button';
import { getTournamentBySlug } from '@/lib/repo/blacktop';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface RegistrationPageProps {
  params: {
    slug: string;
  };
}

async function RegistrationContent({ slug }: { slug: string }) {
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    notFound();
  }

  if (!tournament.registration_open) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Inscripciones cerradas</h1>
          <p className="text-muted-foreground">
            Las inscripciones para {tournament.name} están cerradas.
          </p>
          <Link href={`/blacktop/${slug}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al torneo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundColor: tournament.primary_color,
        color: '#ffffff',
      }}
    >
      <div className="max-w-4xl mx-auto font-body">
        <div className="pt-24 pb-4">
          <Link href={`/blacktop/${slug}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        <RegistrationForm tournament={tournament} />
      </div>
    </div>
  );
}

export default function RegistrationPage({ params }: RegistrationPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RegistrationContent slug={params.slug} />
    </Suspense>
  );
}
