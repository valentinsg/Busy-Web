-- Insert initial playlists
INSERT INTO public.playlists (slug, title, description, spotify_url, genre, is_published, order_index)
VALUES
  (
    'hip-hop-old-school',
    'Hip Hop Old School',
    'Los clásicos del hip hop que marcaron una era. Desde los pioneros del género hasta los íconos del golden age. Beats legendarios y letras que definieron la cultura urbana.',
    'https://open.spotify.com/playlist/48FXjSdSQZn76VvMTYmkBn?si=ccIj6gAPRVWYcEALZOpmoQ&pi=aaoW9M4LQqacK',
    'Hip Hop',
    true,
    1
  ),
  (
    'busy-trap-nights',
    'Busy Trap Nights',
    'La mejor selección de trap para tus noches. Beats oscuros, flows pesados y la energía que necesitás para moverte. Actualizada semanalmente con los tracks más duros del momento.',
    'https://open.spotify.com/playlist/40084VKzxjlQmIqxLPBa4p?si=JfwrYG0cR5quSdlIR6CyTA&pi=ZeuQEc5qRHqJ6',
    'Trap',
    true,
    2
  )
ON CONFLICT (slug) DO NOTHING;
