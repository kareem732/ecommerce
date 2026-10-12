import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Handel Req
  let spinner = inject(NgxSpinnerService)
  spinner.show()



  
  return next(req).pipe(finalize(()=>{
    spinner.hide()
  }));// Handel Res
};
