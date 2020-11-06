import { Component, OnInit } from '@angular/core';
import {UserInfoViewModalComponent} from '../../../../core/modal/user-info-view-modal/user-info-view-modal.component';
import {AdminOpenClassService} from '../../../../service/admin-open-class/admin-open-class.service';
import {NzMessageService, NzModalService, NzNotificationService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {TeacherRecommendModalComponent} from '../../../../core/modal/teacher-recommend-modal/teacher-recommend-modal.component';

@Component({
  selector: 'app-admin-open-class-recommendation-table',
  templateUrl: './admin-open-class-recommendation-table.component.html',
  styleUrls: ['./admin-open-class-recommendation-table.component.less']
})
export class AdminOpenClassRecommendationTableComponent implements OnInit {

  options = [
    {
      value: '18',
      label: '学堂在线',
      children: [
        {
          value: '7',
          label: '小学年级',
          isLeaf: true
        },
        {
          value: '8',
          label: '初中年级',
          isLeaf: true
        },
        {
          value: '12',
          label: '高中年级',
          isLeaf: true
        },
        {
          value: '25',
          label: '高职年级',
          isLeaf: true
        }
      ]
    },{
      label: '教师培训',
      value: '26',
      isLeaf: true
    }, {
      label: '寓教于乐',
      value: '21',
      isLeaf: true
    }, {
      label: '专题讲座',
      value: '20',
      isLeaf: true
    }, {
      label: '使用教程',
      value: '1',
      children: [
        {
          label: '管理员',
          value: '4',
          isLeaf: true
        },
        {
          label: '教师',
          value: '5',
          isLeaf: true
        },
        {
          label: '学员',
          value: '6',
          isLeaf: true
        }
      ]
    }
  ];
  courseClassification = [];
  title: string = "";
  creator: string = "";
  filterOptions = {
    courseClassification: '',
    title: '',
    creator: ''
  };

  totalCourse = 0;

  displayData = [];
  dataList = [];
  loading: boolean = false;
  pageIndex: number = 1;

  constructor(
    private adminOpenClassService$: AdminOpenClassService,
    private _modal: NzModalService,
    private _notification: NzNotificationService,
    private router: Router
  ) {
    this.adminOpenClassService$.changeStatus.subscribe(value => {
      this.searchData()
    })
  }

  ngOnInit() {
  }

  filterCourse() {
    let courseClassification = '';
    if (this.courseClassification.length > 0) {
      courseClassification = this.courseClassification[this.courseClassification.length - 1]
    }
    this.filterOptions = {
      courseClassification: courseClassification,
      title: this.title,
      creator: this.creator
    };
    this.displayData = [];
    this.loading = true;
    this.pageIndex = 1;
    this.adminOpenClassService$.getRecommendOpenClassList(10, this.pageIndex, this.filterOptions).subscribe(result =>{
      this.loading = false;
      this.totalCourse = result.data.total ? result.data.total: 0;
      this.dataList = result.data.data;
      this.displayData = this.dataList
    }, error1 => {
      this.loading = false;
      this._notification.create(
        'error',
        '发生错误！',
        `${error1.error}`)
    })
  }

  searchData(pageIndex: number = this.pageIndex) {
    this.displayData = [];
    this.loading = true;
    this.adminOpenClassService$.getRecommendOpenClassList(10, pageIndex, this.filterOptions).subscribe( result => {
      this.loading = false;
      this.totalCourse = result.data.total ? result.data.total: 0;
      this.dataList = result.data.data;
      this.displayData = this.dataList
    }, error1 => {
      this.loading = false;
      this._notification.create(
        'error',
        '发生错误！',
        `${error1.error}`)
    })
  }

  navigateTo(url: string) {
    window.open(url, '_blank')
  }

  openTeacherIntroModal(id: string) {
    const modal = this._modal.create({
      nzTitle: '个人详细信息',
      nzContent: UserInfoViewModalComponent,
      nzComponentParams: {
        userId: id
      },
      nzWidth: 600,
      nzFooter: null
    })
  }

  setRecommendOrder(id: string) {
    const modal = this._modal.create({
      nzTitle: '设置推荐序号',
      nzContent: TeacherRecommendModalComponent,
      nzComponentParams: {
        id: id
      },
      nzOnOk: instance => instance.submit(),
      nzOnCancel: instance => instance.destroy()
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.adminOpenClassService$.setOpenCourseRecommend(id, result).subscribe(result => {
          this._notification.create(
            'success',
            '设置推荐成功！',
            ''
          );
          let i;
          this.adminOpenClassService$.changeStatus.subscribe(value => i = value);
          this.adminOpenClassService$.changeStatus.next(i + 1);
        }, error1 => {
          this._notification.create(
            'error',
            '发生错误！',
            `${error1.error}`
          )
        })
      }
    })
  }

  cancelRecommendCourse(id: string) {
    this._modal.confirm({
      nzTitle: '是否要取消推荐？',
      nzOnOk: () => this.adminOpenClassService$.cancelOpenCourseRecommend(id).subscribe(result => {
        this.adminOpenClassService$.cancelOpenCourseRecommend(id).subscribe(result => {
          this._notification.create(
            'success',
            '取消推荐成功！',
            ''
          );
          let i;
          this.adminOpenClassService$.changeStatus.subscribe(value => i = value);
          this.adminOpenClassService$.changeStatus.next(i + 1);
        }, error1 => {
          this._notification.create(
            'error',
            '发生错误！',
            `${error1.error}`
          )
        })
      })
    })
  }

}
