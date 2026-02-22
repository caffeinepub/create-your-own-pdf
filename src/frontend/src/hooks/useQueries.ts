import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublishedPdf } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetPdfList() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishedPdf[]>({
    queryKey: ['pdfList'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPdfList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublishedPdf(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublishedPdf>({
    queryKey: ['publishedPdf', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getPublished(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSearchPublished(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublishedPdf[]>({
    queryKey: ['searchPublished', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPublished(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function usePublishPdf() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blob,
      id,
      authorName,
      title,
      isPublic,
      isSearchable,
      originalFileName,
      originalAuthor,
    }: {
      blob: ExternalBlob;
      id: string;
      authorName: string;
      title: string;
      isPublic: boolean;
      isSearchable: boolean;
      originalFileName: string | null;
      originalAuthor: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.publish(blob, id, authorName, title, isPublic, isSearchable, originalFileName, originalAuthor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfList'] });
    },
  });
}
