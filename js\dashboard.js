// 仪表盘渲染
const Dashboard={
  sim:null,el:{roomGrid:null,miniAlertList:null,
    avgTemp:null,maxTemp:null,deviceOnline:null,activeAlerts:null},
  init(sim){
    this.sim=sim;
    this.el.roomGrid=document.getElementById('roomGrid');
    this.el.miniAlertList=document.getElementById('miniAlertList');
    this.el.avgTemp=document.getElementById('avgTemp');
    this.el.maxTemp=document.getElementById('maxTemp');
    this.el.deviceOnline=document.getElementById('deviceOnline');
    this.el.activeAlerts=document.getElementById('activeAlerts');
  },
  render(){
    const snap=this.sim.getSnapshot();
    // 计算汇总
    const temps=snap.filter(d=>d.sensorId=='temp').map(d=>d.value);
    const avg=temps.length?temps.reduce((a,b)=>a+b,0)/temps.length:0;
    const max=temps.length?Math.max(...temps):0;
    this.el.avgTemp.textContent=isNaN(avg)?'--':avg.toFixed(1);
    this.el.maxTemp.textContent=isNaN(max)?'--':max.toFixed(1);
    // 设备在线
    const total=Object.keys(DEVICE_STATES).length;
    const onCount=Object.values(DEVICE_STATES).filter(d=>d.on).length;
    this.el.deviceOnline.textContent=onCount+'/'+total;
    this.el.activeAlerts.textContent=Store.alerts.filter(a=>!a.cleared).length;
    // 区域卡片
    let html='';
    ZONES.forEach(z=>{
      const ds=snap.filter(d=>d.zoneId==z.id);
      html+=`<div class="room-card"><div class="room-name">${z.icon} ${z.name}</div>`;
      ds.forEach(d=>{
        const th=Object.values(THRESHOLDS).find(t=>t.sensor==d.sensorId);
        let cls='';
        if(th&&((th.dir=='high'&&d.value>th.val)||(th.dir=='low'&&d.value<th.val)))cls=' warn';
        html+=`<div class="sensor-row"><span>${sensorIcon(d.sensorId)} ${d.sensorId=='temp'?'温度':d.sensorId=='humidity'?'湿度':d.sensorId=='soil'?'土壤湿度':d.sensorId=='light'?'光照':d.sensorId=='co2'?'CO₂':d.sensorId}</span><span class="s-val${cls}">${d.value}${d.unit}</span></div>`;
      });
      html+='</div>';
    });
    this.el.roomGrid.innerHTML=html;
    // 最近告警
    const recent=Store.alerts.slice(0,5);
    if(recent.length){
      this.el.miniAlertList.innerHTML=recent.map(a=>`<div class="sensor-row" style="border-bottom:1px solid var(--border);padding:4px 0;"><span>${a.timeStr}</span><span style="color:var(--danger)">${a.type}</span><span>${a.room} ${a.val}${a.unit}</span></div>`).join('');
    }else{
      this.el.miniAlertList.innerHTML='<p class="empty-hint">暂无告警</p>';
    }
  }
};
function sensorIcon(id){
  const m={'temp':'🌡️','humidity':'💧','soil':'🪴','light':'☀️','co2':'🧪'};
  return m[id]||'📡';
}
