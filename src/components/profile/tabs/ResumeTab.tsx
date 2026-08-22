import type { ResumeEntry, EducationEntry, ProfileInfo } from "@/lib/types";
import Link from "next/link";
import SketchyButton from "@/components/SketchyButton";

interface ResumeTabProps {
  resume: ResumeEntry[];
  education: EducationEntry[];
  profileInfo: ProfileInfo;
}

export function ResumeTab({ resume, education, profileInfo }: ResumeTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-end mb-4">
        <Link href="/dashboard/setup-profile">
          <SketchyButton variant="secondary">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload / Update Resume
            </span>
          </SketchyButton>
        </Link>
      </div>
      {/* Skills */}
      {profileInfo.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {profileInfo.skills.map((skill) => (
              <span key={skill} className="sketchy-badge sketchy-badge-teal">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {profileInfo.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="flex flex-wrap gap-2">
            {profileInfo.certifications.map((cert) => (
              <span key={cert} className="sketchy-badge sketchy-badge-yellow">
                {cert}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Work Experience */}
      <Section title="Work Experience">
        <div className="space-y-4">
          {resume.map((entry, i) => (
            <div
              key={i}
              className="sketchy-card p-5 hover:transform-none"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-body font-semibold text-base">
                    {entry.title}
                  </h4>
                  <p className="font-body text-sm opacity-70">
                    {entry.organization}
                  </p>
                </div>
                <span className="sketchy-badge text-xs">
                  {entry.startDate} — {entry.endDate}
                </span>
              </div>
              <p className="font-body text-sm opacity-80 mt-2">
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="space-y-4">
          {education.map((entry, i) => (
            <div key={i} className="sketchy-card p-5 hover:transform-none">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-body font-semibold text-base">
                    {entry.degree}
                  </h4>
                  <p className="font-body text-sm opacity-70">
                    {entry.institution}
                  </p>
                </div>
                <div className="text-right">
                  <span className="sketchy-badge text-xs">{entry.year}</span>
                  {entry.grade && (
                    <p className="font-body text-xs opacity-60 mt-1">
                      {entry.grade}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      {/* Raw Resume Text (from upload) */}
      {(profileInfo as any).resumeText && (
        <Section title="Extracted Resume Text">
          <div className="sketchy-card p-5 whitespace-pre-wrap font-body text-sm bg-[var(--uxsg-paper)] opacity-80">
            {(profileInfo as any).resumeText}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-headline text-xl font-bold section-heading">
        {title}
      </h3>
      {children}
    </div>
  );
}
