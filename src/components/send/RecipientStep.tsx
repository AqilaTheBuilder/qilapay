"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputStyles } from "@/components/ui/FormField";
import {
  PAYOUT_METHODS,
  validateRecipient,
  type RecipientDraft,
} from "@/lib/validation/send";
import type { PayoutMethod } from "@/lib/api/types";

type RecipientStepProps = {
  initial: RecipientDraft;
  onNext: (draft: RecipientDraft) => void;
};

/** Step 1: who gets the money and how. */
export function RecipientStep({ initial, onNext }: RecipientStepProps) {
  const [name, setName] = useState(initial.recipientName);
  const [payout, setPayout] = useState<PayoutMethod>(initial.payoutMethod);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const draft = { recipientName: name, payoutMethod: payout };
    const found = validateRecipient(draft);
    setErrors(found);
    if (Object.values(found).every((message) => !message)) onNext(draft);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FormField label="Recipient name" htmlFor="recipient-name" error={errors.recipientName}>
        <input
          id="recipient-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Amara Putri"
          autoComplete="off"
          className={inputStyles}
        />
      </FormField>

      <FormField label="Payout method" htmlFor="payout-method" error={errors.payoutMethod}>
        <select
          id="payout-method"
          value={payout}
          onChange={(event) => setPayout(event.target.value as PayoutMethod)}
          className={inputStyles}
        >
          {PAYOUT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </FormField>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Continue →
      </Button>
    </form>
  );
}
