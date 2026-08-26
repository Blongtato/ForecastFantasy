const markets=[
  {id:'moon',name:'MOONBERRY',symbol:'MNB',category:'AGRICULTURE',end:'14:00',
   news:'Bumper harvest reported across three provinces. Supply is flooding the market, driving prices down.',
   sources:['Bumper harvest reported across three provinces. Supply is flooding the market, driving prices down.','Weather forecasts show clear skies for the next week — ideal growing conditions will push even more product into the market.'],
   price:82,volatility:10,direction:0,settled:false,calamityChance:0},
  {id:'wyrm',name:'WYRM OIL',symbol:'WYR',category:'ENERGY',end:'16:30',
   news:'A trade embargo with the northern territories has disrupted shipments. Shortages are expected within days, pushing prices up.',
   sources:['A trade embargo with the northern territories has disrupted shipments. Shortages are expected within days, pushing prices up.','Two major refineries announced temporary shutdowns for emergency maintenance, cutting output by a third.'],
   price:118,volatility:25,direction:0,settled:false,calamityChance:.35},
  {id:'mana',name:'MANA DUST',symbol:'MND',category:'ARCANE',end:'18:00',
   news:'The academy quartermaster reports critically low reserves. Mines are underproducing — prices are set to spike.',
   sources:['The academy quartermaster reports critically low reserves. Mines are underproducing — prices are set to spike.','Three supply wagons returned empty from the Crystal Spire mines this week. The veins may be running dry.'],
   price:406,volatility:40,direction:0,settled:false,calamityChance:.68}
];
const equipment=[
  {id:'lens',name:'ORACLE LENS',icon:'◉',price:300,text:'Shows an estimated price range on each market before you trade.',bought:false},
  {id:'ticker',name:'ETHER TICKER',icon:'⌁',price:600,text:'Unlocks a second news source for each market. More info means better decisions.',bought:false},
  {id:'sim',name:'FATE SIMULATOR',icon:'✦',price:1000,text:'Shows how risky each market is. Helps you avoid the worst ones.',bought:false}
];
let selectedId='moon',balance=500,history=[],gameOver=false,shiftCount=0,settledCount=0;
const $=id=>document.getElementById(id);

function revealSections(){
  const settled=history.filter(h=>h.settled).length;
  if(settled>=1)$('tutorial-notes').classList.remove('hidden-section');
  if(settled>=1){
    const nav=$('nav-news');
    if(nav)nav.classList.remove('hidden-section');
  }
  if(settled>=2){
    const nav=$('nav-upgrades');
    if(nav)nav.classList.remove('hidden-section');
  }
}

const tutorialSteps=[
  {target:'tutorial-markets',title:'Pick a market.',copy:'You have three markets to trade this shift. Each one has a different price and different risk. Click one to open its trade panel.'},
  {target:'tutorial-ticket',title:'Buy or sell shares.',copy:'Type how many shares you want, then click BUY or SELL. Buy if you think the price will go up. Sell if you think it will go down. Your cash is shown at the bottom.'},
  {target:'tutorial-ticket',title:'Settle when you are ready.',copy:'When you click SETTLE, the price moves up or down. If you bought and it went up, you make money. If it went down, you lose. You can trade all three markets before settling, or settle one at a time.'},
  {target:'tutorial-ticket',title:'That is the basics.',copy:'Read the news, pick your spots, and try not to go broke. More tools will unlock as you play. Good luck.'}
];
let tutorialIndex=0;

function selected(){return markets.find(m=>m.id===selectedId)}

function position(m){return history.find(h=>m.id===h.m.id&&!h.settled)||null}

function portfolioValue(){
  let val=0;
  markets.forEach(m=>{
    const p=position(m);
    if(p){
      if(p.type==='long')val+=p.shares*m.price;
      else val+=p.shares*p.entryPrice-p.shares*m.price;
    }
  });
  return val;
}

function netWorth(){return balance+portfolioValue()}

function endTutorial(){
  sessionStorage.setItem('forecast-tutorial-seen','1');
  $('tutorial-card').classList.add('hidden');
  $('tutorial-backdrop').classList.add('hidden');
  document.querySelectorAll('.tutorial-focus').forEach(el=>el.classList.remove('tutorial-focus'));
}

