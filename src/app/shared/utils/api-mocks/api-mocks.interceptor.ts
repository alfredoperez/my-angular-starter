/*
 * Copyright (C) 2021 SailPoint Technologies, Inc.  All rights reserved.
 */
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { delay, of } from 'rxjs';
import { ApiRequestMock } from './api-mocks.models';

export const mocksInterceptor =
  (requestsMocks?: Array<ApiRequestMock>) => (req: any, next: any) => {
    if (req.url.indexOf('.json') > -1) {
      return next.handle(req);
    }

    const mockedResponse = getResponse(req, requestsMocks);
    if (!!mockedResponse?.response) {
      return of(mockedResponse.response).pipe(
        delay(mockedResponse?.delay || 0),
      );
    }
    return next.handle(req);
  };

const getResponse = (
  request: HttpRequest<any>,
  requestsMocks?: Array<ApiRequestMock>,
): {
  response: HttpResponse<unknown>;
  delay: number;
} | null => {
  if (!requestsMocks) {
    return null;
  }

  for (const mockedRequest of requestsMocks) {
    if (isRequestMatch(request, mockedRequest)) {
      if (mockedRequest.status && mockedRequest.status > 299) {
        throwErrorResponse(mockedRequest);
      }

      return {
        response: createResponse(mockedRequest),
        delay: mockedRequest.delay ?? 0,
      };
    }
  }

  return null;
};

const isRequestMatch = (
  request: HttpRequest<any>,
  mockedRequest: ApiRequestMock,
): boolean => {
  if (!mockedRequest.url && mockedRequest.requestMatcher) {
    return !!mockedRequest.requestMatcher(request);
  }

  const isUrlMatch =
    (mockedRequest.url === request.urlWithParams ||
      new RegExp(mockedRequest.url ?? '').test(request.urlWithParams)) &&
    request.method === mockedRequest.method;

  if (isUrlMatch && mockedRequest.requestMatcher) {
    return !!mockedRequest.requestMatcher(request);
  }

  return isUrlMatch;
};

const throwErrorResponse = (mockedRequest: ApiRequestMock): void => {
  throw new HttpErrorResponse({
    error: mockedRequest.response,
    statusText: mockedRequest.statusText,
  });
};

const createResponse = (
  mockedRequest: ApiRequestMock,
): HttpResponse<unknown> => {
  return new HttpResponse(
    mockedRequest.count !== undefined
      ? {
          status: mockedRequest.status || 200,
          body: mockedRequest.response,
          headers: new HttpHeaders().set(
            'x-total-count',
            `${mockedRequest.count}`,
          ),
        }
      : {
          status: mockedRequest.status || 200,
          body: mockedRequest.response,
        },
  );
};
