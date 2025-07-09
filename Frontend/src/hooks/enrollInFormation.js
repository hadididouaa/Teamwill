import axios from "axios";

export const enrollInFormation = async (formationId) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/formations/user/enroll`,
    { formationId },
    { withCredentials: true }
  );
  return response.data;
};
