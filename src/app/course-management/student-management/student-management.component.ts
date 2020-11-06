import {Component, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzModalService, NzNotificationService, UploadFile} from 'ng-zorro-antd';
import {CourseManagementBackHalfService} from '../../service/course-management-back-half/course-management-back-half.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-student-management',
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.less']
})
export class StudentManagementComponent implements OnInit {

  courseId: string;

  addingForm: FormGroup;

  studentId: string;
  studentList = [];

  teachplanId: any;
  planList = [];

  excelFile: any;
  excelList: UploadFile[] = [];
  excelData: any;
  excelHeader: any;
  importExcelForm!: FormGroup;
  readExcelButtonLoading = false;
  isSpinning = false;
  studentData = [];

  constructor(
    private routerInfo: ActivatedRoute,
    private fb: FormBuilder,
    private _modal: NzModalService,
    private courseManagement$: CourseManagementBackHalfService,
    private _notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.courseId = location.pathname.split('/')[3];
    this.teachplanId = location.pathname.split('/')[5];
    this.searchStudent(this.teachplanId, '');
    this.importExcelForm = this.fb.group({
      money: [0.00, [Validators.required]],
      phoneNumberPrefix: ['+86'],
      note: [null]
    });
  }

  openAddingStudentModal(template: TemplateRef<{}>) {
    this.addingForm = this.fb.group({
      username: ['', Validators.required],
      comment: ['']
    });
    const modal = this._modal.create({
      nzTitle: '添加学员',
      nzContent: template,
      nzOkText: '添加',
      nzOnOk: () => {
        this.addingForm.controls.comment.markAsDirty();
        this.addingForm.controls.username.markAsDirty();
        this.addingForm.controls.comment.updateValueAndValidity();
        this.addingForm.controls.username.updateValueAndValidity();
        if (!this.addingForm.controls.comment.errors && !this.addingForm.controls.username.errors) {
          this.courseManagement$.addStudent(this.teachplanId, this.courseId, this.studentId).subscribe(result => {
            let i;
            this.courseManagement$.addingStatus.subscribe(value => i = value);
            this.courseManagement$.addingStatus.next(i+1);
            this._notification.success(
              '添加成功！',
              ''
            )
          }, error1 => {
            this._notification.error(
              '添加失败！',
              `${error1.error}`
            )
          })
        } else {
          return false;
        }
      }
    });
    modal.afterClose.subscribe(() => {
      this.searchStudent(this.teachplanId, '');
      this.studentId = '';
    })
  }


  searchStudent(id: string, name: '') {
    this.courseManagement$.searchAddableStudent(id, name).subscribe(result => {
      this.studentList = result.data
    })
  }

  onInput(value: any) {
    this.searchStudent(this.teachplanId, value)

  }

  getStudentId(data: any) {
    this.studentId = data.nzValue
  }


  onChange(data: any) {
    this.teachplanId = data;
    this.searchStudent(this.teachplanId, '');
  }

  openImportStudentModal(template: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
    const modal = this._modal.create({
      nzTitle: '导入学员',
      nzContent: template,
      nzOkText: '导入',
      nzFooter: tplFooter
    });
  }
  beforeUpload = (file: UploadFile): boolean => {
    this.excelList = [];
    this.excelFile = file;
    this.excelList = this.excelList.concat(file);
    return false;
  }



  readExcel() {
    this.isSpinning = true;
    this.readExcelButtonLoading = true;
    if (this.excelFile) {
      // const reader: FileReader = new FileReader();
      // reader.onload = (e: any) => {
      //   const bstr: string = e.target.result;
      //   const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
      //   const wsname: string = wb.SheetNames[0];
      //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      //   this.excelData = XLSX.utils.sheet_to_json(ws, {header: 1});
      //   this.excelHeader = this.excelData[1];
      //   this.studentData = this.excelData.slice(2);
      //   console.log(this.studentData);
      //   this.readExcelButtonLoading = false;
      // };
      // reader.readAsBinaryString(this.excelFile);
      const formData = new FormData();
      formData.append('file', this.excelFile);
      console.log(formData.get('file'));
      this.courseManagement$.uploadExcel(formData).subscribe(result => {
        console.log(result);
        this._notification.success(
          '添加成功！',
          ''
        )
      }, error1 => {
        this._notification.error(
          '导入失败！',
          `${error1.error}`
        )
      });
    }
    this.isSpinning = false;
    this.excelList = [];
    this.excelFile = [];
  }
}

