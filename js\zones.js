// 温室区域与设备配置
const ZONES = [
  { id:'seedling', name:'🌱 育苗区', icon:'🌱',
    sensors:[{id:'temp',label:'温度',unit:'°C',min:24,max:30},{id:'humidity',label:'湿度',unit:'%',min:65,max:85},{id:'soil',label:'土壤湿度',unit:'%',min:50,max:80}],
    devices:[{id:'heat_lamp_s',label:'育苗补光灯',icon:'💡'},{id:'irrigation_s',label:'育苗灌溉泵',icon:'💧'}] },
  { id:'flower', name:'🌸 花卉区', icon:'🌸',
    sensors:[{id:'temp',label:'温度',unit:'°C',min:18,max:26},{id:'humidity',label:'湿度',unit:'%',min:55,max:75},{id:'light',label:'光照',unit:'lux',min:0,max:2000}],
    devices:[{id:'shade_f',label:'花卉遮阳帘',icon:'🪟'},{id:'vent_f',label:'花卉通风扇',icon:'🌀'}] },
  { id:'veggie', name:'🥬 蔬菜区', icon:'🥬',
    sensors:[{id:'temp',label:'温度',unit:'°C',min:20,max:30},{id:'humidity',label:'湿度',unit:'%',min:55,max:75},{id:'co2',label:'CO₂浓度',unit:'ppm',min:350,max:800}],
    devices:[{id:'co2_gen',label:'CO₂发生器',icon:'🧪'},{id:'irrigation_v',label:'蔬菜灌溉阀',icon:'💧'}] }
];
const DEVICE_STATES = {};
ZONES.forEach(z=>z.devices.forEach(d=>{DEVICE_STATES[z.id+'_'+d.id]={zone:z.id,id:d.id,label:d.label,icon:d.icon,on:false,room:z.name}}));
const SCENES = {
  day:{name:'☀️ 日间模式',desc:'打开补光灯、关闭遮阳帘、开启通风',actions:['heat_lamp_s=1','shade_f=0','vent_f=1','irrigation_v=1']},
  night:{name:'🌙 夜间模式',desc:'关闭补光灯和遮阳帘，关闭灌溉泵',actions:['heat_lamp_s=0','shade_f=0','vent_f=1','irrigation_v=0','co2_gen=1']},
  rain:{name:'🌧️ 雨天模式',desc:'关闭通风扇，强化排水灌溉',actions:['vent_f=0','shade_f=1','irrigation_s=1','irrigation_v=1']}
};
const THRESHOLDS = {temp_h:{label:'🔥 高温',key:'temp_h',sensor:'temp',dir:'high',val:32,unit:'°C'},
  temp_l:{label:'❄️ 低温',key:'temp_l',sensor:'temp',dir:'low',val:18,unit:'°C'},
  humidity_h:{label:'💧 高湿',key:'humidity_h',sensor:'humidity',dir:'high',val:85,unit:'%'},
  co2_h:{label:'🧪 CO₂偏高',key:'co2_h',sensor:'co2',dir:'high',val:700,unit:'ppm'},
  soil_l:{label:'🌱 土壤偏干',key:'soil_l',sensor:'soil',dir:'low',val:40,unit:'%'}};
