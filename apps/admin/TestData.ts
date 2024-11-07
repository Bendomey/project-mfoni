const isDataLoading = false;
const error = null;
const currentDate = new Date()

export const useApproveApplication = () => {

  let status = 200
  const mutate = async (id: string) => {
    status = 200; // Mock response
  };

  return { mutate, isDataLoading, status, error };
};
