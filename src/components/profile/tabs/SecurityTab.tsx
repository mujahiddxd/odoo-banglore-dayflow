import type { Employee } from "@/lib/types";

interface SecurityTabProps {
  employee: Employee;
  isOwnProfile: boolean;
}

export function SecurityTab({ employee, isOwnProfile }: SecurityTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">
          🛡️ Account Security
        </h3>

        <div className="info-grid">
          <div className="info-field">
            <span className="info-field-label">Email Address</span>
            <span className="info-field-value">{employee.email}</span>
          </div>
          <div className="info-field">
            <span className="info-field-label">Account Status</span>
            <span className="sketchy-badge sketchy-badge-teal">Active</span>
          </div>
          <div className="info-field">
            <span className="info-field-label">Two-Factor Authentication</span>
            <span className="sketchy-badge">Not Configured</span>
          </div>
          <div className="info-field">
            <span className="info-field-label">Last Login</span>
            <span className="info-field-value">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {isOwnProfile && (
          <div className="mt-6">
            <button className="sketchy-btn sketchy-btn-secondary" disabled>
              🔑 Change Password
            </button>
            <p className="font-body text-xs opacity-50 mt-2">
              Password management is available in the full deployment.
            </p>
          </div>
        )}
      </div>

      <div className="sticky-note sticky-note-blue max-w-md">
        <p>
          🔒 This is a demo environment. In production, security features like
          2FA, password management, and session management would be fully
          functional.
        </p>
      </div>
    </div>
  );
}
