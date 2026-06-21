// 主控制器
let simulator, dashboard, monitor, control, alertEngine;
(function(){
  'use strict';
  simulator=new Simulator(ZONES);
  Store.init();
  // 注意：Dashboard/Monitor/Control/AlertEngine 是普通对象，不是类，不能加 new
  dashboard = Dashboard;
  monitor = Monitor;
  control = Control;
  alertEngine = AlertEngine;
  
  dashboard.init(simulator);
  monitor.init(simulator);
  control.init();
  alertEngine.init();
  
  // 标签切换
  document.querySelector('.tab-bar').addEventListener('click',e=>{
    const btn=e.target.closest('.tab-btn');
    if(!btn)return;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab=='monitor')setTimeout(()=>monitor.updateChart(),100);
  });
  // 时钟
  setInterval(()=>{
    const d=new Date();
    document.getElementById('clock').textContent=d.toLocaleTimeString();
  },1000);
  // 数据循环
  setInterval(()=>{
    simulator.tick();
    const snap=simulator.getSnapshot();
    alertEngine.check(snap);
    dashboard.render();
    if(document.getElementById('tab-monitor').classList.contains('active'))monitor.updateChart();
  },2000);
})();
