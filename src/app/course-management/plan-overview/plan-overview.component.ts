import { Component, OnInit } from '@angular/core';
import { EChartOption } from 'echarts';

@Component({
  selector: 'app-plan-overview',
  templateUrl: './plan-overview.component.html',
  styleUrls: ['./plan-overview.component.less']
})
export class PlanOverviewComponent implements OnInit {
  tabnow = true;
  ProgressData = [
    {
      name: '王晓红',
      rate: 85,
    },
    {
      name: '王晓红',
      rate: 85,
    }
  ];

  constructor() { }

  ngOnInit() {


  }

}
