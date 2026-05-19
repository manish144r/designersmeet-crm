// react-hook-form + Zod glue without the @hookform/resolvers dependency
// (not installed; keep the dep tree lean / Norton-friendly). `zodResolver`
// adapts any Zod schema to RHF's Resolver contract.
import type { Resolver, FieldValues } from "react-hook-form";
import type { ZodTypeAny } from "zod";

export function zodResolver<T extends FieldValues>(schema: ZodTypeAny): Resolver<T> {
  return async (values) => {
    const r = schema.safeParse(values);
    if (r.success) return { values: r.data as T, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of r.error.issues) {
      const key = issue.path.join(".") || "root";
      if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as never };
  };
}

export { useForm, Controller } from "react-hook-form";
