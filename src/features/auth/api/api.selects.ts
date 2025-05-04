import { axiosPrivate } from "@lib/axios";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectResponse {
  data: SelectOption[];
  currentPage: number;
  totalPages: number;
}

export interface SelectApiParams {
  field: string;
  page: number;
  pageSize: number;
  search?: string;
}

export interface BatchSelectRequest {
  fields: string[];
  search?: string;
  page: number;
  pageSize: number;
}

export interface BatchSelectResponse {
  results: {
    [key: string]: SelectResponse;
  };
}

// Legacy API function for backward compatibility
export const selectApi = async (
  params: SelectApiParams,
): Promise<SelectResponse> => {
  const { field, page, pageSize, search } = params;
  const response = await axiosPrivate.get(`/selects`, {
    params: {
      field,
      page,
      pageSize,
      search,
    },
  });
  return response.data;
};

// New batch API function
export const batchSelectApi = async (
  params: BatchSelectRequest,
): Promise<BatchSelectResponse> => {
  const response = await axiosPrivate.post(`/selects`, params);
  return response.data;
};

// Optimized select API function that will use batch requests when possible
// and fallback to individual requests when needed
export const optimizedSelectApi = (() => {
  let pendingRequests: Record<
    string,
    {
      promise: Promise<SelectResponse>;
      resolve: (value: SelectResponse) => void;
      reject: (reason?: any) => void;
    }
  > = {};
  let batchFields: string[] = [];
  let batchTimer: NodeJS.Timeout | null = null;

  const executeBatch = async (
    fields: string[],
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<BatchSelectResponse> => {
    const batchRequest: BatchSelectRequest = {
      fields,
      search,
      page,
      pageSize,
    };

    return batchSelectApi(batchRequest);
  };

  return {
    // Function to fetch a single field
    fetch: async (params: SelectApiParams): Promise<SelectResponse> => {
      const { field, page, pageSize, search } = params;
      const cacheKey = `${field}:${page}:${pageSize}:${search || ""}`;

      // Return existing promise if this exact request is already pending
      if (pendingRequests[cacheKey]) {
        return pendingRequests[cacheKey].promise;
      }

      // Create deferred promise objects
      let promiseResolve: (value: SelectResponse) => void;
      let promiseReject: (reason?: any) => void;

      const promise = new Promise<SelectResponse>((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
      });

      // Store this promise with its resolve/reject functions
      pendingRequests[cacheKey] = {
        promise,
        resolve: promiseResolve!,
        reject: promiseReject!,
      };

      // Queue up this field for the next batch request
      batchFields.push(field);

      // Set or reset the batch timer
      if (batchTimer) {
        clearTimeout(batchTimer);
      }

      batchTimer = setTimeout(async () => {
        try {
          // Get unique fields
          const uniqueFields = [...new Set(batchFields)];

          // Clear batch state
          batchFields = [];
          batchTimer = null;

          // Execute the batch request
          const batchResponse = await executeBatch(
            uniqueFields,
            page,
            pageSize,
            search,
          );

          // Resolve all pending promises with their respective data
          for (const key of Object.keys(pendingRequests)) {
            const [fieldKey] = key.split(":");
            if (batchResponse.results[fieldKey]) {
              pendingRequests[key].resolve(batchResponse.results[fieldKey]);
              delete pendingRequests[key];
            }
          }
        } catch (error) {
          // For each pending request, try individual fetch
          const currentPendingRequests = { ...pendingRequests };

          // Clear all the pending requests for this batch
          for (const key of Object.keys(currentPendingRequests)) {
            const [fieldKey, pageKey, pageSizeKey, searchKey] = key.split(":");

            // Try individual request
            try {
              const response = await selectApi({
                field: fieldKey,
                page: parseInt(pageKey),
                pageSize: parseInt(pageSizeKey),
                search: searchKey,
              });

              // Resolve with the individual response
              if (pendingRequests[key]) {
                pendingRequests[key].resolve(response);
                delete pendingRequests[key];
              }
            } catch (individualError) {
              // Reject with the individual error
              if (pendingRequests[key]) {
                pendingRequests[key].reject(individualError);
                delete pendingRequests[key];
              }
            }
          }
        }
      }, 50); // Small delay to batch requests

      return promise;
    },

    // Clear any pending requests (useful for component unmount)
    clear: () => {
      // Reject all pending promises to avoid memory leaks
      Object.values(pendingRequests).forEach(({ reject }) => {
        reject(new Error("Request cancelled due to component unmount"));
      });

      pendingRequests = {};
      if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
      }
      batchFields = [];
    },
  };
})();
