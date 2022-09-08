import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExtendedFileModel } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private httpClient: HttpClient) {}

  uploadFiles(toUploadFile: ExtendedFileModel): Observable<any> {
    const headers = {
      // This is only required for the Mock File Upload service we use here
      // https://www.convertapi.com/doc/upload
      'Content-Disposition': `inline; filename: ${toUploadFile.file.name}`,
    };
    return this.httpClient
      .post(toUploadFile.uploadUrl, toUploadFile.file, {
        headers: headers,
        observe: 'events', // observe and reportProgress options are required to capture the file upload progress
        reportProgress: true,
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(error)));
  }
}
