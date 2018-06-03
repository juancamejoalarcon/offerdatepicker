import {Component, ViewChild, ElementRef, Renderer2, OnInit} from '@angular/core';
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
export class AppComponent implements OnInit {
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  blackOutDate: NgbDateStruct;
  blackOutsList: Array<NgbDateStruct> = [];
  blackOutModeActive: boolean = false;

  @ViewChild('blackoutsDatePicker') blackoutsDatePicker: ElementRef;

  constructor(calendar: NgbCalendar, private renderer: Renderer2) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
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
          const index = this.blackOutsList.indexOf(this.isInBlackOutsList(date));
          if (index !== -1) this.blackOutsList.splice(index, 1);
        }
      }
    }
  }

  blackoutMode() {
    if (!this.blackOutModeActive) {
      this.blackOutModeActive = true;
      const days = this.blackoutsDatePicker.nativeElement.querySelectorAll('.ngb-dp-day');
      for (const day of days) {
        if (!day.childNodes[2].classList.contains('range')) {
          day.style.pointerEvents = 'none';
        }
      }
      // (Ugly programming alert)
      // This function makes sure that if you click an arrow you cannot 
      // click days out of the selected range
      for (const arrow of this.blackoutsDatePicker.nativeElement.querySelectorAll('.ngb-dp-arrow')) {
        const arrowListener = this.renderer.listen(arrow, 'click', () => {
          if (this.blackOutModeActive) {
            const days = this.blackoutsDatePicker.nativeElement.querySelectorAll('.ngb-dp-day');
            for (const day of days) {
              if (!day.childNodes[2].classList.contains('range')) {
              day.style.pointerEvents = 'none';
            }
          }
        }
      });
    }
    } else {
      this.blackOutModeActive = false;
      const days = this.blackoutsDatePicker.nativeElement.querySelectorAll('.ngb-dp-day');
      for (const day of days) {
        day.style.pointerEvents = 'auto';
      }
    }
  }

  isInBlackOutsList(date: NgbDateStruct) {
    for (const blackout of this.blackOutsList) {
      if (equals(date, blackout)) {
        return true && blackout;
      }
    }
  }

  clearBlackoutsList() {
    this.blackOutsList = [];
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  // This function checks if a date is within a range
  isInRange = date => this.isFrom(date) || this.isTo(date) || this.isInside(date) || this.isHovered(date);
}
