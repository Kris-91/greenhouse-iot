// 设备控制面板
const Control={
  el:{grid:null},
  init(){
    this.el.grid=document.getElementById('controlGrid');
    this.render();
    this.bindMasterBar();
  },
  render(){
    let html='';
    ZONES.forEach(z=>{
      z.devices.forEach(d=>{
        const key=z.id+'_'+d.id;
        const state=DEVICE_STATES[key];
        if(!state)return;
        html+=`<div class="control-card" data-key="${key}">
          <span class="dev-icon">${d.icon}</span>
          <div class="dev-info">
            <div class="dev-name">${d.label}</div>
            <div class="dev-status ${state.on?'on':''}" id="status_${key}">${state.on?'运行中 ○ 已开启':'已关闭 ●'}</div>
            <div style="font-size:11px;color:var(--text-secondary)">${z.name}</div>
          </div>
          <button class="dev-toggle ${state.on?'on':'off'}" data-key="${key}" title="${state.on?'关闭':'开启'}"></button>
        </div>`;
      });
    });
    this.el.grid.innerHTML=html;
    this.el.grid.addEventListener('click',e=>{
      const btn=e.target.closest('.dev-toggle');
      if(!btn)return;
      const key=btn.dataset.key;
      DEVICE_STATES[key].on=!DEVICE_STATES[key].on;
      this.updateDeviceUI(key);
      Store.saveDevices();
    });
  },
  updateDeviceUI(key){
    const state=DEVICE_STATES[key];
    const btn=this.el.grid.querySelector(`.dev-toggle[data-key="${key}"]`);
    const st=document.getElementById('status_'+key);
    if(btn){btn.className='dev-toggle '+(state.on?'on':'off');btn.title=state.on?'关闭':'开启';}
    if(st){st.className='dev-status '+(state.on?'on':'');st.textContent=state.on?'运行中 ○ 已开启':'已关闭 ●';}
  },
  applyScene(sceneId){
    const scene=SCENES[sceneId];
    if(!scene)return;
    scene.actions.forEach(a=>{
      const [devId,val]=a.split('=');
      // match any zone's device with this id
      Object.keys(DEVICE_STATES).forEach(k=>{
        if(k.endsWith('_'+devId)){DEVICE_STATES[k].on=val=='1';this.updateDeviceUI(k);}
      });
    });
    Store.saveDevices();
  },
  bindMasterBar(){
    document.getElementById('masterBar').addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b)return;
      if(b.classList.contains('btn-scene')){this.applyScene(b.dataset.scene);return;}
      if(b.classList.contains('btn-all-on')){Object.keys(DEVICE_STATES).forEach(k=>{DEVICE_STATES[k].on=true;this.updateDeviceUI(k);});Store.saveDevices();}
      if(b.classList.contains('btn-all-off')){Object.keys(DEVICE_STATES).forEach(k=>{DEVICE_STATES[k].on=false;this.updateDeviceUI(k);});Store.saveDevices();}
    });
  }
};
