import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Course } from '../model/course';
import { CoursesService } from './courses.service';

@Injectable()
export class CourseResolver implements Resolve<Course> {
  constructor(
    private coursesService: CoursesService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Course> {
    const courseId = route.params['id'];

    const COURSE_KEY = makeStateKey<Course>('courseKey-' + courseId);

    // Si estamso en el servidor o si no tenemos los datos en la transferState
    // se realiza la consulta de los datos
    if (
      !this.transferState.hasKey(COURSE_KEY) ||
      isPlatformServer(this.platformId)
    ) {
      return this.coursesService.findCourseById(courseId).pipe(
        first(),
        tap((course) => {
          this.transferState.set(COURSE_KEY, course);
        })
      );
    }

    // En el cliente o si tenemos datos en la trasnferState
    // No hace falta hacer la consulta de los datos
    const course = this.transferState.get(COURSE_KEY, null);
    this.transferState.remove(COURSE_KEY);
    return of(course);
  }
}
