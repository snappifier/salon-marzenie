import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      // Oferta - usługi (zachowaj deep-linki do detail/nowa)
      {source: "/admin/uslugi/:path*", destination: "/admin/oferta/uslugi/:path*", permanent: false},
      {source: "/admin/uslugi", destination: "/admin/oferta?sub=uslugi", permanent: false},
      // Oferta - kategorie
      {source: "/admin/kategorie/:path*", destination: "/admin/oferta/kategorie/:path*", permanent: false},
      {source: "/admin/kategorie", destination: "/admin/oferta?sub=kategorie", permanent: false},
      // Zespół - sub-routes pracownika jako taby (specyficzne PRZED ogólnym :id)
      {source: "/admin/pracownicy/:id/grafik", destination: "/admin/zespol/:id?tab=grafik", permanent: false},
      {source: "/admin/pracownicy/:id/uslugi", destination: "/admin/zespol/:id?tab=uslugi", permanent: false},
      {source: "/admin/pracownicy/nowy", destination: "/admin/zespol/nowy", permanent: false},
      {source: "/admin/pracownicy/:id", destination: "/admin/zespol/:id", permanent: false},
      {source: "/admin/pracownicy", destination: "/admin/zespol", permanent: false},
    ]
  },
};

export default nextConfig;
