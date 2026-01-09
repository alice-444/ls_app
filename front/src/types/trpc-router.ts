// Type stub for AppRouter when backend is not available during build
// This allows TypeScript to compile even when the backend types aren't accessible
// This is a minimal type that satisfies tRPC's requirements
export type AppRouter = {
  [key: string]: {
    [key: string]: {
      useQuery: (...args: any[]) => any;
      useMutation: (...args: any[]) => any;
      useInfiniteQuery: (...args: any[]) => any;
      useSubscription: (...args: any[]) => any;
    };
  };
} & {
  useUtils: () => {
    [key: string]: {
      [key: string]: {
        invalidate: () => void;
        refetch: () => void;
        setData: (data: any) => void;
        getData: () => any;
      };
    };
  };
  useContext: () => any;
  Provider: React.ComponentType<{ client: any; queryClient: any; children: React.ReactNode }>;
};

