import { Injectable } from '@angular/core';

export interface MockedRequests {
  url: string;
  operation: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response: {
    status: number;
    body: any;
    delay?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MockApiService {
  private mockedRequests: Array<MockedRequests> = [];

  // TODO: find what to do when the request has parameters
  getResponse(
    url: string,
    operation: string,
  ): MockedRequests['response'] | null {
    const request = this.mockedRequests.find(
      (request) => request.url === url && request.operation === operation,
    );

    if (!request) {
      return null;
    }

    return request.response;
  }

  setAll(requests: Array<MockedRequests>) {
    this.mockedRequests = requests;
  }

  add(request: MockedRequests) {
    this.mockedRequests.push(request);
  }

  remove(request: MockedRequests) {
    this.mockedRequests = this.mockedRequests.filter((r) => r !== request);
  }

  clear() {
    this.mockedRequests = [];
  }
}
