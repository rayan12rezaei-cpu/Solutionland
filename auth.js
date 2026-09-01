const $ = (s,r=document)=>r.querySelector(s);
const toastRoot=$("#toastRoot");
const cfg=window.SUPABASE_CONFIG||{};
const supabase=(cfg.url&&cfg.anonKey&&window.supabase)?window.supabase.createClient(cfg.url,cfg.anonKey):null;
const view=$("#authView");

function toast(title,message,type="info"){
  const el=document.createElement("div");
  el.className=`toast ${type}`;
  el.innerHTML=`<strong>${title}</strong><span>${message}</span><button aria-label="بستن">×</button>`;
  el.querySelector("button").onclick=()=>el.remove();
  toastRoot.appendChild(el);
}
function form(mode){
  const signup=mode==="signup";
  view.innerHTML=`<div class="auth-heading"><h1>${signup?"ثبت‌نام کن":"وارد شو"}</h1>
  <p>${signup?"یک حساب برای ورود به سرزمین محلول بساز.":"با حساب خودت وارد سرزمین محلول شو."}</p></div>
  <form id="authForm" class="form">
    ${signup?`<label>نام کاربری<input id="nickname" minlength="8" maxlength="40" pattern="[A-Za-z0-9_]{8,40}" required placeholder="حداقل ۸ کاراکتر"></label>
    <label>نام و نام خانوادگی<input id="fullName" required></label>`:""}
    ${signup?`<label>ایمیل <small>اختیاری</small><input id="email" type="email"></label>`:""}
    ${!signup?`<label>نام کاربری<input id="loginNickname" required></label>`:""}
    <label>رمز عبور<input id="password" type="password" minlength="8" required></label>
    ${!signup?`<button type="button" class="text-btn" id="forgot">رمز عبور را فراموش کرده‌ام</button>`:""}
    <button class="primary" type="submit">${signup?"ثبت‌نام":"ورود"}</button>
  </form>
  <div class="divider"><span>یا</span></div>
  <button class="google" id="google">ورود با Google</button>
  <div class="auth-switch">${signup?`اکانت داری؟ <button id="switch">وارد شو</button>`:`حساب نداری؟ <button id="switch">ثبت‌نام کن</button>`}</div>`;
  $("#switch").onclick=()=>form(signup?"login":"signup");
  $("#google").onclick=googleLogin;
  if(!signup) $("#forgot").onclick=forgot;
  $("#authForm").onsubmit=signup?signupUser:loginUser;
}
async function ensure(){
  if(!supabase){ toast("تنظیم Supabase","مقادیر assets/supabase-config.js را وارد کن.","error"); return; }
  const {data:{session}}=await supabase.auth.getSession();
  if(session){ location.href="./dashboard/"; return; }
  form("login");
}
async function signupUser(e){
  e.preventDefault();
  const nickname=$("#nickname").value.trim(), full_name=$("#fullName").value.trim(), email=$("#email").value.trim(), password=$("#password").value;
  if(!/^[A-Za-z0-9_]{8,40}$/.test(nickname)){toast("نام کاربری نامعتبر","نام کاربری باید حداقل ۸ کاراکتر و فقط شامل حروف انگلیسی، عدد یا _ باشد.","error");return;}
  const {data:exists}=await supabase.from("acc").select("id").eq("nickname",nickname).maybeSingle();
  if(exists){toast("نام کاربری تکراری","این نام کاربری قبلاً استفاده شده است.","error");return;}
  if(email){
    const {data:emailExists}=await supabase.from("acc").select("id").eq("email",email).maybeSingle();
    if(emailExists){toast("ایمیل تکراری","این ایمیل قبلاً برای حساب دیگری ثبت شده است.","error");return;}
  }
  const {data,error}=await supabase.auth.signUp({email:email||undefined,password});
  if(error){toast("ثبت‌نام ناموفق",error.message,"error");return;}
  const uid=data.user.id;
  const {error:dbErr}=await supabase.from("acc").insert({id:uid,nickname,full_name,email:email||null,language:"fa",theme:"system"});
  if(dbErr){toast("خطا در ساخت پروفایل",dbErr.message,"error");return;}
  location.href="./dashboard/";
}
async function loginUser(e){
  e.preventDefault();
  const nickname=$("#loginNickname").value.trim(), password=$("#password").value;
  const {data:userRow,error:qErr}=await supabase.from("acc").select("email").eq("nickname",nickname).maybeSingle();
  if(qErr||!userRow?.email){toast("ورود ناموفق","نام کاربری یا رمز عبور صحیح نیست.","error");return;}
  const {error}=await supabase.auth.signInWithPassword({email:userRow.email,password});
  if(error){toast("ورود ناموفق","نام کاربری یا رمز عبور صحیح نیست.","error");return;}
  location.href="./dashboard/";
}
async function googleLogin(){
  if(!supabase)return;
  const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});
  if(error)toast("خطا",error.message,"error");
}
async function forgot(){
  const nickname=$("#loginNickname").value.trim();
  const {data:userRow}=await supabase.from("acc").select("email").eq("nickname",nickname).maybeSingle();
  if(!userRow?.email){toast("بازیابی رمز","برای این حساب ایمیل ثبت نشده است.","error");return;}
  const {error}=await supabase.auth.resetPasswordForEmail(userRow.email,{redirectTo:location.origin+location.pathname});
  if(error)toast("خطا",error.message,"error"); else toast("ایمیل ارسال شد","پیوند بازیابی رمز به ایمیل ثبت‌شده ارسال شد.","success");
}
ensure();