function renderTutorial(){
  const step=tutorialSteps[tutorialIndex];
  document.querySelectorAll('.tutorial-focus').forEach(el=>el.classList.remove('tutorial-focus'));
  $(step.target).classList.add('tutorial-focus');
  $('tutorial-step').textContent=`${String(tutorialIndex+1).padStart(2,'0')} / ${String(tutorialSteps.length).padStart(2,'0')}`;
  $('tutorial-title').textContent=step.title;
  $('tutorial-copy').textContent=step.copy;
  $('tutorial-next').textContent=tutorialIndex===tutorialSteps.length-1?'START TRADING →':'NEXT →';
  $('tutorial-progress').innerHTML=tutorialSteps.map((_,i)=>`<span class="${i===tutorialIndex?'current':''}"></span>`).join('');
}

function startTutorial(){
  if(sessionStorage.getItem('forecast-tutorial-seen'))return;
  $('tutorial-card').classList.remove('hidden');
  $('tutorial-backdrop').classList.remove('hidden');
  renderTutorial();
}

function updateBalance(){
  $('balance').textContent=`₱ ${netWorth().toLocaleString()}`;
  const el=$('upgrades-funds-label');
  if(el)el.textContent=`UPGRADES / AVAILABLE CASH ₱ ${netWorth().toLocaleString()}`;
}

function checkGameOver(){
  if(gameOver)return;
  if(balance<=0&&portfolioValue()<=0){
    gameOver=true;
    const totalTrades=history.filter(h=>h.settled).length;
    const volatileCount=history.filter(h=>h.calamity).length;
    $('game-over-stats').innerHTML=`
      <div class="stat"><span class="stat-val">${totalTrades}</span><span class="stat-lab">Trades</span></div>
      <div class="stat"><span class="stat-val">${volatileCount}</span><span class="stat-lab">Volatile</span></div>
      <div class="stat"><span class="stat-val">₱ ${balance.toLocaleString()}</span><span class="stat-lab">Final balance</span></div>`;
    $('game-over-backdrop').classList.remove('hidden');
    $('game-over-card').classList.remove('hidden');
    document.querySelectorAll('.submit-btn,.buy-btn').forEach(b=>b.disabled=true);
  }
}

function renderMarkets(){
  $('market-list').innerHTML=markets.map(m=>{
    const p=position(m);
    let posTag='';
    if(p){
      posTag=` <span class="position-tag ${p.type}">${p.type==='long'?'LONG':'SHORT'} ${p.shares}</span>`;
    }
    return`<div class="market-row ${m.id===selectedId?'selected':''}${m.settled?' settled':''}" data-market="${m.id}">
      <div class="market-name">${m.name}${m.settled?' <span class="settled-tag">SETTLED</span>':''}${posTag}
        <span>${m.symbol} · ₱ ${m.price}</span>
      </div>
      <div class="market-news">${m.news}</div>
      <div class="market-footer"><span class="market-tag">${m.category}</span><span class="market-time">SETTLES ${m.end}</span></div>
    </div>`;
  }).join('');
  document.querySelectorAll('[data-market]').forEach(el=>el.onclick=()=>{
    if(gameOver)return;
    selectedId=el.dataset.market;
    renderMarkets();
    renderForecast();
  });
}

function drawRangeBar(m){
  if(!equipment[0].bought)return'';
  const seed=m.id.charCodeAt(0)*7+m.id.charCodeAt(1)*13;
  const estCenter=Math.max(15,Math.min(85,50+((seed%20)-10)));
  const low=Math.max(0,Math.round(estCenter-30));
  const high=Math.min(100,Math.round(estCenter+30));
  return`<div class="range-bar-wrap">
    <div class="range-bar">
      <div class="range-fill" style="left:${low}%;width:${high-low}%"></div>
      <div class="range-marker" style="left:${low}%" title="Low estimate: ₱${Math.round(m.price*(1-m.volatility/100))}"></div>
      <div class="range-marker" style="left:${high}%" title="High estimate: ₱${Math.round(m.price*(1+m.volatility/100))}"></div>
    </div>
    <div class="range-labels-bar"><span>₱${Math.round(m.price*(1-m.volatility/100))}</span><span>ESTIMATED RANGE</span><span>₱${Math.round(m.price*(1+m.volatility/100))}</span></div>
  </div>`;
}

