/**
 * Form components
 */

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function FormField({ label, children, error, className = "" }: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {children}
      {error && <FormError message={error} />}
    </div>
  );
}

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}
