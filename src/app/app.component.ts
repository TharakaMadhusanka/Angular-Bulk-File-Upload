import { Component } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import {
  HttpEventType,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Ng Bulk File Upload';

  toUploadFilesList: ExtendedFileModel[] = [];

  constructor(private fileUploadService: FileUploadService) {}

  addFiles(event: Event) {
    this.toUploadFilesList = [];
    const { target } = event;
    const filesList = (target as HTMLInputElement).files;
    if (!filesList) return;
    this.constructToUploadFilesList(filesList);
  }

  uploadFiles(): void {
    const requestsList = this.constructRequestsChain();
    this.executeFileUpload(requestsList);
  }

  private constructRequestsChain(): any {
    return this.toUploadFilesList.map((item, index) => {
      return this.fileUploadService.uploadFiles(item).pipe(
        tap((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.toUploadFilesList[index].uploadStatus.progressCount =
              Math.round(100 * (event.loaded / event.total));
          }
        }),
        catchError((error) => {
          return of({ isError: true, index, error });
        })
      );
    });
  }

  private executeFileUpload(requestsChain: any[]): void {
    forkJoin(requestsChain).subscribe((response: any) => {
      response.forEach((item: { isError: any; index: number; error: { statusText: string; }; }) => {
        if (item.isError) {
          this.toUploadFilesList[item.index].uploadStatus.isError = true;
          this.toUploadFilesList[item.index].uploadStatus.errorMessage =
            item.error.statusText;
        }
      });
    })
  }

  private constructToUploadFilesList(filesList: FileList): void {
    Array.from(filesList).forEach((item: File, index: number) => {
      const newFile: ExtendedFileModel = {
        file: item,
        uploadUrl: (index % 2 === 0) ? 'https://v2.convertapi.com/upload': '',
        uploadStatus: {
          isSucess: false,
          isError: false,
          errorMessage: '',
          progressCount: 0,
        },
      };
      this.toUploadFilesList.push(newFile);
    });
  }
}

export interface ExtendedFileModel {
  file: File;
  uploadUrl: string;
  uploadStatus: {
    isSucess: boolean;
    isError: boolean;
    errorMessage: string;
    progressCount: number;
  };
}
