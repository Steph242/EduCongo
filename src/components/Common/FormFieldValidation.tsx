import React from 'react';

interface FormFieldFeedbackProps {
  isValid: boolean;
  isTouched?: boolean;
  showErrors?: boolean;
  value?: string;
  errorMessage?: string;
  successMessage?: string;
  helperText?: string;
}

export const FormFieldFeedback: React.FC<FormFieldFeedbackProps> = ({
  isValid,
  isTouched = false,
  showErrors = false,
  value = '',
  errorMessage,
  successMessage,
  helperText,
}) => {
  const hasContent = Boolean(value && value.trim().length > 0);
  const showError = (isTouched || showErrors) && !isValid;
  const showSuccess = isValid && hasContent;

  if (showError && errorMessage) {
    return (
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-300 animate-in fade-in slide-in-from-top-1 duration-150 font-medium">
        <span className="material-symbols-outlined text-[14px] text-rose-400 shrink-0">
          error
        </span>
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (showSuccess && successMessage) {
    return (
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-300 animate-in fade-in duration-150 font-medium">
        <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0">
          check_circle
        </span>
        <span>{successMessage}</span>
      </div>
    );
  }

  if (helperText) {
    return (
      <p className="mt-1 text-[11px] text-slate-400 leading-tight">
        {helperText}
      </p>
    );
  }

  return null;
};

interface FormFieldBadgeProps {
  isValid: boolean;
  isTouched?: boolean;
  showErrors?: boolean;
  value?: string;
  validLabel?: string;
  invalidLabel?: string;
}

export const FormFieldBadge: React.FC<FormFieldBadgeProps> = ({
  isValid,
  isTouched = false,
  showErrors = false,
  value = '',
  validLabel = 'Valide',
  invalidLabel = 'Requis',
}) => {
  const hasContent = Boolean(value && value.trim().length > 0);
  const showError = (isTouched || showErrors) && !isValid;
  const showSuccess = isValid && hasContent;

  if (showSuccess) {
    return (
      <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-in fade-in duration-150">
        <span className="material-symbols-outlined text-[12px] text-emerald-400 font-bold">done</span>
        <span>{validLabel}</span>
      </span>
    );
  }

  if (showError) {
    return (
      <span className="text-[10px] text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 animate-in fade-in duration-150">
        <span className="material-symbols-outlined text-[12px] text-rose-400">close</span>
        <span>{invalidLabel}</span>
      </span>
    );
  }

  return null;
};
