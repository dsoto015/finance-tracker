import { Component, inject, Inject, model,} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notes-dialog',
  standalone: false,
  templateUrl: './notes-dialog.component.html',
  styleUrl: './notes-dialog.component.scss'
})
export class NotesDialogComponent {
  readonly dialogRef = inject(MatDialogRef<NotesDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { category: string, note: string };

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick(): void {
    this.dialogRef.close(this.data.note);
  }
}
