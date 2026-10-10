export interface ApiResponse<T = unknown> {
  status: boolean;
  code: number;
  message?: string;
  payload?: T;
}
