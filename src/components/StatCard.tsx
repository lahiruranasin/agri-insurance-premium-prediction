interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
}

export default function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="bg-gray-100/50 p-6 rounded-xl border border-gray-200 flex flex-col gap-1 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-black text-gray-800">{value}</span>
        {unit && <span className="text-sm font-bold text-gray-600">{unit}</span>}
      </div>
    </div>
  );
}
