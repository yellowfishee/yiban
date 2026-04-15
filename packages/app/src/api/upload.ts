import Taro from '@tarojs/taro';
import { storage, STORAGE_KEYS } from '../adapters/storage';

const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000';

export interface UploadResponse {
  url: string;
}

export const uploadApi = {
  avatar: async (filePath: string): Promise<UploadResponse> => {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    const response = await Taro.uploadFile({
      url: BASE_URL + '/api/upload/avatar',
      filePath,
      name: 'avatar',
      header: token ? { Authorization: 'Bearer ' + token } : {},
    });

    if (response.statusCode >= 400) {
      const error = JSON.parse(response.data);
      throw new Error(error.error || '上传失败');
    }

    return JSON.parse(response.data);
  },
};
