import { HttpRequest, HttpResponse } from '@angular/common/http';

export interface ApiRequestMock {
  /**
   * The HTTP method to match the request against.
   */
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'JSONP';

  /**
   * The URL to match the request.
   */
  url?: string | RegExp;

  /**
   *  Matcher function to match the request.
   */
  requestMatcher?: (request: HttpRequest<unknown>) => HttpResponse<unknown>;

  /**
   * The response to return when the request matches.
   */
  response?: unknown;

  /**
   * The status code to return when the request matches.
   */
  status?: 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504;

  /**
   *  The delay in milliseconds to wait before returning the response.
   */
  delay?: number;

  /**
   * The total count to include in the response headers.
   */
  count?: number;

  /**
   * The status text to return in case of a server error.
   */
  statusText?: string;
}
