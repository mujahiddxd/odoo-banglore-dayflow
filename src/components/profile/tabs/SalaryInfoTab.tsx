"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser, SalaryConfig, ComputedSalary, SalaryHistoryEntry } from "@/lib/types";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";

interface SalaryInfoTabProps {
  salary: { config: SalaryConfig; computed: ComputedSalary };
  employeeId: string;
  canEdit: boolean;
  currentUser: AuthUser;
  onSalaryUpdate: (salary: {
    config: SalaryConfig;
    computed: ComputedSalary;
  }) => void;
}

export function SalaryInfoTab({
  salary,
  employeeId,
  canEdit,
  currentUser,
  onSalaryUpdate,
}: SalaryInfoTabProps) {
  const { config, computed } = salary;
  const [editing, setEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<SalaryConfig>(config);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [history, setHistory] = useState<SalaryHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Client-side preview calculation
  const preview = useClientPreview(editConfig);

  // Fetch salary history (Admin only)
  useEffect(() => {
    if (currentUser.role === "ADMIN" && showHistory) {
      fetch(`/api/employees/${employeeId}/salary/history`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setHistory(data.data);
        });
    }
  }, [currentUser.role, employeeId, showHistory]);

  function handleEditStart() {
    setEditConfig({ ...config });
    setEditing(true);
    setSaveError(null);
  }

  function handleCancel() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/employees/${employeeId}/salary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: editConfig, reason: "Admin update" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Failed to save");
        return;
      }

      onSalaryUpdate(data.data);
      setEditing(false);
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }

  function updateWage(rupees: number) {
    const paise = rupeesToPaise(rupees);
    setEditConfig((prev) => ({
      ...prev,
      monthlyWage: paise,
      yearlyWage: paise * 12,
    }));
  }

  function updateComponentValue(name: string, value: number) {
    setEditConfig((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.name === name ? { ...c, value } : c
      ),
    }));
  }

  function updateComponentFixedValue(name: string, rupees: number) {
    setEditConfig((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.name === name ? { ...c, value: rupeesToPaise(rupees) } : c
      ),
    }));
  }

  const displayConfig = editing ? editConfig : config;
  const displayComputed = editing ? preview : computed;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Edit controls */}
      {canEdit && (
        <div className="flex justify-end gap-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="sketchy-btn sketchy-btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="sketchy-btn sketchy-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={handleEditStart}
              className="sketchy-btn sketchy-btn-yellow"
            >
              ✏️ Edit Salary
            </button>
          )}
        </div>
      )}

      {saveError && (
        <div
          className="sketchy-card p-4"
          style={{ borderColor: "#e74c3c", background: "#ffeaea" }}
        >
          <p className="font-body text-sm" style={{ color: "#e74c3c" }}>
            ⚠️ {saveError}
          </p>
        </div>
      )}

      {/* Wage Section */}
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">💰 Wage</h3>
        <div className="info-grid">
          <div className="info-field">
            <span className="info-field-label">Wage Type</span>
            <span className="info-field-value">Fixed Wage</span>
          </div>
          <div className="info-field">
            <span className="info-field-label">Monthly Wage</span>
            {editing ? (
              <input
                type="number"
                className="sketchy-input"
                value={paiseToRupees(editConfig.monthlyWage)}
                onChange={(e) => updateWage(Number(e.target.value))}
                min={0}
                step={1000}
              />
            ) : (
              <span className="info-field-value font-bold text-lg">
                {formatINR(displayComputed.monthlyWage)}
              </span>
            )}
          </div>
          <div className="info-field">
            <span className="info-field-label">Yearly Wage</span>
            <span className="info-field-value font-bold text-lg">
              {formatINR(displayComputed.yearlyWage)}
            </span>
          </div>
        </div>
      </div>

      {/* Salary Components */}
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">
          📊 Salary Components
        </h3>
        <p className="font-body text-xs opacity-50 mb-4">
          Components that allocate the gross monthly wage.
        </p>

        <div className="sketchy-border-wobble overflow-hidden">
          {displayComputed.components.map((comp) => (
            <div key={comp.name} className="salary-component">
              <div className="flex-1">
                <div className="salary-component-name">{comp.name}</div>
                <div className="salary-component-basis">
                  {getBasisLabel(comp)}
                </div>
              </div>

              {/* Editable value */}
              {editing && comp.editable ? (
                <div className="flex items-center gap-2">
                  {comp.calculationType === "PERCENTAGE" ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="sketchy-input"
                        style={{ width: "80px" }}
                        value={comp.value}
                        onChange={(e) =>
                          updateComponentValue(comp.name, Number(e.target.value))
                        }
                        min={0}
                        max={100}
                        step={0.01}
                      />
                      <span className="text-sm opacity-60">%</span>
                    </div>
                  ) : comp.calculationType === "FIXED" ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm opacity-60">₹</span>
                      <input
                        type="number"
                        className="sketchy-input"
                        style={{ width: "100px" }}
                        value={paiseToRupees(comp.value)}
                        onChange={(e) =>
                          updateComponentFixedValue(
                            comp.name,
                            Number(e.target.value)
                          )
                        }
                        min={0}
                        step={100}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Amount display */}
              <div className="text-right ml-4">
                <span className="salary-component-amount">
                  {formatINR(
                    editing
                      ? (preview?.components.find((c) => c.name === comp.name)
                          ?.computedAmount ?? comp.computedAmount)
                      : comp.computedAmount
                  )}
                </span>
                {comp.calculationType === "PERCENTAGE" && (
                  <span className="salary-component-percentage">
                    {comp.value}%
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Total */}
          <div
            className="salary-component"
            style={{
              background: "rgba(252, 221, 42, 0.1)",
              borderTop: "2px solid var(--uxsg-ink)",
            }}
          >
            <div className="salary-component-name font-bold">
              Total Components
            </div>
            <div className="salary-component-amount font-bold text-base">
              {formatINR(
                displayComputed.components.reduce(
                  (sum, c) => sum + c.computedAmount,
                  0
                )
              )}
            </div>
          </div>
        </div>

        {/* Fixed Allowance note */}
        <div className="mt-3 sticky-note sticky-note-blue text-sm">
          <p>
            💡 Fixed Allowance is automatically calculated as the remaining
            balance after all other components are allocated. It cannot be
            manually edited.
          </p>
        </div>
      </div>

      {/* Deductions */}
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">
          📉 Employee Deductions
        </h3>

        <div className="sketchy-border-wobble overflow-hidden">
          <div className="salary-component">
            <div>
              <div className="salary-component-name">
                Employee Provident Fund (PF)
              </div>
              <div className="salary-component-basis">
                {editing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      className="sketchy-input"
                      style={{ width: "60px" }}
                      value={editConfig.pfEmployeeRate}
                      onChange={(e) =>
                        setEditConfig((prev) => ({
                          ...prev,
                          pfEmployeeRate: Number(e.target.value),
                        }))
                      }
                      min={0}
                      max={100}
                      step={0.5}
                    />
                    <span className="text-xs opacity-60">% of Basic</span>
                  </div>
                ) : (
                  `${config.pfEmployeeRate}% of Basic Salary`
                )}
              </div>
            </div>
            <span className="salary-component-amount">
              {formatINR(displayComputed.employeePF)}
            </span>
          </div>

          <div className="salary-component">
            <div>
              <div className="salary-component-name">Professional Tax</div>
              <div className="salary-component-basis">
                {editing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs opacity-60">₹</span>
                    <input
                      type="number"
                      className="sketchy-input"
                      style={{ width: "80px" }}
                      value={paiseToRupees(editConfig.professionalTax)}
                      onChange={(e) =>
                        setEditConfig((prev) => ({
                          ...prev,
                          professionalTax: rupeesToPaise(
                            Number(e.target.value)
                          ),
                        }))
                      }
                      min={0}
                      step={50}
                    />
                    <span className="text-xs opacity-60">/month</span>
                  </div>
                ) : (
                  "Per month"
                )}
              </div>
            </div>
            <span className="salary-component-amount">
              {formatINR(displayComputed.professionalTax)}
            </span>
          </div>

          <div
            className="salary-component"
            style={{
              background: "rgba(231, 76, 60, 0.08)",
              borderTop: "2px solid var(--uxsg-ink)",
            }}
          >
            <div className="salary-component-name font-bold">
              Total Deductions
            </div>
            <span className="salary-component-amount font-bold">
              {formatINR(displayComputed.totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Employer Contributions */}
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">
          🏢 Employer Contributions
        </h3>
        <p className="font-body text-xs opacity-50 mb-4">
          These are NOT deducted from the employee&apos;s salary.
        </p>

        <div className="sketchy-border-wobble overflow-hidden">
          <div className="salary-component">
            <div>
              <div className="salary-component-name">Employer PF</div>
              <div className="salary-component-basis">
                {editing ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      className="sketchy-input"
                      style={{ width: "60px" }}
                      value={editConfig.pfEmployerRate}
                      onChange={(e) =>
                        setEditConfig((prev) => ({
                          ...prev,
                          pfEmployerRate: Number(e.target.value),
                        }))
                      }
                      min={0}
                      max={100}
                      step={0.5}
                    />
                    <span className="text-xs opacity-60">% of Basic</span>
                  </div>
                ) : (
                  `${config.pfEmployerRate}% of Basic Salary`
                )}
              </div>
            </div>
            <span className="salary-component-amount">
              {formatINR(displayComputed.employerPF)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Salary Summary */}
      <div className="sketchy-card p-6" style={{ background: "rgba(252, 221, 42, 0.08)" }}>
        <h3 className="font-headline text-xl font-bold mb-4">
          💵 Monthly Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-body text-sm">Gross Salary</span>
            <span className="font-body font-semibold">
              {formatINR(displayComputed.grossSalary)}
            </span>
          </div>
          <div className="flex justify-between opacity-70">
            <span className="font-body text-sm">− Total Deductions</span>
            <span className="font-body text-sm">
              {formatINR(displayComputed.totalDeductions)}
            </span>
          </div>
          <div
            className="flex justify-between pt-2 mt-2"
            style={{ borderTop: "2px solid var(--uxsg-ink)" }}
          >
            <span className="font-headline text-lg font-bold">Net Salary</span>
            <span className="font-headline text-lg font-bold">
              {formatINR(displayComputed.netSalary)}
            </span>
          </div>
        </div>
      </div>

      {/* Working Configuration */}
      <div className="sketchy-card p-6">
        <h3 className="font-headline text-xl font-bold mb-4">
          ⏰ Working Configuration
        </h3>
        <div className="info-grid">
          <div className="info-field">
            <span className="info-field-label">Working Days / Week</span>
            {editing ? (
              <input
                type="number"
                className="sketchy-input"
                value={editConfig.workingDaysPerWeek}
                onChange={(e) =>
                  setEditConfig((prev) => ({
                    ...prev,
                    workingDaysPerWeek: Number(e.target.value),
                  }))
                }
                min={1}
                max={7}
              />
            ) : (
              <span className="info-field-value">
                {displayConfig.workingDaysPerWeek} days
              </span>
            )}
          </div>
          <div className="info-field">
            <span className="info-field-label">Break Time</span>
            {editing ? (
              <input
                type="number"
                className="sketchy-input"
                value={editConfig.breakTimeHours}
                onChange={(e) =>
                  setEditConfig((prev) => ({
                    ...prev,
                    breakTimeHours: Number(e.target.value),
                  }))
                }
                min={0}
                max={4}
                step={0.5}
              />
            ) : (
              <span className="info-field-value">
                {displayConfig.breakTimeHours} hour(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Salary History (Admin only) */}
      {currentUser.role === "ADMIN" && (
        <div className="sketchy-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-xl font-bold">
              📜 Salary History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="sketchy-btn sketchy-btn-secondary text-sm"
            >
              {showHistory ? "Hide" : "Show"} History
            </button>
          </div>

          {showHistory && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="font-body text-sm opacity-60">
                  No salary changes recorded yet.
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="sketchy-border-wobble-sm p-4 text-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">
                        Changed by {entry.changedByName}
                      </span>
                      <span className="opacity-60">
                        {new Date(entry.timestamp).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="flex gap-4 opacity-70">
                      <span>
                        Wage: {formatINR(entry.previousConfig.monthlyWage)} →{" "}
                        {formatINR(entry.newConfig.monthlyWage)}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="mt-1 opacity-50">
                        Reason: {entry.reason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Helpers ----

function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

function getBasisLabel(comp: {
  name: string;
  calculationType: string;
  calculationBasis: string;
  value: number;
}): string {
  if (comp.calculationType === "REMAINING_BALANCE") {
    return "Auto-calculated (Wage − all other components)";
  }
  if (comp.calculationType === "FIXED") {
    return "Fixed amount";
  }
  if (comp.calculationBasis === "WAGE") {
    return `${comp.value}% of Monthly Wage`;
  }
  if (comp.calculationBasis === "BASIC") {
    return `${comp.value}% of Basic Salary`;
  }
  return "";
}

/**
 * Client-side preview calculation (mirrors the backend engine).
 * This is for live editing preview only — the backend is authoritative.
 */
function useClientPreview(config: SalaryConfig): ComputedSalary {
  const compute = useCallback((): ComputedSalary => {
    const { monthlyWage, components } = config;
    const sorted = [...components].sort((a, b) => a.order - b.order);

    let basicSalary = 0;
    const computed = sorted.map((comp) => {
      let amount = 0;

      if (comp.calculationType === "PERCENTAGE") {
        const base =
          comp.calculationBasis === "WAGE"
            ? monthlyWage
            : comp.calculationBasis === "BASIC"
              ? basicSalary
              : 0;
        amount = Math.round((base * comp.value) / 100);
      } else if (comp.calculationType === "FIXED") {
        amount = comp.value;
      }

      if (comp.name === "Basic Salary") basicSalary = amount;

      return { ...comp, computedAmount: amount };
    });

    // Fixed Allowance
    const sumWithoutFixed = computed
      .filter((c) => c.name !== "Fixed Allowance")
      .reduce((s, c) => s + c.computedAmount, 0);

    const fixedAllowance = monthlyWage - sumWithoutFixed;
    const final = computed.map((c) =>
      c.name === "Fixed Allowance"
        ? { ...c, computedAmount: fixedAllowance }
        : c
    );

    const employeePF = Math.round(
      (basicSalary * config.pfEmployeeRate) / 100
    );
    const employerPF = Math.round(
      (basicSalary * config.pfEmployerRate) / 100
    );
    const profTax = config.professionalTaxActive
      ? config.professionalTax
      : 0;

    return {
      monthlyWage,
      yearlyWage: monthlyWage * 12,
      components: final,
      employeePF,
      employerPF,
      professionalTax: profTax,
      totalDeductions: employeePF + profTax,
      netSalary: monthlyWage - employeePF - profTax,
      grossSalary: monthlyWage,
    };
  }, [config]);

  const [result, setResult] = useState<ComputedSalary>(() => compute());

  useEffect(() => {
    setResult(compute());
  }, [compute]);

  return result;
}
