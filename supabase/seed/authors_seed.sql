-- Seed authors table with existing data from authors.json
-- This will populate the database with the current authors

-- Clear existing data (optional, comment out if you want to keep existing data)
-- truncate table public.authors cascade;

-- Insert authors
insert into public.authors (id, name, email, avatar_url, instagram, twitter, linkedin, medium, bio, active)
values
  (
    'default',
    'Equipo Busy',
    '',
    '/busy-gothic.png',
    'https://www.instagram.com/busy_streetwear/',
    null,
    null,
    null,
    'Equipo de Busy, creadores de la marca y entusiastas de la moda.',
    true
  ),
  (
    'agus-molina',
    'Agustín Molina',
    'agustinmancho5@gmail.com',
    '/authors/agustin-molina.jpg',
    'https://www.instagram.com/agus.mxlina/',
    null,
    null,
    null,
    'Co-Founder y Diseñador de Busy, creador de la estética de la marca y un entusiasta de la moda.',
    true
  ),
  (
    'eze-molina',
    'Ezequiel Molina',
    '',
    '',
    'https://www.instagram.com/zekee.187/',
    null,
    null,
    null,
    null,
    true
  ),
  (
    'juampi-pavone',
    'Juán Pablo Pavone',
    '',
    '',
    'https://www.instagram.com/juampi.pq/',
    null,
    null,
    null,
    'Co-Founder, Director Operativo y Logística de Busy, encargado de conectar y hacer funcionar todas las áreas de la marca.',
    true
  ),
  (
    'valentin-sg',
    'Valentín Sánchez Guevara',
    'sanchezguevara.valentin@gmail.com',
    '/authors/valentin-sg.jpg',
    'https://www.instagram.com/valensanchez.g/',
    'https://x.com/valentainn__',
    null,
    null,
    'Co-Founder de Busy, Desarrollador de Software y Director Creativo de la marca. Valentín viene de una familia de emprendedores, crecido en entornos creativos entre computadoras, instrumentos musicales, diseñadores y locutores en el estudio de marketing de su papá. Hoy se considera un entusiasta de la tecnología y los emprendimientos. Estos últimos años desarrolló un mayor interés en el mundo del marketing digital.',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  avatar_url = excluded.avatar_url,
  instagram = excluded.instagram,
  twitter = excluded.twitter,
  linkedin = excluded.linkedin,
  medium = excluded.medium,
  bio = excluded.bio,
  active = excluded.active,
  updated_at = now();
