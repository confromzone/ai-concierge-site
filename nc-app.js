/* ===== Nova Concierge — APP CORE (statinis) ===== */
const NC_ADMIN_EMAIL = 'admin@novaconcierge.online';  // ← PASIKEISK jei reikia
const NC_ADMIN_PASS  = 'NovaAdmin#2025';               // ← PASIKEISK jei reikia

function ncGetUser(){ try{return JSON.parse(localStorage.getItem('nc_user'))}catch(e){return null} }
function ncSetUser(u){ localStorage.setItem('nc_user', JSON.stringify(u)); }
function ncLogout(){ localStorage.removeItem('nc_user'); location.href='/auth.html'; }
function ncGenAffId(email){ let h=0; for(const c of email) h=(h*31+c.charCodeAt(0))>>>0; return ('00000000'+h.toString(16)).slice(-8); }
function ncAffiliateLink(){ const u=ncGetUser(); const id=u?.affiliateId || localStorage.getItem('nc_aff_ref') || 'PARTNER'; return location.origin + '/company.html?ref='+encodeURIComponent(id); }
function ncRequireAuth(allow=['/auth.html','/company.html','/privacy.html','/policy.html','/']){
  if(!allow.includes(location.pathname) && !ncGetUser()){
    location.href='/auth.html?next='+encodeURIComponent(location.pathname+location.search);
  }
}

/* Header actions (dešinė) – „Prisijungti“ arba profilis su meniu */
function ncRenderHeaderActions(){
  const host=document.querySelector('#header-actions'); if(!host) return;
  const u=ncGetUser();
  if(!u){
    host.innerHTML=`
      <a class="btn" href="/auth.html">Prisijungti</a>
      <a class="btn primary" href="/company.html">Įmonės registracija</a>
    `;
    return;
  }
  const initials=(u.email||'U').slice(0,1).toUpperCase();
  host.innerHTML=`
    <div class="account">
      <button class="avatar" id="accBtn">${initials}</button>
      <div class="menu" id="accMenu">
        <div class="email">${u.email}${u.role==='admin'?' · <b>admin</b>':''}</div>
        <a href="/profile.html">Profilis</a>
        <a href="/affiliate.html">Affiliate workspace</a>
        <button id="accLogout">Atsijungti</button>
      </div>
    </div>
  `;
  const btn=document.getElementById('accBtn'), menu=document.getElementById('accMenu');
  btn.onclick=()=>menu.classList.toggle('open');
  addEventListener('click',e=>{ if(!menu.contains(e.target)&&e.target!==btn) menu.classList.remove('open'); });
  document.getElementById('accLogout').onclick=ncLogout;
}

/* Auth API – naudoja auth.html */
function ncDoLogin(email, pass){
  email=(email||'').trim().toLowerCase();
  if(email===NC_ADMIN_EMAIL && pass===NC_ADMIN_PASS){
    ncSetUser({email,role:'admin',affiliateId:'ADMIN'}); return true;
  }
  const db=JSON.parse(localStorage.getItem('nc_users')||'[]');
  const row=db.find(x=>x.email===email && x.pass===pass);
  if(!row) return false;
  ncSetUser({email,role:'partner',affiliateId:row.affiliateId});
  return true;
}
function ncDoRegister(email, pass){
  email=(email||'').trim().toLowerCase();
  const db=JSON.parse(localStorage.getItem('nc_users')||'[]');
  if(db.some(x=>x.email===email)) return {ok:false,msg:'Šis el. paštas jau registruotas'};
  const affiliateId=ncGenAffId(email);
  db.push({email,pass,affiliateId}); localStorage.setItem('nc_users', JSON.stringify(db));
  ncSetUser({email,role:'partner',affiliateId}); localStorage.setItem('nc_aff_ref', affiliateId);
  return {ok:true};
}
function ncChangePassword(oldPass,newPass){
  const u=ncGetUser(); if(!u || u.role==='admin') return {ok:false,msg:'Negalima'};
  const db=JSON.parse(localStorage.getItem('nc_users')||'[]');
  const row=db.find(x=>x.email===u.email);
  if(!row || row.pass!==oldPass) return {ok:false,msg:'Senas slaptažodis netinka'};
  row.pass=newPass; localStorage.setItem('nc_users', JSON.stringify(db)); return {ok:true};
}

window.NC={ncGetUser,ncSetUser,ncRequireAuth,ncRenderHeaderActions,ncAffiliateLink,ncDoLogin,ncDoRegister,ncChangePassword,ncLogout};
