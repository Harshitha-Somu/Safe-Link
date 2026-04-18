import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import type { InsertScan, Scan, ScanDetails } from "@shared/schema";

// Type assertion helper since the API returns jsonb for details
// We need to ensure the frontend treats it as ScanDetails
export type ScanWithDetails = Omit<Scan, "details"> & {
  details: ScanDetails | null;
};

// GET /api/scans
export function useScans() {
  return useQuery({
    queryKey: [api.scans.list.path],
    queryFn: async () => {
      const res = await fetch(api.scans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scans");
      const data = await res.json();
      return api.scans.list.responses[200].parse(data) as ScanWithDetails[];
    },
  });
}

// GET /api/scans/:id
export function useScan(id: number) {
  return useQuery({
    queryKey: [api.scans.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.scans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch scan details");
      const data = await res.json();
      return api.scans.get.responses[200].parse(data) as ScanWithDetails;
    },
    // Poll while status is 'pending'
    refetchInterval: (query) =>
  query.state.data?.status === "pending" ? 1000 : false,
  });
}

// POST /api/scans
export function useCreateScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScan) => {
      const res = await fetch(api.scans.create.path, {
        method: api.scans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scans.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create scan");
      }
      return api.scans.create.responses[201].parse(await res.json()) as ScanWithDetails;
    },
    onSuccess: (newScan) => {
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
    },
  });
}
