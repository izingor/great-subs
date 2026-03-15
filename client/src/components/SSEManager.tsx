import { useSubmissionSSE } from "@/hooks/useSubmissionSSE";

export const SSEManager = (): null => {
  useSubmissionSSE();
  return null;
};
