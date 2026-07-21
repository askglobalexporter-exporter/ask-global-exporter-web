"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./PasswordInput.module.css";

type PasswordInputProps = {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength: number;
  placeholder?: string;
};

export function PasswordInput({ label, name, autoComplete, minLength, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      <span>{label}</span>
      <span className={styles.field}>
        <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} placeholder={placeholder} required />
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
