import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const colors = {
    success: 'bg-emerald-700 border-emerald-500',
    error: 'bg-red-700 border-red-500',
    info: 'bg-brand border-brand',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-lg border text-white shadow-2xl transition-all duration-300 ${colors[toast.type]}`}
      style={{ minWidth: 280 }}
    >
      <span className="text-lg font-bold">{icons[toast.type]}</span>
      <span className="font-medium text-sm">{toast.message}</span>
    </div>
  );
}
