// 数据持久化存储
const Store={
  alerts:[],deviceStates:{},thresholds:{},
  init(){
    try{
      if(localStorage.getItem('gh_alerts'))this.alerts=JSON.parse(localStorage.getItem('gh_alerts'));
      if(localStorage.getItem('gh_thresholds'))this.thresholds=JSON.parse(localStorage.getItem('gh_thresholds'));
      const saved=localStorage.getItem('gh_devices');
      if(saved){const p=JSON.parse(saved);Object.keys(p).forEach(k=>{if(DEVICE_STATES[k])DEVICE_STATES[k].on=p[k]});}
    }catch(e){console.warn('localStorage不可用',e);}
  },
  saveDevices(){
    try{const o={};Object.keys(DEVICE_STATES).forEach(k=>{o[k]=DEVICE_STATES[k].on});localStorage.setItem('gh_devices',JSON.stringify(o));}
    catch(e){}
  },
  pushAlert(a){
    this.alerts.unshift(a);if(this.alerts.length>200)this.alerts.pop();
    try{localStorage.setItem('gh_alerts',JSON.stringify(this.alerts));}catch(e){}
  },
  saveThresholds(){
    try{localStorage.setItem('gh_thresholds',JSON.stringify(this.thresholds));}catch(e){}
  },
  clearAlerts(){this.alerts=[];try{localStorage.setItem('gh_alerts','[]');}catch(e){}}
};
