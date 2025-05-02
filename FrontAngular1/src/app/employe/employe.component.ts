import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil, filter } from 'rxjs';
import { FileManagerComponent } from '../modules/admin/apps/file-manager/file-manager.component';

@Component({
  selector: 'app-employe',
  standalone: true,
  templateUrl: './employe.component.html',
  styleUrl: './employe.component.scss',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports        : [MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, NgApexchartsModule, MatTableModule, MatSortModule, NgClass, MatProgressBarModule, CurrencyPipe, DatePipe],
})
export class EmployeComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('employeTable', {read: MatSort}) employeTableMatSort: MatSort;

    data: any;
    accountBalanceOptions: ApexOptions;
    employeDataSource: MatTableDataSource<any> = new MatTableDataSource();
    employeTableColumns: string[] = ['email','name', 'birth day','number',"state","changeState"];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the data
       
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Make the data source sortable
        this.employeDataSource.sort = this.employeTableMatSort;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    stateC(id:string):void
    {
      
      
    
    }

   

}
