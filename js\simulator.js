// 温室传感器模拟引擎
class Simulator{
  constructor(zones){
    this.zones=zones;
    this.data={};
    this.history={};// {zoneId_sensorId:[val,...]}
    zones.forEach(z=>{
      z.sensors.forEach(s=>{
        const k=z.id+'_'+s.id;
        this.data[k]={zoneId:z.id,sensorId:s.id,label:z.name+' '+s.label,unit:s.unit,value:s.min+(s.max-s.min)/2};
        this.history[k]=[];
      });
    });
  }
  tick(){
    const now=Date.now();
    this.zones.forEach(z=>{
      z.sensors.forEach(s=>{
        const k=z.id+'_'+s.id;
        const last=this.data[k].value;
        const drift=s.id=='co2'?(Math.random()-.5)*15:(Math.random()-.5)*1.2;
        let v=last+drift;
        if(s.id=='temp'){
          if(z.id=='flower')v+=Math.sin(now/3600000)*.5;
          else if(z.id=='seedling')v=Math.max(v,24);
          else v+=Math.sin(now/3600000+1)*.3;
        }
        if(s.id=='light'){const hour=new Date().getHours();v=hour>6&&hour<18?(500+Math.sin((hour-6)/12*Math.PI)*600+Math.random()*200):(50+Math.random()*80);}
        v=Math.round(Math.max(s.min-5,Math.min(s.max+5,v))*10)/10;
        this.data[k]={zoneId:z.id,sensorId:s.id,label:z.name+' '+s.label,unit:s.unit,value:v};
        this.history[k].push({time:now,value:v});
        if(this.history[k].length>300)this.history[k].shift();
      });
    });
  }
  getSnapshot(){return Object.values(this.data).map(d=>({...d}));}
  getHistory(zoneId,sensorId,limit=120){
    const k=zoneId+'_'+sensorId;
    return this.history[k]?this.history[k].slice(-limit):[];
  }
  getRoomData(zoneId){
    return Object.values(this.data).filter(d=>d.zoneId==zoneId);
  }
}
