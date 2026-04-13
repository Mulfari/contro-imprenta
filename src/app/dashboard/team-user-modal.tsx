"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type TeamUserModalProps = {
  closeHref: string;
  action: (formData: FormData) => void;
};

type Step = 1 | 2 | 3;

function normalizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function formatPersonalNameInput(value: string) {
  return value
    .replace(/\s{2,}/g, " ")
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (match, prefix: string, letter: string) => {
      void match;
      return `${prefix}${letter.toUpperCase()}`;
    });
}

function normalizePersonalName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? "Registrando usuario..." : "Registrar usuario"}
    </button>
  );
}

export function TeamUserModal({ closeHref, action }: TeamUserModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [stepMessage, setStepMessage] = useState("");

  const steps = [
    { id: 1, label: "Datos personales" },
    { id: 2, label: "Contacto" },
    { id: 3, label: "Rol" },
  ] as const;

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setStepMessage("Completa nombre y apellido.");
        return false;
      }

      if (nationalId.length < 6) {
        setStepMessage("La cedula debe tener al menos 6 digitos.");
        return false;
      }
    }

    if (step === 2) {
      if (!phone.trim() || !email.trim()) {
        setStepMessage("Completa numero y correo.");
        return false;
      }
    }

    if (step === 3 && !role) {
      setStepMessage("Selecciona un rol para continuar.");
      return false;
    }

    setStepMessage("");
    return true;
  };

  const goToNextStep = () => {
    if (step === 1) {
      setFirstName((current) => normalizePersonalName(current));
      setLastName((current) => normalizePersonalName(current));
    }

    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => (current === 3 ? current : ((current + 1) as Step)));
  };

  const goToPreviousStep = () => {
    setStepMessage("");
    setStep((current) => (current === 1 ? current : ((current - 1) as Step)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/18 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Nuevo usuario</h3>
            <p className="mt-2 text-sm text-slate-500">
              Registra el acceso del equipo por fases.
            </p>
          </div>
          <Link
            href={closeHref}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar modal"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {steps.map((item) => {
            const isActive = step === item.id;
            const isCompleted = step > item.id;

            return (
              <div
                key={item.id}
                className={`rounded-[1.3rem] border px-4 py-3 text-center text-sm font-medium transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-slate-900"
                    : isCompleted
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        <form action={action} className="mt-6 space-y-5">
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="nationalId" value={nationalId} />
          <input type="hidden" name="phone" value={phone} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="role" value={role} />

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="firstName">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(formatPersonalNameInput(event.target.value))
                  }
                  onBlur={() => setFirstName((current) => normalizePersonalName(current))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="lastName">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={lastName}
                  onChange={(event) =>
                    setLastName(formatPersonalNameInput(event.target.value))
                  }
                  onBlur={() => setLastName((current) => normalizePersonalName(current))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Perez"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-slate-600" htmlFor="nationalId">
                  Cedula
                </label>
                <input
                  id="nationalId"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  autoComplete="off"
                  spellCheck={false}
                  value={nationalId}
                  onChange={(event) => setNationalId(normalizeDigits(event.target.value, 8))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="12345678"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="phone">
                  Numero
                </label>
                <input
                  id="phone"
                  type="text"
                  inputMode="tel"
                  autoComplete="off"
                  spellCheck={false}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="04141234567"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="email">
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="usuario@imprenta.com"
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="role">
                  Rol
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as "staff" | "admin")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                El usuario creara su codigo de 4 digitos en su primer inicio de sesion.
              </div>
            </div>
          ) : null}

          {stepMessage ? (
            <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {stepMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={step === 1}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Volver
            </button>

            <div className="w-full sm:w-auto">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Continuar
                </button>
              ) : (
                <SubmitButton />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
