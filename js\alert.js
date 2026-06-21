// 告警引擎与告警管理
const AlertEngine={
  filterType:'all',soundOn:true,audioCtx:null,
  el:{thresholds:null,filterEl:null,tableBody:null,soundToggle:null,clearBtn:null,badgeNum:null},
  init(){
    this.el.thresholds=document.getElementById('thresholds');
    this.el.filterEl=document.getElementById('alertFilters');
    this.el.tableBody=document.getElementById('alertTableBody');
    this.el.soundToggle=document.getElementById('soundToggle');
    this.el.clearBtn=document.getElementById('clearAlerts');
    this.el.badgeNum=document.getElementById('badgeNum');
    this.renderThresholds();
    this.renderFilters();
    this.renderHistory();
    if(localStorage.getItem('gh_thresholds'))Store.thresholds=JSON.parse(localStorage.getItem('gh_thresholds'));
    this.bind();
    setInterval(()=>this.renderHistory(),3000);
  },
  bind(){
    this.el.soundToggle.addEventListener('change',()=>{this.soundOn=this.el.soundToggle.checked;});
    this.el.clearBtn.addEventListener('click',()=>{Store.clearAlerts();this.renderHistory();updateBadge();});
  },
  check(snapshot){
    if(!Store.thresholds || Object.keys(Store.thresholds).length===0)Store.thresholds=THRESHOLDS;
    snapshot.forEach(d=>{
      Object.values(Store.thresholds).forEach(t=>{
        if(t.sensor!==d.sensorId)return;
        let triggered=false;
        if(t.dir=='high'&&d.value>t.val)triggered=true;
        if(t.dir=='low'&&d.value<t.val)triggered=true;
        if(triggered){
          const now=new Date();
          const timeStr=now.toLocaleTimeString();
          const roomName=ZONES.find(z=>z.id==d.zoneId)?.name||d.zoneId;
          // deduplicate: don't push same alert in 30s
          const dup=Store.alerts.find(a=>a.room==roomName&&a.type==t.label&&Math.abs(new Date(a.timestamp)-now)<30000);
          if(!dup){
            Store.pushAlert({timestamp:now.getTime(),timeStr,room:roomName,type:t.label,val:d.value,threshold:t.val,unit:t.unit,cleared:false});
            this.renderHistory();
            updateBadge();
            if(this.soundOn)this.playBeep();
          }
        }
      });
    });
  },
  renderThresholds(){
    let html='<h3>⚙️ 告警阈值配置</h3>';
    Object.values(THRESHOLDS).forEach(t=>{
      const saved=Store.thresholds[t.key];
      const val=saved?saved.val:t.val;
      html+=`<div class="threshold-row"><label>${t.label}</label><input type="number" data-key="${t.key}" value="${val}" min="0" max="99"> <span>${t.unit}</span></div>`;
    });
    this.el.thresholds.innerHTML=html;
    this.el.thresholds.addEventListener('change',e=>{
      const inp=e.target.closest('input');
      if(!inp)return;
      Store.thresholds[inp.dataset.key]={...THRESHOLDS[inp.dataset.key],val:parseFloat(inp.value)};
      Store.saveThresholds();
    });
  },
  renderFilters(){
    const types=[{v:'all',l:'全部类型'}].concat(Object.values(THRESHOLDS).map(t=>({v:t.label,l:t.label})));
    this.el.filterEl.innerHTML=types.map((t,i)=>`<button class="${i==0?'active':''}" data-v="${t.v}">${t.l}</button>`).join('');
    this.el.filterEl.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      this.el.filterEl.querySelectorAll('button').forEach(b=>b.classList.remove('active'));b.classList.add('active');
      this.filterType=b.dataset.v;this.renderHistory();
    });
  },
  renderHistory(){
    const list=this.filterType=='all'?Store.alerts:Store.alerts.filter(a=>a.type==this.filterType);
    if(list.length){
      this.el.tableBody.innerHTML=list.slice(0,50).map(a=>`<tr><td>${a.timeStr}</td><td>${a.room}</td><td>${a.type}</td><td>${a.val}${a.unit}</td><td>${a.threshold}${a.unit}</td></tr>`).join('');
    }else{
      this.el.tableBody.innerHTML='<tr><td colspan="5" class="empty-hint">暂无告警记录</td></tr>';
    }
  },
  playBeep(){
    try{
      if(!this.audioCtx)this.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      const osc=this.audioCtx.createOscillator();
      const gain=this.audioCtx.createGain();
      osc.connect(gain);gain.connect(this.audioCtx.destination);
      osc.frequency.value=800;gain.gain.value=.15;
      osc.start();osc.stop(this.audioCtx.currentTime+.15);
    }catch(e){}
  }
};
function updateBadge(){
  const n=Store.alerts.filter(a=>!a.cleared).length;
  const el=document.getElementById('badgeNum');
  if(el)el.textContent=n;
}
