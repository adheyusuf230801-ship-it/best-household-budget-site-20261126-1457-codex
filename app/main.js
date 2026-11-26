// Hash navigation and local edits. No storage or remote connections are used.
import {household,months,categories,goals,transactions,state,goalSaved} from './data.js';
import {routes,shell,overview,expenses,incomeView,goalsView,billsView,reports,guide,escape,tableResults} from './views.js';
const host=document.getElementById('shell');
const dialog=document.getElementById('entry-dialog');
const pages={overview,income:incomeView,expenses,goals:goalsView,bills:billsView,reports,guide};
let route='overview', toastTimer;
function render(reset=false){
 window.__shotReady=false;
 const next=location.hash.replace(/^#\/?/,'')||'overview';
 route=Object.hasOwn(pages,next)?next:'overview';
 const focusId=document.activeElement?.id;
 host.innerHTML=shell(route);
 document.getElementById('page').innerHTML=pages[route]();
 document.title=`${routes[route]} · Hearth · ${household.name} household`;
 if(reset)window.scrollTo(0,0);else if(focusId)document.getElementById(focusId)?.focus();
 window.__shotReady=true;
 document.documentElement.dataset.shotReady='true';
}
function notify(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),4000);}
function openDialog(title,intro,fields,submit,kind,id=''){
 dialog.innerHTML=`<form id="edit-form" data-kind="${kind}" data-id="${id}"><div class="dialog-head"><span class="eyebrow">A LITTLE STEP FORWARD</span><button type="button" class="close-dialog" aria-label="Close dialog">×</button></div><h2>${title}</h2><p>${intro}</p>${fields}<p class="form-error" role="alert"></p><div class="dialog-actions"><button type="button" class="secondary close-dialog">Cancel</button><button class="primary" type="submit">${submit}</button></div><small>For this visit only. Reloading restores the example.</small></form>`;
 dialog.showModal();
}
function transactionDialog(type){const prefix=`${household.year}-${String(state.month+1).padStart(2,'0')}`;openDialog(type==='income'?'Add a little income.':'Every purchase has a place.',`Add to the ${household.name} household ledger. Use day ${household.snapshotDay} or earlier in any demo month.`, `<label>Description<input name="name" required maxlength="70" placeholder="${type==='income'?'Weekend project':'Weekly market'}"></label><div class="form-row"><label>Amount (USD)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="0.00"></label><label>Date<input name="date" type="date" value="${prefix}-${household.snapshotDay}" min="${household.year}-01-01" max="${household.year}-12-${household.snapshotDay}" required></label></div><label>Category<select name="category">${type==='income'?'<option value="salary">Salary</option><option value="freelance">Freelance</option>':categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label>`,type==='income'?'Add income':'Add transaction',type);}
function goalDialog(){openDialog('Something to look forward to.','Give your next chapter a name and a little intention.',`<label>Goal name<input name="name" required maxlength="50" placeholder="A garden of our own"></label><label>What is it for?<input name="description" required maxlength="70" placeholder="A place to grow together"></label><div class="form-row"><label>Target (USD)<input name="target" type="number" min="1" max="1000000" step="0.01" required></label><label>Already saved (USD)<input name="initial" type="number" min="0" max="1000000" step="0.01" value="0" required></label></div><div class="form-row"><label>Monthly plan (USD)<input name="monthly" type="number" min="0" max="100000" step="0.01" value="0" required></label><label>Target date<input name="due" type="date" min="${household.year}-01-01" max="2040-12-31" value="${household.year+1}-12-01" required></label></div>`,'Create goal','goal');}
document.addEventListener('click',event=>{
 if(event.target.classList?.contains('skip')){event.preventDefault();document.getElementById('content').focus();return;}
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.add)transactionDialog(button.dataset.add);
 if(button.id==='add-goal')goalDialog();
 if(button.classList.contains('close-dialog'))dialog.close();
 if(button.dataset.sort){const sort=button.dataset.sort;state.direction=state.sort===sort?-state.direction:sort==='amount'?-1:1;state.sort=sort;render();}
 if(button.dataset.expenseTab){state.expenseTab=button.dataset.expenseTab;render();}
 if(button.dataset.billFilter){state.billFilter=button.dataset.billFilter;render();}
 if(button.dataset.contribute){const g=goals.find(g=>g.id===button.dataset.contribute);openDialog('A little closer.',`Add savings to “${escape(g.name)}” from ${months[state.month]} onward.`,`<label>Contribution (USD)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required autofocus></label>`,'Add contribution','contribution',g.id);}
});
document.addEventListener('change',event=>{
 const {id,value}=event.target;
 const controls={month:'month',category:'category','report-mode':'report','report-category':'reportCategory'};
 if(controls[id]){state[controls[id]]=id==='month'?Number(value):value;render();}
});
document.addEventListener('input',event=>{if(event.target.id==='search'){state.query=event.target.value;document.getElementById('transaction-results').innerHTML=tableResults();}});
document.addEventListener('submit',event=>{
 if(event.target.id!=='edit-form')return;
 event.preventDefault();
 const form=event.target;if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form)); const kind=form.dataset.kind;
 if(('name' in data&&!data.name.trim())||('description' in data&&!data.description.trim())){form.querySelector('.form-error').textContent='Please enter a name and description with more than spaces.';return;}
 if(kind==='goal'){
  const target=Number(data.target),initial=Number(data.initial),monthly=Number(data.monthly);
  if(initial>target){form.querySelector('.form-error').textContent='The saved amount must be no more than your target.';return;}
  goals.push({id:`goal-${goals.length}`,name:data.name.trim(),description:data.description.trim(),target,initial,monthly,due:data.due,icon:'✳',color:'#749c7c',startMonth:state.month});
 }else if(kind==='contribution'){
  const g=goals.find(g=>g.id===form.dataset.id);g.extra??=[];g.extra.push({month:state.month,amount:Number(data.amount)});
 }else{
  if(Number(data.date.slice(-2))>household.snapshotDay){form.querySelector('.form-error').textContent=`Please use day ${household.snapshotDay} or earlier; later bill due dates belong in the schedule.`;return;}
  const month=Number(data.date.slice(5,7))-1;
  transactions.push({id:`added-${transactions.length}`,name:data.name.trim(),category:data.category,date:data.date,amount:Number(data.amount),type:kind,month});
  state.month=month;state.category='all';state.query='';state.sort='date';state.direction=-1;state.expenseTab='transactions';
 }
 dialog.close();render();notify(kind==='goal'?'A new possibility, added.':kind==='contribution'?'A little closer to your goal.':'Added to your household ledger.');
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',()=>render(true));render();
