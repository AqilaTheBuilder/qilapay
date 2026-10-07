"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputStyles } from "@/components/ui/FormField";
import { LimitNotice } from "@/components/risk/LimitNotice";
import { getApi, type Quote, type UserAccount } from "@/lib/api";
import { formatUsdShort } from "@/lib/format";
import {
  AMOUNT_CURRENCIES,
  RECEIVE_CURRENCIES,
  validateAmount,
  type AmountDraft,
} from "@/lib/validation/send";

type AmountStepProps = {
  account: UserAccount;
  initial: AmountDraft;
  onBack: () => void;
  onNext: (draft: AmountDraft, quote: Quote) => void;
};

/** Step 2: amount plus quote preview. Blocks over-limit amounts early. */
export function AmountStep({ account, initial, onBack, onNext }: AmountStepProps) {
  const [amount, setAmount] = useState(initial.amount);
  const [from, setFrom] = useState(initial.fromCurrency);
  const [to, setTo] = useState(initial.toCurrency);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    const draft = { amount, fromCurrency: from, toCurrency: to };
    const found = validateAmount(draft, {
      tier: account.tier,
      dailyUsed: account.dailyUsed,
    });
    setErrors(found);
    if (Object.values(found).every((message) => !message)) {
      setLoading(true);
      try {
        const quote = await getApi().getQuote({
          amount: Number(amount),
          fromCurrency: from as Quote["fromCurrency"],
          toCurrency: to as Quote["toCurrency"],
          recipientName: "",
          payoutMethod: "Bank transfer",
        });
        onNext(draft, quote);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Quote failed.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FormField
        label={`Amount (${account.tier} cap ${formatUsdShort(account.limits.perTransaction)})`}
        htmlFor="send-amount"
        error={errors.amount}
        hint={`${formatUsdShort(account.limits.daily - account.dailyUsed)} left today.`}
      >
        <input
          id="send-amount"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="500"
          autoComplete="off"
          className={inputStyles}
        />
      </FormField>

      {errors.amount ? <LimitNotice reason={errors.amount} /> : null}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="From" htmlFor="from-currency">
          <select
            id="from-currency"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={inputStyles}
          >
            {AMOUNT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="To" htmlFor="to-currency" error={errors.toCurrency}>
          <select
            id="to-currency"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={inputStyles}
          >
            {RECEIVE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {submitError ? (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="lg" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={loading}>
          {loading ? "Getting quote…" : "Review quote →"}
        </Button>
      </div>
    </form>
  );
}
