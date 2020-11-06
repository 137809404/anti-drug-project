import { Component, OnInit } from '@angular/core';
import {UserStatisticsService} from '../../../service/user-statistics/user-statistics.service';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.less']
})
export class UserStatisticsComponent implements OnInit {

  usernameInput: string = '';

  dateRange = [];

  dataList = [];
  displayData = [];
  loading: boolean = false;
  total: number = 0;
  totalPage: number;
  pageIndex: number = 1;

  filterOptions = {
    starTime: 0,
    endTime: 0,
    searchParameter: ''
  };
  csvSeparator = ',';

  constructor(
    private userStatisticsService$: UserStatisticsService,
    private _notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.searchData()
  }

  searchData(filterOptions = this.filterOptions, pageIndex: number = this.pageIndex) {
    this.displayData = [];
    this.loading = true;
    this.userStatisticsService$.getUserStatisticTable(pageIndex, 10, filterOptions).subscribe(result => {
      this.loading = false;
      this.totalPage = Math.ceil(this.total / 10);
      this.dataList = result;
      this.displayData = this.dataList;
    }, error1 => {
      this.loading = false;
      this._notification.create(
        'error',
        `${error1.error}`,
        ''
      )
    })
  }

  search() {
    let startTime = 0;
    let endTime = new Date().getTime() / 1000;
    this.pageIndex = 1;
    if (this.dateRange.length == 2) {
      startTime = Math.floor(new Date(this.dateRange[0]).getTime() / 1000);
      endTime = Math.floor(new Date(this.dateRange[1]).getTime() / 1000)
    }
    this.displayData = [];
    this.loading = true;
    this.filterOptions = {
      starTime: startTime,
      endTime: endTime,
      searchParameter: this.usernameInput
    };
    this.userStatisticsService$.getUserStatisticTable( 1, 10, this.filterOptions).subscribe(result => {
      this.loading = false;
      this.totalPage = Math.ceil(this.total / 10);
      this.dataList = result;
      this.displayData = this.dataList;
    }, error1 => {
      this.loading = false;
      this._notification.create(
        'error',
        `${error1.error}`,
        ''
      )
    })
  }

  // exportDta() {
  //   this.userStatisticsService$.exportData().subscribe(result => {
  //     let blob = new Blob([result], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
  //     saveAs(blob, 'user-statistics.xlsx');
  //   })
  // }
  exportDta(exportFilename) {
    const data = this.dataList;
    let csv = '\ufeff';
    const columns = [
      'nickName',
      'joinedClassroomNum',
      'exitClassroomNum',
      'joinedCourseNum',
      'exitCourseNum',
      'finishedTaskNum',
      'learnedSeconds'
    ];
    // headers
    const columnsData = [
      '用户名',
      '加入班级数',
      '退出班级数',
      '加入计划数',
      '退出计划数',
      '学完任务数',
      '学习时长（分）'
    ];
    for (let i = 0; i < columns.length; i++) {
      const column = columnsData[i];
      csv += '"' + column + '"';
      if (i < (columns.length-1)) {
        csv += this.csvSeparator;
      }
    }
    // body
    this.dataList.forEach((record) => {
      csv += '\n';
      for (let i_1 = 0; i_1 < columns.length; i_1++) {
        const column = columns[i_1];
        csv += '"' + this.resolveFieldData(record, column) + '"';
        if (i_1 < (columns.length - 1)) {
          csv += this.csvSeparator;
        }
      }
    });
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, exportFilename + '.csv');
    } else {
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', exportFilename + '.csv');
        link.click();
      } else {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        window.open(encodeURI(csv));
      }
      document.body.removeChild(link);
    }
  }
  resolveFieldData(data, field) {
    if (data && field) {
      if (field.indexOf('.') === -1) {
        return data[field];
      } else {
        const fields = field.split('.');
        let value = data;
        for (let i = 0, len = fields.length; i < len; ++i) {
          if (value === null) {
            return null;
          }
          value = value[fields[i]];
        }
        return value;
      }
    } else {
      return null;
    }
  }

}
