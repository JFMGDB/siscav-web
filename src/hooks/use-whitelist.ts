"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import * as whitelistApi from "@/lib/api/whitelist";
import type { AuthorizedPlate, PaginatedResponse } from "@/types";
import { resolveApiError } from "@/lib/api/errors";
import { useSnackbar } from "@/hooks/use-snackbar";
import { MESSAGES } from "@/constants";

const QUERY_KEY = ["whitelist"] as const;

export function useWhitelist(initialData?: PaginatedResponse<AuthorizedPlate>) {
  const queryClient = useQueryClient();
  const { showMessage } = useSnackbar();
  const client = getClientApiClient();

  const query = useQuery({
    queryKey: [...QUERY_KEY, 0, 100],
    queryFn: () => whitelistApi.getWhitelist(client, 0, 100),
    initialData: initialData ?? undefined,
  });

  const addMutation = useMutation({
    mutationFn: ({
      plate,
      description,
    }: {
      plate: string;
      description?: string;
    }) => whitelistApi.addPlate(client, plate, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showMessage(MESSAGES.WHITELIST.ADD_SUCCESS, "success");
    },
    onError: (e) =>
      showMessage(resolveApiError(e, MESSAGES.WHITELIST.ADD_ERROR), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      plate,
      description,
    }: {
      id: string;
      plate: string;
      description?: string;
    }) => whitelistApi.updatePlate(client, id, plate, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showMessage(MESSAGES.WHITELIST.UPDATE_SUCCESS, "success");
    },
    onError: (e) =>
      showMessage(resolveApiError(e, MESSAGES.WHITELIST.UPDATE_ERROR), "error"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => whitelistApi.removePlate(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showMessage(MESSAGES.WHITELIST.REMOVE_SUCCESS, "success");
    },
    onError: (e) =>
      showMessage(resolveApiError(e, MESSAGES.WHITELIST.REMOVE_ERROR), "error"),
  });

  const items = query.data?.items ?? [];
  const refetch = query.refetch;

  return {
    plates: items,
    loading: query.isLoading,
    error: query.error,
    refetch,
    addPlate: addMutation.mutateAsync,
    updatePlate: updateMutation.mutateAsync,
    removePlate: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
