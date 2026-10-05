"use client";

import { useId, useState } from "react";
import { readinessChecks } from "@/lib/curriculum";

export function ReadinessCheck({ pathId }: { pathId: string }) {
  const check = readinessChecks[pathId];
  const [answer, setAnswer] = useState<number | null>(null);
  const name = useId();
  if (!check) return null;
  return <details className="mt-3 text-sm text-slate-600">
    <summary className="cursor-pointer font-medium text-indigo-700">Check a prerequisite</summary>
    <fieldset className="mt-3">
      <legend className="mb-2 font-medium text-slate-900">{check.question}</legend>
      <div className="flex flex-wrap gap-2">
        {check.choices.map((choice, index) => <label key={choice} className="flex cursor-pointer items-center gap-2 rounded border border-blue-200 bg-white px-3 py-2">
          <input type="radio" name={name} checked={answer === index} onChange={() => setAnswer(index)} />{choice}
        </label>)}
      </div>
    </fieldset>
    {answer !== null && <p role="status" className="mt-2">{answer === check.answer ? "Correct. " : "Try again. "}{check.explanation} You can explore this path either way.</p>}
  </details>;
}
