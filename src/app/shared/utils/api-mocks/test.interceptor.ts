import { HttpInterceptorFn } from '@angular/common/http';

export const testInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
