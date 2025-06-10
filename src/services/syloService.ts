import { TRNService } from './trnService';

interface SyloQueryResult {
  blockNumber: string;
  timestamp: string;
  data: any;
}

interface SyloSubscription {
  id: string;
  query: string;
  callback: (result: SyloQueryResult) => void;
}

export class SyloService {
  private static subscriptions: Map<string, SyloSubscription> = new Map();
  private static queryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static CACHE_DURATION = 1000 * 60; // 1 minute cache

  /**
   * Initialize SYLO connection and set up necessary types
   */
  static async initialize(): Promise<void> {
    const api = await TRNService.connect();
    
    // Register custom types for SYLO queries
    await api.registerTypes({
      SyloQuery: {
        target: 'AccountId',
        queryType: 'Text',
        parameters: 'Vec<u8>',
        callback: 'Option<AccountId>'
      },
      SyloResponse: {
        queryId: 'Hash',
        response: 'Vec<u8>',
        signature: 'Option<Signature>'
      }
    });
  }

  /**
   * Create a new SYLO query
   */
  static async createQuery(
    queryType: string,
    parameters: any,
    callback?: (result: SyloQueryResult) => void
  ): Promise<string> {
    const api = await TRNService.connect();
    
    // Generate query ID
    const queryId = Date.now().toString();
    
    // Format query parameters
    const formattedParams = this.formatQueryParameters(parameters);
    
    // Create SYLO query
    await api.tx.sylo.createQuery(
      queryType,
      formattedParams,
      callback ? api.createType('Option<AccountId>', api.createType('AccountId', callback)) : null
    ).signAndSend(await this.getQueryAccount());

    // Store subscription if callback provided
    if (callback) {
      this.subscriptions.set(queryId, {
        id: queryId,
        query: queryType,
        callback
      });
    }

    return queryId;
  }

  /**
   * Execute a one-time SYLO query
   */
  static async query<T>(queryType: string, parameters: any): Promise<T> {
    // Check cache first
    const cacheKey = this.getCacheKey(queryType, parameters);
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }

    const api = await TRNService.connect();
    
    // Execute query
    const response = await api.query.sylo.executeQuery(
      queryType,
      this.formatQueryParameters(parameters)
    );

    // Parse and cache result
    const result = this.parseQueryResult<T>(response);
    this.queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Subscribe to SYLO query updates
   */
  static async subscribe(
    queryType: string,
    parameters: any,
    callback: (result: SyloQueryResult) => void
  ): Promise<() => void> {
    const queryId = await this.createQuery(queryType, parameters, callback);
    
    const api = await TRNService.connect();
    
    // Subscribe to query results
    const unsubscribe = await api.query.sylo.queryResults(
      queryId,
      (result: any) => {
        if (result) {
          const parsedResult = this.parseQueryResult(result);
          callback(parsedResult);
        }
      }
    );

    return () => {
      unsubscribe();
      this.subscriptions.delete(queryId);
    };
  }

  /**
   * Helper method to format query parameters
   */
  private static formatQueryParameters(parameters: any): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(parameters));
  }

  /**
   * Helper method to parse query results
   */
  private static parseQueryResult<T>(result: any): T {
    try {
      const decoded = new TextDecoder().decode(result);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error parsing SYLO query result:', error);
      throw error;
    }
  }

  /**
   * Helper method to generate cache key
   */
  private static getCacheKey(queryType: string, parameters: any): string {
    return `${queryType}:${JSON.stringify(parameters)}`;
  }

  /**
   * Get the account to use for queries
   */
  private static async getQueryAccount(): Promise<string> {
    // TODO: Implement proper account management for SYLO queries
    return 'DEFAULT_QUERY_ACCOUNT';
  }
} 