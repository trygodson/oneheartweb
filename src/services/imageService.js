import { ApiEndPoints } from '../config/Endpoints';
import api from '../config/api';

export async function UploadImageService(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(ApiEndPoints.UPLOAD_IMAGE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Response structure: { publicUrl: "...", filename: "...", ... }
  // API interceptor returns res.data, so response is already the data object
  return response?.publicUrl || response;
}

export async function UploadMultipleImagesService(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post(ApiEndPoints.UPLOAD_MULTIPLE_IMAGES, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Response is an array of objects: [{ publicUrl: "...", ... }, ...]
  // API interceptor returns res.data, so response is already the data array
  if (Array.isArray(response)) {
    return response.map((item) => item?.publicUrl || item);
  }
  // Fallback if response structure is different
  return [];
}
