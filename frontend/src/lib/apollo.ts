import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
  credentials: 'include',
});

// Auth link (for future authentication)
const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage if needed
  const token = localStorage.getItem('authToken');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle specific network errors
    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 401:
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden
          console.error('Access forbidden');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
      }
    }
  }
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error && !error.message.includes('401'),
  },
});

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Organization: {
      fields: {
        projects: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Project: {
      fields: {
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Task: {
      fields: {
        comments: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        organizations: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        projects: {
          keyArgs: ['organizationSlug', 'status', 'search'],
          merge(existing = [], incoming, { args }) {
            // Handle pagination
            if (args?.offset && args.offset > 0) {
              return [...existing, ...incoming];
            }
            return incoming;
          },
        },
        tasks: {
          keyArgs: ['projectId', 'organizationSlug', 'status', 'priority', 'search'],
          merge(existing = [], incoming, { args }) {
            // Handle pagination
            if (args?.offset && args.offset > 0) {
              return [...existing, ...incoming];
            }
            return incoming;
          },
        },
        taskComments: {
          keyArgs: ['taskId', 'organizationSlug'],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([retryLink, errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: import.meta.env.DEV,
});

// Helper function to clear cache
export const clearApolloCache = () => {
  apolloClient.clearStore();
};

// Helper function to refetch all queries
export const refetchAllQueries = () => {
  apolloClient.refetchQueries({
    include: 'active',
  });
};

// Helper function to update cache after mutations
export const updateCacheAfterMutation = (
  cache: any,
  mutationResult: any,
  queryToUpdate: string,
  variables?: any
) => {
  try {
    const existingData = cache.readQuery({
      query: queryToUpdate,
      variables,
    });

    if (existingData) {
      // Update logic would go here based on mutation type
      cache.writeQuery({
        query: queryToUpdate,
        variables,
        data: existingData,
      });
    }
  } catch (error) {
    console.warn('Cache update failed:', error);
  }
};

export default apolloClient;
