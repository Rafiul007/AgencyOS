import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMember,
  fetchTeam,
  removeMember,
  updateMember,
  type ICreateMemberInput,
  type IUpdateMemberInput,
} from './api';

const TEAM_KEY = ['team'];

export function useTeam() {
  return useQuery({ queryKey: TEAM_KEY, queryFn: fetchTeam });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: TEAM_KEY });
    // The contacts assignee dropdown reads the same users.
    qc.invalidateQueries({ queryKey: ['tenant-users'] });
  };
}

export function useCreateMember() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: createMember, onSuccess: () => invalidate() });
}

export function useUpdateMember() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IUpdateMemberInput }) =>
      updateMember(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useRemoveMember() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: removeMember, onSuccess: () => invalidate() });
}

export type { ICreateMemberInput, IUpdateMemberInput };
