export type Capabilities = {
  product: 'Shobdo';
  locale: 'bn' | 'en';
  stage: 'scaffold';
  capabilities: { scripts: 'not_implemented'; speech: 'not_implemented'; voiceCloning: 'not_implemented' };
};
export declare class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;
  constructor(code: string, message: string, status?: number, requestId?: string);
}
export declare function createApiClient(options?: { origin?: string; timeoutMs?: number }): {
  getCapabilities(options?: { locale?: 'bn' | 'en'; signal?: AbortSignal }): Promise<Capabilities>;
};
