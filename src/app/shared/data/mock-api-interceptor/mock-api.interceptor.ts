import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MockApiService } from './mock-api.service';

export function mockApiInterceptor(
  request: HttpRequest<any>,
  next: HttpHandler,
): Observable<HttpEvent<unknown>> {
  
  const mockApiService = inject(MockApiService);

  const response = mockApiService.getResponse(
    request.url,
    request.method.toUpperCase(),
  );

  if (!response) {
    return next.handle(request);
  }

  return of(
    new HttpResponse({
      status: response.status,
      body: response.body,
    }),
  ).pipe(delay(response.delay ?? 0));
}
