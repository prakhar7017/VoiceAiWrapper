import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  ApolloCache,
  type DocumentNode,
} from '@apollo/client';
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
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 401:
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 500:
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
    retryIf: (error) => !!error && !error.message.includes('401'),
  },
});

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Organization: {
      fields: {
        projects: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Project: {
      fields: {
        tasks: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Task: {
      fields: {
        comments: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        organizations: {
          merge(_, incoming) {
            return incoming;
          },
        },
        projects: {
          keyArgs: ['organizationSlug', 'status', 'search'],
          merge(_existing = [], incoming, { args }) {
            if (args?.offset && args.offset > 0) {
              return [..._existing, ...incoming];
            }
            return incoming;
          },
        },
        tasks: {
          keyArgs: [
            'projectId',
            'organizationSlug',
            'status',
            'priority',
            'search',
          ],
          merge(existing = [], incoming, { args }) {
            if (args?.offset && args.offset > 0) {
              return [...existing, ...incoming];
            }
            return incoming;
          },
        },
        taskComments: {
          keyArgs: ['taskId', 'organizationSlug'],
          merge(_, incoming) {
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
export const refetchAllQueries = (): void => {
  apolloClient.refetchQueries({
    include: 'active',
  });
};

// Helper function to update cache after mutations
export const updateCacheAfterMutation = (
  cache: ApolloCache<unknown>,
  queryToUpdate: DocumentNode,
  variables?: Record<string, unknown>
): void => {
  try {
    const existingData = cache.readQuery({
      query: queryToUpdate,
      variables,
    });

    if (existingData) {
      cache.writeQuery({
        query: queryToUpdate,
        variables,
        data: existingData,
      });
    }
  } catch (error: unknown) {
    console.warn('Cache update failed:', error);
  }
};

export default apolloClient;
