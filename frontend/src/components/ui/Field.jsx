import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const inputBase =
  "w-full rounded-xl border bg-cream-50 px-4 py-3 text-forest-800 placeholder:text-forest-300 " +
  "outline-none transition-all duration-200 focus:bg-white focus:ring-4";

const stateClass = (error) =>
  error
    ? "border-hotpink-400 focus:border-hotpink-500 focus:ring-hotpink-100"
    : "border-cream-300 hover:border-cream-500 focus:border-forest-500 focus:ring-forest-100";

function Wrapper({ label, error, hint, children, id }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-forest-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-hotpink-700">{error}</p>
      ) : (
        hint && <p className="text-xs text-forest-400">{hint}</p>
      )}
    </div>
  );
}

export function Input({ label, error, hint, icon: Icon, id, className = "", ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
        )}
        <input id={id} className={`${inputBase} ${stateClass(error)} ${Icon ? "pl-11" : ""} ${className}`} {...props} />
      </div>
    </Wrapper>
  );
}

export function PasswordInput({ label, error, hint, icon: Icon, id, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <Wrapper label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
        )}
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${inputBase} ${stateClass(error)} ${Icon ? "pl-11" : ""} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-forest-400 transition hover:bg-forest-800/5 hover:text-forest-700"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    </Wrapper>
  );
}

export function Select({ label, error, hint, icon: Icon, id, options, placeholder, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} id={id}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-forest-400" />
        )}
        <select
          id={id}
          className={`${inputBase} ${stateClass(error)} ${Icon ? "pl-11" : ""} appearance-none pr-10`}
          {...props}
        >
          <option value="">{placeholder || "Select"}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
      </div>
    </Wrapper>
  );
}

export function Textarea({ label, error, hint, id, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint} id={id}>
      <textarea id={id} rows={3} className={`${inputBase} ${stateClass(error)} resize-none`} {...props} />
    </Wrapper>
  );
}