function renderForecast(){
  const m=selected();
  if(m.settled){
    const allSettled=markets.every(m=>m.settled);
    $('selected-title').textContent=m.name+' — SETTLED';
    let inner=`<p class="trade-prompt">This market has settled.</p><div class="settled-state"><span class="settled-tag">Price moved ${m.direction>0?'↑':'↓'} to ₱${m.price}</span>`;
    if(allSettled){
      inner+=`<p>All markets settled this shift.</p><button class="submit-btn" id="new-shift-btn">START NEW SHIFT →</button>`;
    }else{
      inner+=`<p>Pick another market to trade.</p>`;
    }
    inner+=`</div>`;
    $('trade-content').innerHTML=inner;
    if(allSettled){
      const btn=$('new-shift-btn');
      if(btn)btn.onclick=startNewShift;
    }
    return;
  }

  const p=position(m);
  $('selected-title').textContent=m.name;
  let html=`<p class="trade-prompt">Current price: <strong>₱ ${m.price}</strong> · ${m.category}</p>`;
  html+=drawRangeBar(m);

  if(equipment[2].bought&&m.calamityChance>0){
    const risk=Math.round(m.calamityChance*100);
    html+=`<div class="calamity-warning"><span>⚠</span><span>Risk: <strong>${risk}%</strong> chance of a wild price swing.</span></div>`;
  }

  if(p){
    const unrealized=p.type==='long'?p.shares*(m.price-p.entryPrice):p.shares*(p.entryPrice-m.price);
    const sign=unrealized>=0?'+':'';
    html+=`<div class="position-summary">
      <div class="position-header"><span class="position-tag ${p.type}">${p.type==='long'?'LONG':'SHORT'} POSITION</span><span class="position-shares">${p.shares} shares</span></div>
      <div class="position-detail">Entry: ₱${p.entryPrice} · Current: ₱${m.price} · P&L: <span class="${unrealized>=0?'win':'loss'}">${sign}₱ ${Math.round(unrealized)}</span></div>
    </div>`;
  }

  html+=`<div class="trade-controls">`;
  html+=`<label class="tiny-label">AMOUNT</label>`;
  html+=`<div class="trade-input-group">`;
  html+=`<button class="trade-adjust" id="amt-down">−</button>`;
  html+=`<input id="trade-amount" type="number" min="1" max="999" value="1" class="trade-input">`;
  html+=`<button class="trade-adjust" id="amt-up">+</button>`;
  html+=`</div>`;
  html+=`</div>`;

  const maxBuy=m.price>0?Math.floor(balance/m.price):0;
  const maxSell=p?p.shares:0;

  html+=`<div class="trade-buttons">`;
  html+=`<button class="trade-btn buy-action" id="buy-shares" ${maxBuy<=0?'disabled':''}>BUY <span id="buy-preview">${Math.min(1,maxBuy)}</span> · ₱ ${Math.min(1,maxBuy)*m.price}</button>`;
  html+=`<button class="trade-btn sell-action" id="sell-shares" ${!p?'disabled':''}>SELL <span id="sell-preview">${Math.min(1,maxSell)}</span> · ₱ ${Math.min(1,maxSell)*m.price}</button>`;
  html+=`</div>`;

  html+=`<div class="cash-line">Cash: ₱${balance.toLocaleString()}${p?' · Position: ₱'+Math.round(portfolioValue()).toLocaleString():''}</div>`;
  html+=`<div class="intel-note"><span>✳</span><div><b>Market news</b><br>${m.news}</div></div>`;
  html+=`<button class="submit-btn" id="settle-market">SETTLE MARKET →</button>`;
  $('trade-content').innerHTML=html;

  const amtInput=$('trade-amount');
  function updatePreviews(){
    const amt=Math.max(1,Math.min(999,Number(amtInput.value)||1));
    amtInput.value=amt;
    const bPreview=Math.min(amt,maxBuy);
    const sPreview=Math.min(amt,maxSell);
    $('buy-preview').textContent=bPreview;
    $('buy-shares').disabled=maxBuy<=0;
    $('sell-preview').textContent=sPreview;
    $('sell-shares').disabled=!p||maxSell<=0;
  }
  amtInput.oninput=updatePreviews;
  $('amt-down').onclick=()=>{amtInput.value=Math.max(1,Number(amtInput.value)-1);updatePreviews()};
  $('amt-up').onclick=()=>{amtInput.value=Math.min(999,Number(amtInput.value)+1);updatePreviews()};
  $('buy-shares').onclick=()=>buyShares(m,Math.min(Number(amtInput.value),maxBuy));
  $('sell-shares').onclick=()=>sellShares(m,Math.min(Number(amtInput.value),maxSell));
  $('settle-market').onclick=()=>settleMarket(m);
}

