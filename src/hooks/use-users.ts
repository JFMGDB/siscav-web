"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientApiClient } from "@/lib/api/client";
import * as usersApi from "@/lib/api/users";
import type { AccountUserUpdate } from "@/types/accounts";
import { useSnackbar } from "@/hooks/use-snackbar";
import { MESSAGES } from "@/constants";

export const USERS_QUERY_KEY = ["users"] as const;

export function useUsers() {
  const queryClient = useQueryClient();
  const { showMessage } = useSnackbar();
  const client = getClientApiClient();

  const statsQuery = useQuery({
    queryKey: [...USERS_QUERY_KEY, "stats"],
    queryFn: () => usersApi.getUserStats(client),
  });

  const listQuery = useQuery({
    queryKey: [...USERS_QUERY_KEY, "list", 0, 100],
    queryFn: () => usersApi.getUsers(client, 0, 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountUserUpdate }) =>
      usersApi.updateUser(client, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      showMessage(MESSAGES.ACCOUNTS.UPDATE_SUCCESS, "success");
    },
    onError: () => showMessage(MESSAGES.ACCOUNTS.UPDATE_ERROR, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      showMessage(MESSAGES.ACCOUNTS.DELETE_SUCCESS, "success");
    },
    onError: () => showMessage(MESSAGES.ACCOUNTS.DELETE_ERROR, "error"),
  });

  return {
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.isError,
    refetchStats: statsQuery.refetch,
    accounts: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    listLoading: listQuery.isLoading,
    listError: listQuery.isError,
    refetchList: listQuery.refetch,
    updateAccount: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAccount: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
