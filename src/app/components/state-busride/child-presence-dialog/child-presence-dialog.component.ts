import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {PresenceChild} from '../../../models/presencebusride';

@Component({
  selector: 'app-child-presence-dialog',
  templateUrl: './child-presence-dialog.component.html',
  styleUrls: ['./child-presence-dialog.component.css']
})
export class ChildPresenceDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ChildPresenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

  convertTimestampToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const h = date.getHours();
    const m = date.getMinutes();
    return (('0' + h).slice(-2) + ':' + ('0' + m).slice(-2));
  }

}
