import apiClient from '../services/apiClient';

interface SaveEntityOptions<T extends { id: number }> {
  apiUrl: string;
  record: T;
  entityLabel: string;
  onSaved?: () => void;
  refresh?: (apiUrl: string) => void;
  showBanner?: (message: string) => void;
  errorMessage: string;
}

interface DeleteEntityOptions {
  apiUrl: string;
  ids: number[];
  payloadKey?: 'ids' | 'selectedIds';
  onDeleted?: () => void;
  refresh?: (apiUrl: string) => void;
  errorMessage: string;
}

export const saveEntityRecord = async <T extends { id: number }>({
  apiUrl,
  record,
  entityLabel,
  onSaved,
  refresh,
  showBanner,
  errorMessage,
}: SaveEntityOptions<T>) => {
  try {
    if (record.id) {
      await apiClient.put(`${apiUrl}/${record.id}`, record);
    } else {
      await apiClient.post(apiUrl, record);
    }

    refresh?.(apiUrl);
    onSaved?.();
    showBanner?.(`${entityLabel} saved successfully.`);
  } catch (error) {
    console.error(errorMessage, error);
  }
};

export const deleteEntityRecords = async ({
  apiUrl,
  ids,
  payloadKey = 'ids',
  onDeleted,
  refresh,
  errorMessage,
}: DeleteEntityOptions) => {
  if (!ids.length) {
    return;
  }

  try {
    await apiClient.delete(apiUrl, {
      data: { [payloadKey]: ids },
    });
    onDeleted?.();
    refresh?.(apiUrl);
  } catch (error) {
    console.error(errorMessage, error);
  }
};
