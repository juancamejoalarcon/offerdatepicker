import {Component, ViewChild, ElementRef} from '@angular/core';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  blackOutDate: NgbDateStruct;
  blackOutsList: Array<NgbDateStruct> = [];
  blackOutModeActive: boolean = false;
  @ViewChild('prueba') prueba: ElementRef;

  constructor(calendar: NgbCalendar) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  onDateSelection(date: NgbDateStruct) {
    if (!this.blackOutModeActive) {
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
      } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
        this.toDate = date;
      } else {
        this.toDate = null;
        this.fromDate = date;
      }
    } else {
      if (!this.blackOutsList.length) {
        this.blackOutDate = date;
        this.blackOutsList.push(date);
      } else {
        if (!this.isInBlackOutsList(date)) {
          this.blackOutDate = date;
          this.blackOutsList.push(date);
        } else {
          var index = this.blackOutsList.indexOf(this.isInBlackOutsList(date));
          if (index !== -1) this.blackOutsList.splice(index, 1);
        }
      }
    }
  }

  blackoutMode() {
    if (!this.blackOutModeActive) {
      this.blackOutModeActive = true;
      const probando = this.prueba.nativeElement.querySelectorAll('.ngb-dp-day');
      for (const prueba of probando) {
        if (!prueba.childNodes[2].classList.contains('range')) {
          prueba.style.pointerEvents = 'none';
        }
      }
    } else {
      this.blackOutModeActive = false;
      const probando = this.prueba.nativeElement.querySelectorAll('.ngb-dp-day');
      for (const prueba of probando) {
        prueba.style.pointerEvents = 'auto';
      }
    }
  }

  isInBlackOutsList(date: NgbDateStruct) {
    for (let blackout of this.blackOutsList) {
      if (equals(date, blackout)) {
        return true && blackout
      }
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  // This function checks if a date is within a range
  isInRange = date => this.isFrom(date) || this.isTo(date) || this.isInside(date) || this.isHovered(date);
}
