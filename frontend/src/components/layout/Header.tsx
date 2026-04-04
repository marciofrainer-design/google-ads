import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Campanhas',
  '/reports': 'Relatórios',
};

export default function Header() {
  const location = useLocation();
  const title = Object.entries(titles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Google Ads Dashboard';

  return (
    <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
