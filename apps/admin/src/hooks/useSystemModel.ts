import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSystemModelList, patchSystemModel } from '../api/systemModel';
import { SystemModelPatchDto } from '@lia/api/admin/system_model/patch.dto';
import { enqueueSnackbar } from 'notistack';

export function useSystemModelList() {
  return useQuery({
    queryKey: ['systemModelList'],
    queryFn: getSystemModelList,
  });
}

export function usePatchSystemModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SystemModelPatchDto) => patchSystemModel(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemModelList'] });
      enqueueSnackbar('시스템 모델이 수정되었습니다', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    onError: () => {
      enqueueSnackbar('시스템 모델 수정에 실패했습니다', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    },
  });
}
