"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { getApi, type Quote, type Transfer, type UserAccount } from "@/lib/api";
import type { AmountDraft, RecipientDraft } from "@/lib/validation/send";
import { RecipientStep } from "./RecipientStep";
import { AmountStep } from "./AmountStep";
import { ReviewStep } from "./ReviewStep";
import { SuccessStep } from "./SuccessStep";

type Step = "recipient" | "amount" | "review" | "success";

const STEP_ORDER: Step[] = ["recipient", "amount", "review", "success"];
const STEP_LABELS: Record<Step, string> = {
  recipient: "Recipient",
  amount: "Amount",
  review: "Review",
  success: "Done",
};

/**
 * Send wizard orchestrator. Owns the draft and the step state.
 * Steps are dumb forms; the API calls happen here and in AmountStep.
 * To split into sub-routes later (send/recipient, send/amount...),
 * lift this state into a context. See architecture.md.
 */
export function SendWizard({ account }: { account: UserAccount }) {
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<RecipientDraft>({
    recipientName: "",
    payoutMethod: "Bank transfer",
  });
  const [amountDraft, setAmountDraft] = useState<AmountDraft>({
    amount: "",
    fromCurrency: "USD",
    toCurrency: "IDR",
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  const activeIndex = STEP_ORDER.indexOf(step);

  async function handleConfirm(): Promise<Transfer> {
    if (!quote) throw new Error("Get a quote first.");
    return getApi().createTransfer({
      amount: quote.amount,
      fromCurrency: quote.fromCurrency,
      toCurrency: quote.toCurrency,
      recipientName: recipient.recipientName,
      payoutMethod: recipient.payoutMethod,
    });
  }

  return (
    <Card className="mx-auto max-w-[640px]">
      <ol className="mb-6 flex gap-2" aria-label="Send progress">
        {STEP_ORDER.map((name, index) => (
          <li
            key={name}
            className={[
              "flex-1 rounded-full px-3 py-1.5 text-center text-xs font-extrabold uppercase tracking-wide",
              index < activeIndex
                ? "bg-emerald-100 text-emerald-800"
                : index === activeIndex
                  ? "bg-primary text-white"
                  : "bg-background text-muted",
            ].join(" ")}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            {STEP_LABELS[name]}
          </li>
        ))}
      </ol>

      {step === "recipient" ? (
        <RecipientStep
          initial={recipient}
          onNext={(draft) => {
            setRecipient(draft);
            setStep("amount");
          }}
        />
      ) : null}

      {step === "amount" ? (
        <AmountStep
          account={account}
          initial={amountDraft}
          onBack={() => setStep("recipient")}
          onNext={(draft, nextQuote) => {
            setAmountDraft(draft);
            setQuote(nextQuote);
            setStep("review");
          }}
        />
      ) : null}

      {step === "review" && quote ? (
        <ReviewStep
          quote={{ ...quote, recipientName: recipient.recipientName, payoutMethod: recipient.payoutMethod }}
          recipientName={recipient.recipientName}
          onBack={() => setStep("amount")}
          onConfirm={handleConfirm}
          onDone={(next) => {
            setTransfer(next);
            setStep("success");
          }}
        />
      ) : null}

      {step === "success" && transfer ? (
        <SuccessStep transfer={transfer} />
      ) : null}
    </Card>
  );
}