function renderFeed(){
  $('feed-list').innerHTML=markets.map(m=>
    `<div class="feed-item"><span class="feed-time">08:${markets.indexOf(m)*7+14}</span><div class="feed-copy"><strong>${m.name}</strong><br>${m.news}</div><span class="source-dot"></span></div>`
  ).join('');
}

function buyShares(m,amt){
  if(m.settled||gameOver||amt<=0)return;
  const cost=amt*m.price;
  if(cost>balance){toast('Not enough cash.');return}
  const existing=position(m);
  if(existing){
    if(existing.type==='long'){
      const totalShares=existing.shares+amt;
      existing.entryPrice=Math.round((existing.shares*existing.entryPrice+amt*m.price)/totalShares);
      existing.shares=totalShares;
      balance-=cost;
    }else{
      const profit=amt*(existing.entryPrice-m.price);
      existing.shares=Math.max(0,existing.shares-amt);
      balance+=profit;
      if(existing.shares===0){
        history.splice(history.indexOf(existing),1);
      }
    }
  }else{
    history.unshift({m,shares:amt,entryPrice:m.price,type:'long',settled:false,payout:0,calamity:false,direction:0});
    balance-=cost;
  }
  updateBalance();
  toast(`Bought ${amt} ${m.symbol} @ ₱${m.price}`);
  renderMarkets();
  renderForecast();
  checkGameOver();
}

function sellShares(m,amt){
  if(m.settled||gameOver||amt<=0)return;
  const p=position(m);
  if(!p||p.shares<amt){toast('You don\'t own that many shares.');return}
  if(p.type==='long'){
    const profit=amt*(m.price-p.entryPrice);
    balance+=profit;
    p.shares-=amt;
    if(p.shares===0){
      history.splice(history.indexOf(p),1);
    }
  }
  updateBalance();
  toast(`Sold ${amt} ${m.symbol} @ ₱${m.price}`);
  renderMarkets();
  renderForecast();
  checkGameOver();
}

function settleMarket(m){
  if(m.settled||gameOver)return;
  const isUp=Math.random()<0.5;
  const maxSwing=m.volatility/100;
  const swing=(Math.random()*maxSwing)*100;
  const change=isUp?Math.round(swing):-Math.round(swing);
  const newPrice=Math.max(1,Math.round(m.price*(1+change/100)));
  m.direction=change;
  m.price=newPrice;
  m.settled=true;

  const p=position(m);
  let totalPnL=0;
  if(p){
    if(p.type==='long'){
      totalPnL=p.shares*(newPrice-p.entryPrice);
    }else{
      totalPnL=p.shares*(p.entryPrice-newPrice);
    }
    balance+=totalPnL;
    p.settled=true;
  }

  const isVolatile=Math.random()<m.calamityChance;
  history.unshift({m,shares:p?p.shares:0,entryPrice:p?p.entryPrice:0,type:p?p.type:'none',settled:true,payout:Math.round(totalPnL),calamity:isVolatile,direction:change});

  updateBalance();
  const sign=totalPnL>=0?'+':'';
  $('balance-delta').textContent=`${sign}₱ ${Math.round(totalPnL)} this trade`;
  if(totalPnL<0){
    toast(`${m.symbol} settled. You lost ₱${Math.abs(Math.round(totalPnL))}.`);
  }else if(isVolatile){
    toast(`${m.symbol} settled. Wild swing — P&L: ${sign}₱${Math.round(totalPnL)}`);
  }else{
    toast(`${m.symbol} settled. P&L: ${sign}₱${Math.round(totalPnL)}`);
  }
  renderMarkets();
  renderForecast();
  renderArchive();
  checkGameOver();
  revealSections();
}

function renderInbox(){
  const hasTicker=equipment[1].bought;
  $('inbox-list').innerHTML=markets.map((m,i)=>{
    let card=`<article class="inbox-card"><span class="feed-time">TODAY / 08:${14+i*7}</span><h3>${m.name}</h3><p>${m.news}</p><span class="inbox-source">${['Mara, lantern-maker','Joss, dockhand','Quartermaster Pell'][i]} · unverified</span>`;
    if(hasTicker){
      card+=`<div class="inbox-extra"><span class="feed-time">TODAY / 08:${20+i*7}</span><p>${m.sources[1]}</p><span class="inbox-source">Second source · unverified</span></div>`;
    }
    card+=`</article>`;
    return card;
  }).join('');
}

