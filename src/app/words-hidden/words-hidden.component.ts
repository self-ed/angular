import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {UserService} from '../services/user.service';
import {ConfirmationDialogComponent} from '../dialogs/confirmation-dialog.component';
import {WordHiddenEnterDialogComponent} from '../dialogs/word-hidden-enter-dialog.component';
import {DataTableComponent} from '../data-table/data-table.component';

@Component({
  selector: 'app-words-hidden',
  templateUrl: './words-hidden.component.html',
  styleUrls: ['./words-hidden.component.css']
})
export class WordsHiddenComponent implements OnInit {
  words = [];
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.refreshTable();
  }

  isAnySelected(): boolean {
    return !!this.dataTable.getSelected().length;
  }

  delete(): void {
    this.dialog.open(ConfirmationDialogComponent, {
      autoFocus: false,
      data: 'Are you sure you want to delete the words selected?'
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.dataTable.getSelected().forEach(word => this.userService.saveHidden(word, false));
        this.refreshTable();
      }
    });
  }

  openWordEnterDialog(): void {
    this.dialog.open(WordHiddenEnterDialogComponent).afterClosed().subscribe(word => {
      if (word) {
        this.userService.saveHidden(word, true);
        this.refreshTable();
      }
    });
  }

  private refreshTable(): void {
    this.words = this.userService.getHidden();
  }
}
