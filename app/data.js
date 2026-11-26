// Fictional Vellmere household ledger. All money is USD, stored to cents on entry.
export const household = { name: 'Vellmere', members: 'Mara & Ellis', currency: 'USD', year: 2026, defaultMonth: 10, snapshotDay: 26, savingsGuide: 20 };
export const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const categories = [
  {id:'rent',name:'Rent',color:'#26594d',icon:'⌂',budget:1850},
  {id:'groceries',name:'Groceries',color:'#749c7c',icon:'♧',budget:650},
  {id:'utilities',name:'Utilities',color:'#b9c7a7',icon:'ϟ',budget:340},
  {id:'transport',name:'Transport',color:'#dfac6e',icon:'↗',budget:400},
  {id:'food-out',name:'Food out',color:'#d47a50',icon:'♨',budget:400},
  {id:'health',name:'Health',color:'#849caa',icon:'+',budget:300},
  {id:'fun',name:'Fun',color:'#ba9eae',icon:'✳',budget:300},
  {id:'other',name:'Other',color:'#b7b1a2',icon:'◇',budget:300}
];
// Category order follows categories above. December is an illustrative plan.
// Rows seed transactions only; all displayed totals are recomputed from that ledger.
const ledger = [
 [1850,580,310,345,290,170,200,180,7400,250],
 [1850,545,295,310,330,220,160,210,7400,400],
 [1850,620,280,360,385,180,240,190,7400,300],
 [1850,590,260,335,310,260,220,170,7600,450],
 [1850,635,255,385,360,140,280,230,7600,350],
 [1850,610,290,420,440,160,320,250,7600,500],
 [1850,670,330,390,460,190,380,270,7600,250],
 [1850,640,320,370,390,240,290,220,7600,400],
 [1850,605,285,340,345,170,230,190,7600,300],
 [1850,620,295,355,380,210,250,220,7600,450],
 [1850,612,318,348,364,180,245,210,7600,250],
 [1850,690,345,380,480,220,400,320,7600,650]
];
export const bills = [
 {id:'home',name:'Willow Court rent',category:'rent',day:1,icon:'⌂',note:'Home · bank transfer'},
 {id:'energy',name:'Electricity & water',category:'utilities',day:12,icon:'ϟ',note:'Home · automatic payment'},
 {id:'internet',name:'Home internet',category:'utilities',day:28,amount:65,icon:'⌁',note:'Connection · automatic payment'},
 {id:'transit',name:'Transit passes',category:'transport',day:2,amount:140,icon:'↗',note:'Travel · automatic renewal'},
 {id:'stream',name:'Film & music',category:'fun',day:29,amount:25,icon:'▷',note:'Together time · card'}
];
const names = {groceries:['Greenbasket market','Corner pantry','Weekly market'],transport:['Fuel & parking','Bike upkeep'], 'food-out':['Sunday café','Dinner with friends','Lunch out'], health:['Family pharmacy','Dental & wellness'], fun:['Weekend outings','Books & little joys'],other:['Household supplies','Gifts & essentials']};
export const transactions = [];
ledger.forEach((row,month)=>{
  // Bill due dates stay in bills; the ledger records their allocation by the snapshot.
  const date = day=>`${household.year}-${String(month+1).padStart(2,'0')}-${String(Math.min(day,household.snapshotDay)).padStart(2,'0')}`;
  const add=(name,category,amount,day,type='expense')=>transactions.push({id:`t${transactions.length}`,name,category,amount,date:date(day),type,month});
  add('Mara · design studio','salary',row[8]*.55,1,'income');
  add('Ellis · city library','salary',row[8]*.45,1,'income');
  add('Mara · independent work','freelance',row[9],21,'income');
  categories.forEach((cat,i)=>{
    const recurring=bills.filter(b=>b.category===cat.id);
    const fixed=recurring.reduce((s,b)=>s+(b.amount||0),0);
    recurring.forEach(b=>add(b.name,cat.id,b.amount||row[i]-fixed,b.day));
    const remaining=row[i]-(recurring.length?recurring.reduce((s,b)=>s+(b.amount||row[i]-fixed),0):0);
    const merchants=names[cat.id]||[];
    if(remaining>0) merchants.forEach((name,j)=>{const base=Math.floor(remaining*100/merchants.length)/100;add(name,cat.id,j===merchants.length-1?Math.round((remaining-base*j)*100)/100:base,[6,15,24][j]);});
  });
});
export const goals = [
 {id:'buffer',name:'A softer landing',description:'Emergency fund',icon:'☂',target:15000,initial:6200,monthly:400,due:'2027-08-01',color:'#26594d'},
 {id:'coast',name:'A week by the sea',description:'Family summer trip',icon:'≈',target:5000,initial:1300,monthly:200,due:'2027-06-01',color:'#d47a50'},
 {id:'home',name:'Make room for home',description:'Home improvements',icon:'⌂',target:8000,initial:1800,monthly:250,due:'2027-10-01',color:'#849caa'}
];
export const state = {month:household.defaultMonth,category:'all',query:'',sort:'date',direction:-1,expenseTab:'transactions',report:'cashflow',reportCategory:'all',billFilter:'all'};
export const money = n=>new Intl.NumberFormat('en-US',{style:'currency',currency:household.currency,maximumFractionDigits:0}).format(n);
export const exactMoney = n=>new Intl.NumberFormat('en-US',{style:'currency',currency:household.currency}).format(n);
export const sum = list=>Math.round(list.reduce((s,t)=>s+t.amount,0)*100)/100;
export const entries = (month=state.month,type)=>transactions.filter(t=>t.month===month&&(!type||t.type===type));
export const income = month=>sum(entries(month,'income'));
export const spending = month=>sum(entries(month,'expense'));
export const budget = ()=>categories.reduce((s,c)=>s+c.budget,0);
export const categoryTotal = (id,month=state.month)=>sum(entries(month,'expense').filter(t=>t.category===id));
export const goalSaved = (g,month=state.month)=>(month<(g.startMonth??0)?0:g.initial)+g.monthly*Math.max(0,month-(g.startMonth??0)+1)+(g.extra||[]).filter(e=>e.month<=month).reduce((s,e)=>s+e.amount,0);
export const billAmount = b=>entries(state.month,'expense').find(t=>t.name===b.name)?.amount||0;
