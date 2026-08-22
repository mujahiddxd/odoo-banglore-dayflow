import type { Employee } from "@/lib/types";

export function ProfileHeader({ employee }: { employee: Employee }) {
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="sketchy-card p-6 md:p-8">
      <div className="tape tape-tl" />
      <div className="tape tape-br" />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Avatar */}
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.name} className="profile-avatar shrink-0 object-cover" />
        ) : (
          <div className="profile-avatar shrink-0">{initials}</div>
        )}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-headline text-3xl font-bold mb-1">
            {employee.name}
          </h2>
          <p className="font-body text-base opacity-70 mb-4">
            {employee.position}
          </p>

          {/* Info grid */}
          <div className="info-grid">
            <InfoField label="Email" value={employee.email} icon="✉️" />
            <InfoField label="Mobile" value={employee.mobile} icon="📱" />
            <InfoField label="Company" value={employee.company} icon="🏢" />
            <InfoField label="Department" value={employee.department} icon="📂" />
            <InfoField label="Manager" value={employee.manager} icon="👔" />
            <InfoField label="Location" value={employee.location} icon="📍" />
          </div>
        </div>

        {/* Role badge */}
        <div className="shrink-0">
          <span
            className={`sketchy-badge ${employee.role === "ADMIN" ? "sketchy-badge-yellow" : "sketchy-badge-teal"}`}
          >
            {employee.role === "ADMIN" ? "🔑 Admin" : "👤 Employee"}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="info-field">
      <span className="info-field-label">
        {icon} {label}
      </span>
      <span className="info-field-value">{value}</span>
    </div>
  );
}
