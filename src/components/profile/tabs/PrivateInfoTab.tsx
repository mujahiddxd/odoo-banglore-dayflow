import type {
  PrivateInfo,
  BankDetails,
  CompanyIdentifiers,
  ProfileInfo,
} from "@/lib/types";

interface PrivateInfoTabProps {
  privateInfo: PrivateInfo;
  bankDetails: BankDetails;
  companyIdentifiers: CompanyIdentifiers;
  profileInfo: ProfileInfo;
  canEdit: boolean;
}

export function PrivateInfoTab({
  privateInfo,
  bankDetails,
  companyIdentifiers,
  profileInfo,
}: PrivateInfoTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Personal Information */}
      <Section title="Personal Information" icon="👤">
        <div className="info-grid">
          <Field label="Date of Birth" value={formatDate(privateInfo.dateOfBirth)} />
          <Field
            label="Residential Address"
            value={privateInfo.residentialAddress}
          />
          <Field label="Nationality" value={privateInfo.nationality} />
          <Field label="Personal Email" value={privateInfo.personalEmail} />
          <Field label="Gender" value={privateInfo.gender} />
          <Field label="Marital Status" value={privateInfo.maritalStatus} />
          <Field
            label="Date of Joining"
            value={formatDate(privateInfo.dateOfJoining)}
          />
        </div>
      </Section>

      {/* Bank Details */}
      <Section title="Bank Details" icon="🏦">
        <div className="info-grid">
          <Field
            label="Account Number"
            value={maskAccountNumber(bankDetails.accountNumber)}
          />
          <Field label="Bank Name" value={bankDetails.bankName} />
          <Field label="IFSC Code" value={bankDetails.ifscCode} />
        </div>
      </Section>

      {/* Company Identifiers */}
      <Section title="Company Identifiers" icon="🆔">
        <div className="info-grid">
          <Field label="PAN Number" value={companyIdentifiers.panNumber} />
          <Field label="UAN Number" value={companyIdentifiers.uanNumber} />
          <Field label="Employee Code" value={companyIdentifiers.employeeCode} />
        </div>
      </Section>

      {/* Other Profile Information */}
      <Section title="About" icon="📝">
        <div className="space-y-4">
          {profileInfo.about && (
            <div className="sketchy-card p-4">
              <p className="info-field-label mb-2">About</p>
              <p className="font-body text-sm">{profileInfo.about}</p>
            </div>
          )}
          {profileInfo.whatILoveAboutMyJob && (
            <div className="sketchy-card p-4">
              <p className="info-field-label mb-2">
                What I Love About My Job
              </p>
              <p className="font-body text-sm">
                {profileInfo.whatILoveAboutMyJob}
              </p>
            </div>
          )}
          {profileInfo.interests && (
            <div className="sketchy-card p-4">
              <p className="info-field-label mb-2">Interests & Hobbies</p>
              <p className="font-body text-sm">{profileInfo.interests}</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sketchy-card p-6">
      <h3 className="font-headline text-xl font-bold mb-4">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-field">
      <span className="info-field-label">{label}</span>
      <span className="info-field-value">{value || "—"}</span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function maskAccountNumber(num: string): string {
  if (!num || num.length < 4) return num || "—";
  return "●●●● ●●●● " + num.slice(-4);
}
