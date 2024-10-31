// Dummy data for simulating fetching state
export const useApplicationQuery = () => {const isDataLoading = false; const error = null;
   const createdAtData = new Date()
   const updatedAtData = `${new Date().toLocaleString("en-GB", {hour12: true,day: "2-digit",month: "2-digit",year: "numeric",hour: "2-digit",minute: "2-digit",})}`
    // return dummy data to simulate the data returned by a query
    const data: Application[] = [
        {
            id: "m5gr84i9",
            name: "Domey Benjamin Armah Kessey Kofi",
            status: "submitted",
            email: "ken99@yahoo.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "3u1reuv4",
            name: "Gideon Bempong",
            status: "canceled",
            email: "Abe45@gmail.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "derv1ws0",
            name: "domey Benjamin",
            status: "approved",
            email: "Monserrat44@gmail.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "5kma53ae",
            name: "Fiifi Arkhurst Jr.",
            status: "submitted",
            email: "Silas22@gmail.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "m5gr84i9",
            name: "Domey Benjamin Armah Kessey Kofi",
            status: "submitted",
            email: "ken99@yahoo.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "5kma53ae",
            name: "Fiifi Arkhurst Jr.",
            status: "submitted",
            email: "Silas22@gmail.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
          {
            id: "3u1reuv4",
            name: "Gideon Bempong",
            status: "canceled",
            email: "Abe45@gmail.com",
            updatedAt: updatedAtData,
            createdAt: createdAtData,
          },
    ];
  
    return { isDataLoading, error, data };
  };
