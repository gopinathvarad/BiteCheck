import apiClient from "@/shared/api/client";
import { CorrectionCreate, CorrectionResponse } from "../types";

export const submitCorrection = async (
  data: CorrectionCreate,
  photoUri?: string
): Promise<CorrectionResponse> => {
  const formData = new FormData();
  formData.append("product_id", data.product_id);
  formData.append("field_name", data.field_name);
  formData.append("old_value", data.old_value);
  formData.append("new_value", data.new_value);

  if (photoUri) {
    const filename = photoUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // @ts-ignore: React Native FormData expects this structure
    formData.append("photo", {
      uri: photoUri,
      name: filename,
      type,
    });
  }

  const response = await apiClient.post("/corrections", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
