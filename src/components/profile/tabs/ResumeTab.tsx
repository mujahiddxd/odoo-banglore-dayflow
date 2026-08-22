import type { ResumeEntry, EducationEntry, ProfileInfo } from "@/lib/types";

interface ResumeTabProps {
  resume: ResumeEntry[];
  education: EducationEntry[];
  profileInfo: ProfileInfo;
}

export function ResumeTab({ resume, education, profileInfo }: ResumeTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Skills */}
      {profileInfo.skills.length > 0 && (
        <Section title="Skills" icon="🛠️">
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
        <Section title="Certifications" icon="🏅">
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
      <Section title="Work Experience" icon="💼">
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
      <Section title="Education" icon="🎓">
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
    <div>
      <h3 className="font-headline text-xl font-bold mb-4">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
