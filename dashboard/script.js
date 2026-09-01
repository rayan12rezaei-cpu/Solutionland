const cfg=window.SUPABASE_CONFIG||{}, sb=(cfg.url&&cfg.anonKey)?window.supabase.createClient(cfg.url,cfg.anonKey):null;
const app=document.querySelector("#app");
const nav=[["./","🏠","داشبورد"],["../lesson/","📚","درس‌نامه"],["../quiz/","🧠","پرسش"],["../docs/","🎧","مستندات"],["../info/","ℹ️","درباره"]];
function toast(t,m,type="info"){const x=document.createElement("div");x.className=`toast ${type}`;x.innerHTML=`<strong>${t}</strong><span>${m}</span><button>×</button>`;x.querySelector("button").onclick=()=>x.remove();document.querySelector("#toastRoot").append(x)}
async function boot(){
 if(!sb){location.href="../";return}
 const {data:{session}}=await sb.auth.getSession(); if(!session){toast("دسترسی","شما وارد نشده‌اید.","error");setTimeout(()=>location.href="../",900);return}
 const {data:p}=await sb.from("acc").select("*").eq("id",session.user.id).maybeSingle();
 if(!p?.nickname||!p?.full_name){location.href="../complete-profile.html";return}
 app.innerHTML=`<header class="topbar glass"><img class="brand" src="../assets/logo.png" alt="سرزمین محلول"><div class="actions"><button class="nav-toggle" id="navToggle">☰</button><button class="icon-btn" id="theme">◐</button><button class="icon-btn" id="lang">فارسی</button></div></header>
 <nav id="side" class="side glass">${nav.map((n,i)=>`<a class="nav-item ${i===0?"active":""}" href="${n[0]}">${n[1]} ${n[2]}</a>`).join("")}</nav>
 <main class="layout"><section class="profile glass"><img class="avatar" src="${p.avatar_url||"../assets/avatar-default.svg"}" alt="آواتار"><h1>${p.nickname}</h1><div class="muted">${p.full_name}</div><div class="details">${p.email?`<span class="detail">✉️ ${p.email}</span>`:""}<button class="detail" id="logout">خروج</button></div></section>
 <section class="links">${nav.slice(1).map(n=>`<a class="link-card glass" href="${n[0]}"><div class="emoji">${n[1]}</div><h2>${n[2]}</h2><p>${n[2]==="درس‌نامه"?"با هم یاد بگیریم":n[2]==="پرسش"?"حالا وقت محک رسیده":n[2]==="مستندات"?"به یه شکل دیگه ببینیم":"اطلاعات و معرفی"}</p></a>`).join("")}</section></main>`;
 const side=document.querySelector("#side"); document.querySelector("#navToggle").onclick=()=>side.classList.toggle("closed");
 const saved=localStorage.getItem("theme"); document.documentElement.dataset.theme=saved||"dark"; document.querySelector("#theme").onclick=()=>{const v=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=v;localStorage.setItem("theme",v)};
 document.querySelector("#logout").onclick=async()=>{const ok=confirm("آیا می‌خواهید از حساب خارج شوید؟");if(!ok)return;const pass=prompt("رمز عبور را وارد کنید");if(!pass)return;const {error}=await sb.auth.signOut();if(error)toast("خطا",error.message,"error");else location.href="../"};
}
boot();