function renderUpgrades(){
  const count=equipment.filter(x=>!x.bought).length;
  $('upgrade-count').textContent=count;
  const kitLabel=$('kit-label');
  if(kitLabel){
    if(count===0)kitLabel.textContent='YOUR KIT // FULLY LOADED';
    else if(count<3)kitLabel.textContent='YOUR KIT // UPGRADED';
    else kitLabel.textContent='YOUR KIT // BASIC';
  }
  $('upgrade-list').innerHTML=equipment.map(e=>
    `<article class="upgrade-card"><div class="upgrade-icon">${e.icon}</div><h3>${e.name}</h3><p>${e.text}</p>
    <button class="buy-btn" data-buy="${e.id}" ${e.bought?'disabled':''}>${e.bought?'INSTALLED':'BUY FOR ₱ '+e.price}</button></article>`
  ).join('');
  document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));
}

function buy(id){
  if(gameOver)return;
  const e=equipment.find(x=>x.id===id);
  if(e.bought)return;
  if(balance<e.price){toast('Not enough cash. Settle a market first.');return}
  balance-=e.price;
  e.bought=true;
  updateBalance();
  $('upgrade-count').textContent=equipment.filter(x=>!x.bought).length;
  toast(`${e.name} installed.`);
  renderUpgrades();
  renderForecast();
  renderInbox();
  checkGameOver();
}

function renderArchive(){
  const settled=history.filter(h=>h.settled);
  $('archive-list').innerHTML=settled.length?
    settled.map(h=>{
      const dirTag=h.direction>0?'↑ UP':'↓ DOWN';
      return`<div class="archive-row"><strong>${h.m.name}</strong><span>${h.type.toUpperCase()} ${h.shares} shares @ ₱${h.entryPrice} → ₱${h.m.price}</span><span class="${h.payout>=0?'win':'loss'}">${dirTag}</span><span class="${h.payout>=0?'win':'loss'}">${h.payout>=0?'+':''}₱ ${Math.round(h.payout)}</span></div>`;
    }).join('')
    :'<div class="archive-row"><strong>No settled trades</strong><span>Your first trade is waiting.</span><span>--</span><span>--</span></div>';
}

function startNewShift(){
  markets.forEach(m=>{
    m.settled=false;
    m.price=Math.round(15+Math.random()*400);
    m.volatility=Math.round(10+Math.random()*40);
    m.direction=0;
  });
  history=history.filter(h=>!h.settled);
  shiftCount++;
  selectedId='moon';
  toast('New shift. Three fresh markets are open.');
  renderMarkets();
  renderForecast();
}

function toast(message){
  const t=$('toast');
  t.textContent=message;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3200);
}

function switchView(view){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  $('desk-view').classList.toggle('hidden',view!=='desk');
  document.querySelectorAll('.secondary-view').forEach(v=>v.classList.add('hidden'));
  if(view!=='desk')$(view+'-view').classList.remove('hidden');
  if(view==='inbox')renderInbox();
  if(view==='upgrades')renderUpgrades();
  if(view==='archive')renderArchive();
}

document.querySelectorAll('.nav-item').forEach(n=>n.onclick=()=>switchView(n.dataset.view));
document.querySelectorAll('[data-view-target]').forEach(n=>n.onclick=()=>switchView(n.dataset.viewTarget));
renderMarkets();
renderForecast();
renderFeed();
renderArchive();
updateBalance();
setInterval(()=>{
  if(!gameOver)$('clock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
},1000);

$('tutorial-next').onclick=()=>{
  if(tutorialIndex===tutorialSteps.length-1){endTutorial();return}
  tutorialIndex++;
  renderTutorial();
};
$('tutorial-skip').onclick=endTutorial;
startTutorial();

$('restart-btn').onclick=()=>{
  markets.forEach(m=>{
    m.settled=false;
    m.price=Math.round(15+Math.random()*400);
    m.volatility=Math.round(10+Math.random()*40);
    m.direction=0;
  });
  equipment.forEach(e=>e.bought=false);
  selectedId='moon';balance=500;history=[];gameOver=false;shiftCount=0;
  $('game-over-backdrop').classList.add('hidden');
  $('game-over-card').classList.add('hidden');
  document.querySelectorAll('.submit-btn,.buy-btn').forEach(b=>b.disabled=false);
  $('tutorial-notes').classList.add('hidden-section');
  $('nav-news').classList.add('hidden-section');
  $('nav-upgrades').classList.add('hidden-section');
  updateBalance();
  $('balance-delta').textContent='+₱ 0 today';
  renderMarkets();
  renderForecast();
  renderFeed();
  renderInbox();
  renderUpgrades();
  renderArchive();
  switchView('desk');
};
