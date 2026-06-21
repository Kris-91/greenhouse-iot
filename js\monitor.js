// 数据分析图表
const Monitor={
  sim:null,chart:null,zoneId:'all',sensorId:'temp',range:120,
  el:{chartCanvas:null,fallback:null},
  init(sim){
    this.sim=sim;
    this.el.chartCanvas=document.getElementById('sensorChart');
    this.el.fallback=document.getElementById('chartFallback');
    this.setupControls();
    this.initChart();
    if(typeof Chart=='undefined')this.el.fallback.style.display='block';
  },
  setupControls(){
    // 区域
    const ro=document.getElementById('roomOptionsMonitor');
    ro.innerHTML='<button class="active" data-v="all">🌐 全区域</button>'+ZONES.map(z=>`<button data-v="${z.id}">${z.icon} ${z.name}</button>`).join('');
    ro.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ro.querySelectorAll('button').forEach(b=>b.classList.remove('active'));b.classList.add('active');this.zoneId=b.dataset.v;this.updateChart();});
    // 指标
    const so=document.getElementById('sensorOptionsMonitor');
    so.innerHTML=[{id:'temp',l:'🌡️ 温度'},{id:'humidity',l:'💧 湿度'},{id:'soil',l:'🪴 土壤湿度'},{id:'light',l:'☀️ 光照'},{id:'co2',l:'🧪 CO₂'}].map((s,i)=>`<button class="${i==0?'active':''}" data-v="${s.id}">${s.l}</button>`).join('');
    so.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;so.querySelectorAll('button').forEach(b=>b.classList.remove('active'));b.classList.add('active');this.sensorId=b.dataset.v;this.updateChart();});
    // 时间范围
    const ra=document.getElementById('rangeOptionsMonitor');
    ra.innerHTML=[{v:60,l:'最近1分钟'},{v:120,l:'最近2分钟',a:true},{v:300,l:'最近5分钟'}].map(r=>`<button class="${r.a?'active':''}" data-v="${r.v}">${r.l}</button>`).join('');
    ra.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ra.querySelectorAll('button').forEach(b=>b.classList.remove('active'));b.classList.add('active');this.range=parseInt(b.dataset.v);this.updateChart();});
  },
  initChart(){
    if(typeof Chart=='undefined')return;
    const ctx=this.el.chartCanvas.getContext('2d');
    this.chart=new Chart(ctx,{
      type:'line',
      data:{labels:[],datasets:[]},
      options:{
        responsive:true,maintainAspectRatio:true,aspectRatio:2.4,
        animation:{duration:300},
        scales:{
          x:{grid:{color:'rgba(74,222,128,.08)'},ticks:{color:'#8bb88b',maxTicksLimit:10}},
          y:{grid:{color:'rgba(74,222,128,.08)'},ticks:{color:'#8bb88b'},beginAtZero:false}
        },
        plugins:{legend:{labels:{color:'#d4edda',boxWidth:12}}},
        interaction:{mode:'nearest',intersect:false}
      }
    });
    this.el.fallback.style.display='none';
  },
  updateChart(){
    if(!this.chart)return;
    const labels=[],datasets=[];
    // 确定要显示的zone
    const zones=this.zoneId=='all'?ZONES:ZONES.filter(z=>z.id==this.zoneId);
    const colors=['#4ade80','#fbbf24','#f87171','#60a5fa','#c084fc'];
    zones.forEach((z,i)=>{
      const data=this.sim.getHistory(z.id,this.sensorId,this.range);
      if(datasets.length==0)data.forEach(d=>labels.push(new Date(d.time).toLocaleTimeString()));
      datasets.push({label:z.name,data:data.map(d=>d.value),borderColor:colors[i%colors.length],backgroundColor:colors[i%colors.length]+'33',borderWidth:2,pointRadius:0,tension:.3,fill:true});
    });
    if(datasets.length==0)return;
    this.chart.data.labels=labels;
    this.chart.data.datasets=datasets;
    this.chart.update('none');
  }
};
