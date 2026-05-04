export function SectionHeader({
  label,
  title,
  action,
}: {
  label: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="space-y-1">
        <p className="label-caps">{label}</p>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
