interface ExperienceItemProps {
  company: string;
  role: string;
  period: string;
  responsibilities: string[];
}

export function ExperienceItem({
  company,
  role,
  period,
  responsibilities,
}: ExperienceItemProps) {
  return (
    <div className="border border-border rounded bg-white p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-2">
        <div>
          <h3>{role}</h3>
          <div className="text-sm text-muted-foreground">{company}</div>
        </div>
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {period}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {responsibilities.map((item, index) => (
          <li key={index} className="text-sm flex gap-3">
            <span className="text-[--mint] font-mono">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
