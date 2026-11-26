// Small accessible SVG charts, drawn directly from the shared ledger.
import {household,months,money,income,spending,categoryTotal,categories,state} from './data.js';
const svg=(label,view,content)=>`<svg role="img" aria-label="${label}" viewBox="${view}">${content}</svg>`;
export function cashChart(mode='cashflow',category='all',compact=false){
 const selected=state.month, start=compact?Math.max(0,selected-5):0, end=compact?selected:months.length-1;
 const ids=Array.from({length:end-start+1},(_,i)=>start+i);
 const values=ids.map(m=>mode==='savings'?income(m)-spending(m):category==='all'?spending(m):categoryTotal(category,m));
 const all=mode==='savings'?values:[...ids.map(income),...values];
 const max=Math.max(2000,Math.ceil(Math.max(...all)/2000)*2000), min=Math.min(0,Math.floor(Math.min(...all)/2000)*2000);
 const w=640,left=48,bottom=187,top=15,step=(w-left-12)/ids.length;
 const y=value=>bottom-(value-min)/(max-min)*(bottom-top), baseline=y(0);
 let out='';
 [0,.25,.5,.75,1].forEach(p=>{const value=min+(max-min)*p,yy=y(value);out+=`<line x1="${left}" x2="630" y1="${yy}" y2="${yy}" stroke="#e8ebe5" stroke-dasharray="3 4"/><text x="2" y="${yy+4}" fill="#829087" font-size="11">${Number((value/1000).toFixed(1))}k</text>`;});
 ids.forEach((m,i)=>{
  const x=left+step*i+step/2, incY=y(income(m)), valY=y(values[i]);
  if(mode==='cashflow')out+=`<rect x="${x-13}" y="${incY}" width="12" height="${baseline-incY}" rx="3" fill="${m===selected?'#26594d':'#d1ded2'}"><title>${months[m]} income ${money(income(m))}</title></rect>`;
  out+=`<rect x="${x+(mode==='cashflow'?3:-8)}" y="${Math.min(baseline,valY)}" width="${mode==='cashflow'?12:18}" height="${Math.abs(baseline-valY)}" rx="3" fill="${m===selected?'#d47a50':'#e8c3aa'}"><title>${months[m]} ${mode==='savings'?'surplus':'spending'} ${money(values[i])}</title></rect><text x="${x}" y="211" text-anchor="middle" fill="${m===selected?'#26594d':'#839086'}" font-size="11" font-weight="${m===selected?700:400}">${months[m].slice(0,3)}</text>`;
 });
 if(mode==='savings'){const pts=ids.map((m,i)=>`${left+step*i+step/2},${y(values[i])}`).join(' ');out+=`<polyline points="${pts}" fill="none" stroke="#26594d" stroke-width="2.5"/>`;}
 return svg('Monthly '+(mode==='savings'?'available savings':'income and spending')+` for ${household.year}; values available in the reports table`,'0 0 640 225',out);
}
export function donut(){
 const total=spending();let cursor=0;
 const arcs=categories.map(c=>{const value=categoryTotal(c.id),part=value/total*100; const arc=`<circle cx="100" cy="100" r="77" fill="none" stroke="${c.color}" stroke-width="23" pathLength="100" stroke-dasharray="${Math.max(0,part-.65)} ${100-part+.65}" stroke-dashoffset="${-cursor}" transform="rotate(-90 100 100)"><title>${c.name}: ${money(value)}</title></circle>`;cursor+=part;return arc;}).join('');
 return svg('Spending by category, total '+money(total),'0 0 200 200',arcs+`<text x="100" y="94" text-anchor="middle" font-size="12" fill="#778279">TOTAL SPENT</text><text x="100" y="121" text-anchor="middle" font-size="25" font-weight="600" fill="#263c33">${money(total)}</text>`);
}
export function categoryBars(){const max=Math.max(...categories.map(c=>Math.max(c.budget,categoryTotal(c.id))));return `<div class="category-bars">${categories.map(c=>`<div class="category-bar"><span>${c.name}</span><div class="bar-track"><i style="width:${categoryTotal(c.id)/max*100}%;background:${c.color}"></i><b style="left:${c.budget/max*100}%" title="Budget ${money(c.budget)}"></b></div><strong>${money(categoryTotal(c.id))}</strong></div>`).join('')}</div>`;}
