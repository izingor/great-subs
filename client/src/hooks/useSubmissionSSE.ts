import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submissionsApi } from "@/store/slices/api";
import type { Submission, PaginatedSubmissions } from "@/types";
import type { RootState, AppDispatch } from "@/store/store";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SSE_URL = `${BASE_URL}/submissions/events`;

type DeepWritable<T> = {
  -readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepWritable<U>[]
    : T[P] extends object
      ? DeepWritable<T[P]>
      : T[P];
};

export const useSubmissionSSE = (): void => {
  const dispatch = useDispatch<AppDispatch>();
  const queries = useSelector(
    (state: RootState) => state.submissionsApi.queries,
  );

  useEffect(() => {
    const eventSource = new EventSource(SSE_URL);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "submission_updated") {
          const updatedSubmission = payload.data as Submission;

          dispatch(
            submissionsApi.util.updateQueryData(
              "getSubmission",
              updatedSubmission.id,
              (draft: DeepWritable<Submission>) => {
                Object.assign(draft, updatedSubmission);
              },
            ),
          );

          Object.values(queries || {}).forEach((query) => {
            if (query?.endpointName === "getSubmissions") {
              dispatch(
                submissionsApi.util.updateQueryData(
                  "getSubmissions",
                  query.originalArgs as any,
                  (draft: DeepWritable<PaginatedSubmissions>) => {
                    const index = draft.items.findIndex(
                      (i) => i.id === updatedSubmission.id,
                    );
                    if (index !== -1) {
                      draft.items[index] =
                        updatedSubmission as DeepWritable<Submission>;
                    }
                  },
                ),
              );
            }
          });

          if (updatedSubmission.status === "bound") {
            toast.success(
              `Submission "${updatedSubmission.name}" is now bound!`,
            );
          } else if (updatedSubmission.status === "bind_failed") {
            toast.error(`Binding failed for "${updatedSubmission.name}".`);
          }
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch, queries]);
};
