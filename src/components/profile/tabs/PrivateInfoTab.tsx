'use client';

import { useState } from 'react';
import type { PrivateInfo, BankDetails, CompanyIdentifiers, ProfileInfo } from "@/lib/types";
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';
import { useRouter } from 'next/navigation';

interface PrivateInfoTabProps {
  employeeId?: string;
  privateInfo: PrivateInfo;
  bankDetails: BankDetails;
  companyIdentifiers: CompanyIdentifiers;
  profileInfo: ProfileInfo;
  canEdit: boolean;
  isAdmin?: boolean;
}

export function PrivateInfoTab({
  employeeId = 'me',
  privateInfo,
  bankDetails,
  companyIdentifiers,
  profileInfo,
  canEdit,
  isAdmin = false,
}: PrivateInfoTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state for editing
  const [formData, setFormData] = useState({
    date_of_birth: privateInfo.dateOfBirth,
    address: privateInfo.residentialAddress,
    nationality: privateInfo.nationality,
    personal_email: privateInfo.personalEmail,
    gender: privateInfo.gender,
    marital_status: privateInfo.maritalStatus,
    date_of_joining: privateInfo.dateOfJoining,
    bank_name: bankDetails.bankName,
    bank_account: bankDetails.accountNumber,
    ifsc_code: bankDetails.ifscCode,
    pan_number: companyIdentifiers.panNumber,
    uan_number: companyIdentifiers.uanNumber,
    about: profileInfo.about,
    phone: '', // Pass via employee object normally, let's keep it simple
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        <Section title="Personal Information" icon="👤">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SketchyInput label="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <SketchyInput label="Personal Email" value={formData.personal_email} onChange={e => setFormData({...formData, personal_email: e.target.value})} />
            
            {isAdmin && (
              <>
                <SketchyInput type="date" label="Date of Birth" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                <SketchyInput label="Nationality" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                <SketchyInput label="Gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} />
                <SketchyInput label="Marital Status" value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value as any})} />
                <SketchyInput type="date" label="Date of Joining" value={formData.date_of_joining} onChange={e => setFormData({...formData, date_of_joining: e.target.value})} />
              </>
            )}
          </div>
        </Section>

        {isAdmin && (
          <>
            <Section title="Bank Details" icon="🏦">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SketchyInput label="Account Number" value={formData.bank_account} onChange={e => setFormData({...formData, bank_account: e.target.value})} />
                <SketchyInput label="Bank Name" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} />
                <SketchyInput label="IFSC Code" value={formData.ifsc_code} onChange={e => setFormData({...formData, ifsc_code: e.target.value})} />
              </div>
            </Section>

            <Section title="Company Identifiers" icon="🆔">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SketchyInput label="PAN Number" value={formData.pan_number} onChange={e => setFormData({...formData, pan_number: e.target.value})} />
                <SketchyInput label="UAN Number" value={formData.uan_number} onChange={e => setFormData({...formData, uan_number: e.target.value})} />
              </div>
            </Section>
          </>
        )}

        <div className="flex gap-4 mt-6">
          <SketchyButton type="submit" variant="cta" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</SketchyButton>
          <SketchyButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</SketchyButton>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {canEdit && (
        <div className="absolute top-0 right-0 z-10">
          <SketchyButton variant="secondary" onClick={() => setIsEditing(true)}>
            ✏️ Edit Details
          </SketchyButton>
        </div>
      )}

      {/* Personal Information */}
      <Section title="Personal Information" icon="👤">
        <div className="info-grid mt-4">
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
    <div className="sketchy-card p-6 relative mt-4">
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
