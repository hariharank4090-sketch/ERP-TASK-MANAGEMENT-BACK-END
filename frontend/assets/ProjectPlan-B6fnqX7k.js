import{j as r,B as Ce,Y as ct,a1 as U,n as Be}from"./mui-DEN9m6h-.js";import{r as A,a as pt}from"./vendor-BIUH9fz7.js";import{x as ut,I as ft,J as mt,H as gt,V as ht,f as Ie,W as xt,S as pe}from"./index-C4NrENYf.js";import{D as We}from"./TopFilterBar-BHr-6_JB.js";import{F as Ye}from"./dataTable-CpUl1zqr.js";import"./xlsx-DMLx_f5p.js";import"./appDialog-DknsA4Rw.js";const yt=`
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --primary: #cda363;
    --primary-hover: #bda068;
    --secondary: #ead8b9;
    --dark: #1c2d45;
    --dark-soft: #26384e;
    --light: #ffffff;
    --bg-gradient: linear-gradient(to bottom, #ead9bd 0%, #f2ede5 55%, #f7f7f7 100%);
    --border: #d9bd91;
    --text-main: #1c2d45;
    --text-dark: #1c2d45;
    --text-light: #64748b;
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 8px 24px rgba(183, 154, 108, 0.15);
    --shadow-lg: 0 20px 48px rgba(28, 45, 69, 0.1);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --green: #4caf7d;
    --orange: #f2a93b;
    --red: #f43f5e;
    --purple: #b79a6c;
    --teal: #8a6730;
    --blue: #4a90d9;
  }

  .dashboard-container {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Header & Navigation */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--primary);
    border: 1px solid var(--border);
    padding: 8px 16px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    flex-wrap: wrap;
    gap: 10px;
  }
  .header-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-icon {
    font-size: 20px;
    color: var(--light);
  }
  .header-logo h1 {
    font-size: 15px;
    font-weight: 800;
    color: var(--light);
    letter-spacing: -0.5px;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .back-btn {
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--light);
    color: var(--text-main);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  .back-btn:hover { background: #f8fafc; border-color: var(--text-light); }

  /* Applied Filters Bar */
  .applied-filters-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .filter-badge {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.12);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .badge-lbl { color: var(--text-light); font-weight: 600; }
  .date-badge {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.12);
    color: #1c2d45;
    font-weight: 600;
  }
  .date-badge i {
    color: #8a6730;
  }

  /* Card Panels & Tables */
  .card-panel {
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    border: none;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .panel-title { display: flex; flex-direction: column; gap: 4px; }
  .panel-title h2 { font-size: 16px; font-weight: 800; color: var(--text-dark); margin: 0; }
  .panel-title p, .panel-title .helper-txt { font-size: 12px; color: var(--text-light); }
  
  .table-wrapper { overflow-x: auto; }
  .custom-dashboard-table { width: 100%; border-collapse: collapse; text-align: center; }
  .custom-dashboard-table th {
    background: var(--primary);
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 700;
    color: var(--light);
    border-bottom: 2px solid var(--border);
  }
  .custom-dashboard-table td {
    padding: 16px;
    font-size: 14px;
    color: var(--text-main);
    border-bottom: 1px solid var(--border);
  }
  .clickable-row { cursor: pointer; transition: background 0.15s ease; }
  .clickable-row:hover { background: #f8fafc; }
  
  .proj-title { color: var(--primary); font-weight: 700; font-size: 15px; }
  .task-title { font-weight: 700; color: var(--text-dark); font-size: 14px; }
  
  .indicator-badge {
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dark);
  }
  .team-badge {
    background: rgba(205, 163, 99, 0.1);
    color: #8a6730;
    border: 1px solid rgba(205, 163, 99, 0.25);
    cursor: help;
  }

  .panel-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .panel-actions-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .filter-date-badge-wrapper { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

  /* Nested Table Detail Rows */
  .drilldown-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .drilldown-title { display: flex; align-items: center; gap: 12px; }
  .drilldown-title h2 { font-size: 16px; font-weight: 800; color: var(--text-dark); margin: 0; }
  .back-icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--light);
    color: var(--text-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  .back-icon-btn:hover { background: #f1f5f9; }
  
  .toggle-all-rows-btn-inline {
    background: transparent;
    border: none;
    color: var(--light);
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    transition: background 0.2s ease;
  }
  .toggle-all-rows-btn-inline:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  .expand-row-indicator {
    background: transparent;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    transition: transform 0.2s ease;
    display: inline-block;
  }
  .expand-row-indicator.rotated { transform: rotate(90deg); color: var(--primary); }
  
  .detail-row { background: #fbfbfe; }
  .nested-table-container {
    padding: 0;
  }
  .nested-table-container h4 { font-size: 14px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; padding: 0 16px; }
  .nested-dashboard-table { width: 100%; border-collapse: collapse; }
  .nested-dashboard-table th { padding: 10px 12px; font-size: 13px; background: #f1f5f9; border-bottom: 1px solid var(--border); }
  .nested-dashboard-table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }

  /* Float Team tooltip */
  .hover-tooltip-card {
    background: var(--dark);
    color: var(--light);
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    max-width: 250px;
    pointer-events: none;
    position: fixed;
  }
  .tooltip-title { font-size: 10px; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 2px; }
  .hover-tooltip-card p { font-size: 11px; line-height: 1.4; margin: 0; }
  .no-data { text-align: center; padding: 40px; color: var(--text-light); }

  /* CSS hack to flatten nested tables in expandableComp to align columns with parent */
  tr:has(> td > .my-expand-wrapper),
  td:has(> .my-expand-wrapper),
  .my-expand-wrapper,
  .my-expand-wrapper > table,
  .my-expand-wrapper > table > tbody {
    display: contents !important;
  }
  .detail-row td {
    background-color: #fbfbfe !important;
    border-bottom: 1px solid #e0e0e0 !important;
  }
`;function Le(n){if(n==null||n==="-"||n==="")return null;if(typeof n=="number")return n;let i=String(n).trim();if(!i||i==="-")return null;i.includes("T")&&(i=i.split("T")[1]);const h=i.split(" ");if(h.length===2&&(h[1].toUpperCase()==="AM"||h[1].toUpperCase()==="PM")){const x=h[0].split(":");let j=parseInt(x[0],10);const L=parseInt(x[1]||"0",10);return isNaN(j)||isNaN(L)?null:(h[1].toUpperCase()==="PM"&&j!==12&&(j+=12),h[1].toUpperCase()==="AM"&&j===12&&(j=0),j*60+L)}const S=i.split(":");if(S.length>=2){const x=parseInt(S[0],10),j=parseInt(S[1],10);if(!isNaN(x)&&!isNaN(j))return x*60+j}const k=parseFloat(i);return isNaN(k)?null:k}function V(n){if(!n||n==="-")return"-";const i=Le(n);if(i===null)return n;let h=Math.floor(i/60);const S=i%60,k=h>=12?"PM":"AM";return h=h%12,h===0&&(h=12),`${h}:${String(S).padStart(2,"0")} ${k}`}function Je(n,i,h){const S=Le(n),k=Le(i);if(S!==null&&k!==null){let x=k-S;x<0&&(x+=1440);const j=Math.floor(x/60),L=x%60;return j+"h "+String(L).padStart(2,"0")+"m"}if(h){const x=Fe(h);if(x>0){const j=Math.floor(x/60),L=x%60;return j+"h "+String(L).padStart(2,"0")+"m"}}return"-"}function Fe(n){if(n==null||n==="-")return 0;if(typeof n=="number")return n;let i=String(n).trim();if(!i||i==="-")return 0;if(i.includes("T")&&(i=i.split("T")[1]),i.includes("h")||i.includes("m")){const S=i.split(" ");let k=0;for(const x of S)if(x.includes("h")){const j=parseInt(x,10);isNaN(j)||(k+=j*60)}else if(x.includes("m")){const j=parseInt(x,10);isNaN(j)||(k+=j)}return k}if(i.includes(":")){const S=i.split(":"),k=parseInt(S[0],10)||0,x=parseInt(S[1],10)||0;return k*60+x}const h=parseFloat(i);return isNaN(h)?0:h}function B(n){if(!n)return"-";const i=n.split("-");if(i.length!==3)return n;const[h,S,k]=i,x=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],j=parseInt(S,10)-1;return k+" "+(x[j]||S)+" "+h}function Ge(n){const i=new Set;return n.filter(h=>{const S=[h.date,h.project,h.taskName,h.employee].join("|");return i.has(S)?!1:(i.add(S),!0)})}function q(n){if(!n||typeof n!="string")return!1;const i=n.trim();return i!==""&&i!=="-"&&i.toLowerCase()!=="unassigned"&&i.toLowerCase()!=="employee"}function ue(n){if(!n)return!0;if(n.Del_Flag===!0||String(n.Del_Flag).toLowerCase()==="true"||String(n.del_flag).toLowerCase()==="true")return!1;const i=String(n.Project_Status??n.project_status??n.Project_Status_Name??n.Project_Status_Id??n.project_status_id??n.Project_ID_Status??n.Project_Stat??n.statusText??n.status??n.Status??"").trim().toLowerCase();if(i==="inactive"||i==="disabled"||i==="completed"||i==="closed"||i==="0"||i==="false")return!1;const h=n.Project_Status??n.project_status??n.Project_ID_Status??n.Project_Status_Id??n.project_status_id??n.Project_Status_ID??n.Project_Stat??n.project_stat??n.Status??n.status;if(h!=null&&h!==""){const k=Number(h);if(!isNaN(k)){if(k===0||k===2)return!1;if(k===1)return!0}}const S=n.IsActive??n.is_active??n.Is_Active??n.Active??n.active;if(S!=null&&S!==""){const k=Number(S);if(!isNaN(k)&&k===0||S===!1||String(S).toLowerCase()==="false")return!1}return!0}function Pe(n){let i=0,h=0,S=0,k=0,x="",j="",L="";const G=new Set;n.forEach(P=>{const Y=P.startDate&&P.startDate!=="-"?P.startDate:P.date&&P.date!=="-"?P.date:"",z=P.endDate&&P.endDate!=="-"?P.endDate:Y;Y&&((!x||Y<x)&&(x=Y),G.add(Y)),z&&((!j||z>j)&&(j=z),G.add(z)),P.executedStatus==="Completed"&&(!L||z&&z>L)&&(L=z);const me=Je(P.assignedStart,P.assignedEnd,P.assignedDurationRaw),oe=Fe(me);i+=oe;const ne=Fe(P.executedDuration);S+=ne,P.executedStatus==="Completed"||P.executedStatus==="In Progress"?h+=ne:k+=oe});const p=i>0?Math.round(h/i*100):0;let K="";const re=k/60;re>0?K=re.toFixed(1)+"h":K="0.0h";const se=S;let N="";const W=(i-se)/60;W<0?N=W.toFixed(1)+"h":W>0?N="+"+W.toFixed(1)+"h":N="0.0h";const X=L?B(L):"-",fe=(i/60).toFixed(1)+"h",Q=G.size,Te=`${Q} ${Q===1?"day":"days"}`,R=`${fe} (${Te})`;return{startDate:x?B(x):"-",endDate:j?B(j):"-",actualCompletedDate:X,assignHrs:R,completedHrs:(h/60).toFixed(1)+"h",delayHrs:K,workingHrs:(se/60).toFixed(1)+"h",workingDelta:N,progress:p}}const jt=()=>{const n=new Date,i=n.getFullYear(),h=n.getMonth(),S=new Date(i,h,1),k=new Date(i,h+1,0),x=j=>{const L=j.getFullYear(),G=String(j.getMonth()+1).padStart(2,"0"),p=String(j.getDate()).padStart(2,"0");return`${L}-${G}-${p}`};return{startDate:x(S),endDate:x(k)}},{startDate:Ee,endDate:Me}=jt(),Dt=()=>{const{currentCompany:n}=ut(),[i,h]=A.useState([]),[S,k]=A.useState(!0),[x,j]=A.useState(null),[L,G]=A.useState({}),[p,K]=A.useState({projectStatus:"ACTIVE",from:Ee,to:Me,project:[],taskType:[],task:[],employee:[]}),[re,se]=A.useState(!0),[N,W]=A.useState({projectStatus:"ACTIVE",from:Ee,to:Me,project:[],taskType:[],task:[],employee:[]}),[X,fe]=A.useState({show:!1,x:0,y:0,text:""}),[Q,Te]=A.useState([]),[R,P]=A.useState([]),Y=A.useCallback(async()=>{const a=n?.companyId||void 0;k(!0);try{const o=ft({},a),u=mt({}),f=gt(a),m=ht(a,void 0,void 0,!0),y=Ie({address:"masters/taskType/",method:"GET"}).catch(()=>null),_=Ie({address:"masters/projectScheduleEmp/list",method:"GET"}).catch(()=>null),D=Ie({address:"masters/projectSchedule/",method:"GET"}).catch(()=>null),t=xt(a,void 0,void 0,!0).catch(()=>[]),[s,d,T,v,M,C,O,H]=await Promise.all([o,u,f,m,y,_,D,t]);Array.isArray(T)&&T.length>0&&Te(T);const $=new Map;Array.isArray(T)&&T.forEach(e=>{const c=e.Emp_Id??e.emp_id??e.Id??e.value,l=e.Emp_Name??e.emp_name??e.Name??e.label;c!=null&&l&&$.set(String(c).trim(),String(l).trim())});const he=e=>{if(e.Emp_Name&&typeof e.Emp_Name=="string"&&e.Emp_Name.trim()!==""&&e.Emp_Name.trim()!=="Employee")return e.Emp_Name.trim();const c=e.Emp_Id??e.emp_id??e.Assigned_Emp_Id;if(c!=null&&String(c).trim()!==""){const l=$.get(String(c).trim());if(l)return l}return"-"},Re=new Map;let Ne=[];Array.isArray(M)?Ne=M:M?.data&&Array.isArray(M.data)&&(Ne=M.data),Ne.forEach(e=>{const c=e.Task_Type_Id??e.task_type_id??e.Id,l=e.Task_Type??e.task_type??e.Task_Type_Name??e.Name;c!=null&&l&&Re.set(String(c).trim(),String(l).trim())});const xe=e=>{const c=e.Task_Type_Id??e.task_type_id??e.Schedule_Task_Type_Id??e.taskDetails?.Task_Type_Id??e.projectDetails?.Task_Type_Id;if(c!=null&&String(c).trim()!==""){const g=Re.get(String(c).trim());if(g)return g}const l=e.Task_Type??e.task_type??e.taskType??e.taskDetails?.Task_Type??e.projectDetails?.Task_Type;return l&&typeof l=="string"&&l.trim()!==""&&l.trim()!=="Development"?l.trim():"-"};let ie=[];Array.isArray(v)?ie=v:v?.data&&Array.isArray(v.data)&&(ie=v.data);const Z=new Map;P(ie),ie.forEach(e=>{const c=ue(e),l=e.Project_Id??e.project_id??e.Id,g=e.Project_Name??e.project_name??e.Name;l!=null&&String(l).trim()!==""&&Z.set(String(l).trim().toLowerCase(),c),g&&String(g).trim()!==""&&Z.set(String(g).trim().toLowerCase(),c)});const ye=e=>{if(!e||!ue(e))return!1;const c=e.Project_Id??e.project_id??e.taskDetails?.Project_Id??e.projectDetails?.Project_Id;if(c!=null&&String(c).trim()!==""){const g=String(c).trim().toLowerCase();if(Z.has(g)&&!Z.get(g))return!1}const l=e.Project_Name??e.project_name??e.taskDetails?.Project_Name??e.projectDetails?.Project_Name;if(l&&String(l).trim()!==""){const g=String(l).trim().toLowerCase();if(Z.has(g)&&!Z.get(g))return!1}return!0};let je=[];s?.data&&Array.isArray(s.data)?je=s.data:s?.items&&Array.isArray(s.items)?je=s.items:Array.isArray(s)&&(je=s);let le=[];d?.data?.items&&Array.isArray(d.data.items)?le=d.data.items:d?.data&&Array.isArray(d.data)?le=d.data:d?.items&&Array.isArray(d.items)?le=d.items:Array.isArray(d)&&(le=d);const de=new Map;let ee=[];O?.data&&Array.isArray(O.data)?ee=O.data:O?.data?.data&&Array.isArray(O.data.data)?ee=O.data.data:Array.isArray(O)&&(ee=O),ee.forEach(e=>{const c=e.schId??e.Sch_Id??e.Id??e.id??e.Schedule_Sch_Id;if(c!=null&&String(c).trim()!==""){const l=String(c).trim(),g=e.schType??e.Sch_Type??e.Sch_Type_Id??e.schTypeId??e.Schedule_Sch_Type??e.SCH_TYPE??e.sch_type;g!=null&&g!==""&&de.set(l,g)}});let Se=[];C?.data&&Array.isArray(C.data)?Se=C.data:C?.data?.data&&Array.isArray(C.data.data)?Se=C.data.data:Array.isArray(C)&&(Se=C),Se.forEach(e=>{const c=e.schId??e.Sch_Id??e.Id??e.id??e.Schedule_Sch_Id;if(c!=null&&String(c).trim()!==""){const l=String(c).trim(),g=e.schType??e.Sch_Type??e.Sch_Type_Id??e.schTypeId??e.Schedule_Sch_Type??e.SCH_TYPE??e.sch_type;g!=null&&g!==""&&(de.has(l)||de.set(l,g))}});const _e=e=>{if(!e)return"-";const c=b=>{if(b==null||b===""||b==="-")return null;const F=String(b).trim().toLowerCase();if(F==="2"||F==="repetitive"||F==="repetative")return"Repetitive";if(F==="1"||F==="onetime"||F==="one-time"||F==="one time")return"One Time";const ce=Number(F);return ce===2?"Repetitive":ce===1?"One Time":null},l=e.Sch_Type??e.schType??e.Sch_Type_Id??e.schTypeId??e.Schedule_Sch_Type??e.Schedule_Sch_Type_Id??e.sch_type??e.sch_type_id??e.Sch_Type_Name??e.SCH_TYPE,g=c(l);if(g)return g;const w=e.Sch_Id??e.sch_id??e.schId??e.Id??e.id??e.Schedule_Sch_Id;if(w!=null&&String(w).trim()!==""&&String(w).trim()!=="-"){const b=String(w).trim();if(de.has(b)){const F=c(de.get(b));if(F)return F}}const I=e.schPlanId??e.Schedule_Sch_Plan_Id??e.Sch_Plan_Id??e.sch_plan_id;if(I!=null&&I!==""&&!isNaN(Number(I))){const b=Number(I);if(b===5)return"One Time";if(b>0&&b!==5)return"Repetitive"}if(e.planType&&typeof e.planType=="string"){const b=e.planType.toLowerCase();if(b.includes("day")||b.includes("week")||b.includes("month")||b.includes("repetitive")||b.includes("repetative"))return"Repetitive";if(b.includes("one"))return"One Time"}return"-"};let te=[];C?.data&&Array.isArray(C.data)?te=C.data:C?.data?.data&&Array.isArray(C.data.data)?te=C.data.data:Array.isArray(C)&&(te=C),te.length===0&&ee.length>0&&(te=ee);let be=[];Array.isArray(H)?be=H:H?.data&&Array.isArray(H.data)&&(be=H.data);const De=new Map;ie.forEach(e=>{const c=e.Project_Id??e.project_id??e.Id,l=e.Project_Name??e.project_name??e.Name;c!=null&&l&&De.set(String(c).trim(),String(l).trim())});const He=new Map;be.forEach(e=>{const c=e.Task_Id??e.task_id??e.Id,l=e.Task_Name??e.task_name??e.Name;c!=null&&l&&He.set(String(c).trim(),String(l).trim())});const ae=[];je.forEach(e=>{const c=ye(e),l=e.Sch_Time||e.Sch_Est_Start_Time||e.Start_Time||"09:30:00",g=e.EN_Time||e.Sch_Est_End_Time||e.End_Time||"18:30:00",w=e.Task_Sch_Duaration||e.Tot_Minutes,I=e.Task_Assign_dt||e.Sch_Start_Date||e.Sch_Date||"",b=I?String(I).split("T")[0]:"";ae.push({schId:e.Sch_Id??e.sch_id??e.schId,date:b||"-",startDate:b||"-",endDate:b||"-",project:e.Project_Name||"General",taskName:e.Task_Name||`Task ${e.Task_Id}`,taskType:xe(e),scheduleType:_e(e),employee:he(e),assignedStart:V(l),assignedEnd:V(g),assignedDurationRaw:w,assignedStatus:e.Invovled_Stat===3?"Completed":e.Invovled_Stat===2?"In Progress":"New",executedStart:V(e.Start_Time||l),executedEnd:V(e.End_Time||g),executedDuration:e.Tot_Minutes?`${Math.floor(e.Tot_Minutes/60)}h ${String(e.Tot_Minutes%60).padStart(2,"0")}m`:e.Task_Sch_Duaration||"8h 00m",executedStatus:e.Invovled_Stat===3?"Completed":e.Invovled_Stat===2?"In Progress":"-",isProjectActive:c})}),le.forEach(e=>{const c=ye(e),l=e.Start_Time||e.Sch_Est_Start_Time||e.Sch_Time||"09:30:00",g=e.End_Time||e.Sch_Est_End_Time||e.EN_Time||"18:30:00",w=e.Tot_Minutes||e.Task_Sch_Duaration,I=e.Work_Dt||e.Sch_Start_Date||e.Sch_Date||"",b=I?String(I).split("T")[0]:"";ae.push({schId:e.Sch_Id??e.sch_id??e.schId,date:b||"-",startDate:b||"-",endDate:b||"-",project:e.Project_Name||e.taskDetails?.Project_Name||"General",taskName:e.Task_Name||e.taskDetails?.Task_Name||`Task ${e.Task_Id}`,taskType:xe(e),scheduleType:_e(e),employee:he(e),assignedStart:V(l),assignedEnd:V(g),assignedDurationRaw:w,assignedStatus:e.Work_Status==="Completed"||e.Work_Status==="3"?"Completed":"In Progress",executedStart:V(l),executedEnd:V(g),executedDuration:e.Tot_Minutes?`${Math.floor(e.Tot_Minutes/60)}h ${String(e.Tot_Minutes%60).padStart(2,"0")}m`:e.Task_Sch_Duaration||"8h 00m",executedStatus:e.Work_Status==="Completed"||e.Work_Status==="3"?"Completed":"In Progress",isProjectActive:c})});const ke=new Set,we=new Set;ae.forEach(e=>{e.project&&e.taskName&&ke.add(`${e.project.trim().toLowerCase()}|${e.taskName.trim().toLowerCase()}`),e.schId&&we.add(String(e.schId))}),te.forEach(e=>{const c=ye(e);let l=e.Project_Name??e.projectName??e.project_name??e.taskDetails?.Project_Name??e.projectDetails?.Project_Name;const g=e.Project_Id??e.project_id??e.taskDetails?.Project_Id??e.projectDetails?.Project_Id;!l&&g!==void 0&&g!==null&&(l=De.get(String(g).trim()));let w=e.Task_Name??e.taskName??e.task_name??e.taskDetails?.Task_Name;const I=e.Task_Id??e.task_id??e.taskDetails?.Task_Id;if(!w&&I!==void 0&&I!==null&&(w=He.get(String(I).trim())),!l&&g&&(l=`Project ${g}`),!w&&I&&(w=`Task ${I}`),!l||!w)return;const b=e.Sch_Id??e.sch_id??e.schId??e.Id??e.id,F=e.Id?`emp_sch_${e.Id}`:b?String(b):`${String(l).trim()}|${String(w).trim()}|${he(e)}|${e.Sch_Start_Date||e.Sch_Date||e.Schedule_Sch_Start_Date||""}`;if(we.has(F))return;const ce=e.Schedule_Sch_Start_Date||e.Sch_Start_Date||e.schStartDate||e.Task_Assign_dt||e.Sch_Date||e.schDate||e.Work_Dt||"",$e=e.Schedule_Sch_End_Date||e.Sch_End_Date||e.schEndDate||e.Task_Assign_dt||e.Sch_Date||e.schDate||e.Work_Dt||"",Ae=ce?String(ce).split("T")[0]:"",nt=$e?String($e).split("T")[0]:Ae,it=e.Sch_Time||e.Sch_Est_Start_Time||e.Start_Time||"09:30:00",lt=e.EN_Time||e.Sch_Est_End_Time||e.End_Time||"18:30:00",dt=e.Schedule_Task_Sch_Duaration||e.Task_Sch_Duaration||e.schDuaration||e.Sch_Duration||e.Tot_Minutes||"8h 00m";ae.push({schId:b?String(b):void 0,date:Ae||"-",startDate:Ae||"-",endDate:nt||"-",project:String(l).trim(),taskName:String(w).trim(),taskType:xe(e),scheduleType:_e(e),employee:he(e),assignedStart:V(it),assignedEnd:V(lt),assignedDurationRaw:dt,assignedStatus:e.Invovled_Stat===3?"Completed":e.Invovled_Stat===2?"In Progress":"New",executedStart:"-",executedEnd:"-",executedDuration:"-",executedStatus:"-",isProjectActive:c}),we.add(F),ke.add(`${String(l).trim().toLowerCase()}|${String(w).trim().toLowerCase()}`)}),be.forEach(e=>{const c=ye(e);let l=e.Project_Name??e.project_name??e.taskDetails?.Project_Name??e.projectDetails?.Project_Name;const g=e.Project_Id??e.project_id??e.taskDetails?.Project_Id;!l&&g!==void 0&&g!==null&&(l=De.get(String(g).trim())),!l&&g&&(l=`Project ${g}`);const w=e.Task_Name??e.task_name??e.Name;if(!l||!w)return;const I=`${String(l).trim().toLowerCase()}|${String(w).trim().toLowerCase()}`;ke.has(I)||(ae.push({date:"-",project:String(l).trim(),taskName:String(w).trim(),taskType:xe(e),scheduleType:_e(e),employee:"Unassigned",assignedStart:"-",assignedEnd:"-",assignedDurationRaw:"0",assignedStatus:"New",executedStart:"-",executedEnd:"-",executedDuration:"-",executedStatus:"-",isProjectActive:c}),ke.add(I))}),h(ae)}catch(o){console.error("API fetch error in ProjectPlan",o),h([])}finally{k(!1)}},[n?.companyId]);A.useEffect(()=>{(async()=>await Y())()},[Y]);const z=()=>{W({...p}),se(!0)},me=()=>{se(!1)},oe=()=>{if(N.from&&N.to&&N.from>N.to){alert("From Date cannot be greater than To Date.");return}K({...N})},ne=()=>{const a={projectStatus:"ACTIVE",from:Ee,to:Me,project:[],taskType:[],task:[],employee:[]};W({...a}),K({...a}),j(null)},E=A.useMemo(()=>{const a=new Map;return R.forEach(o=>{const u=o.Project_Name||o.project_name||o.Name,f=ue(o)?1:0;u&&(a.set(String(u).trim(),f),a.set(String(u).trim().toLowerCase(),f));const m=o.Project_Id??o.project_id??o.Id;m!=null&&a.set(String(m),f)}),a},[R]),ge=A.useMemo(()=>{let a=[...i];const{projectStatus:o,from:u,to:f,project:m,taskType:y,task:_,employee:D}=p;if(o&&o!=="ALL"&&(a=a.filter(t=>{let s=t.isProjectActive;if(s===void 0&&t.project){const d=E.get(t.project)??E.get(String(t.project).trim().toLowerCase());d!==void 0&&(s=d!==0)}return s===void 0?!0:o==="ACTIVE"?s===!0:s===!1})),(u||f)&&(a=a.filter(t=>{if(!t.date||t.date==="-")return!0;const s=t.startDate&&t.startDate!=="-"?t.startDate:t.date,d=t.endDate&&t.endDate!=="-"?t.endDate:s;return!(u&&d<u||f&&s>f)})),m&&m.length>0){const t=new Set(m.map(s=>String(s).trim().toLowerCase()));a=a.filter(s=>s.project&&t.has(String(s.project).trim().toLowerCase()))}if(y&&y.length>0){const t=new Set(y.map(s=>String(s).trim().toLowerCase()));a=a.filter(s=>s.taskType&&t.has(String(s.taskType).trim().toLowerCase()))}if(_&&_.length>0){const t=new Set(_.map(s=>String(s).trim().toLowerCase()));a=a.filter(s=>s.taskName&&t.has(String(s.taskName).trim().toLowerCase()))}if(D&&D.length>0){const t=new Set(D.map(s=>String(s).trim().toLowerCase()));a=a.filter(s=>s.employee&&t.has(String(s.employee).trim().toLowerCase()))}return a},[i,p,E]),ve=A.useMemo(()=>{let a=[...i];const{from:o,to:u,employee:f,taskType:m,task:y,projectStatus:_}=N;_&&_!=="ALL"&&(a=a.filter(t=>{let s=t.isProjectActive;if(s===void 0&&t.project){const d=E.get(t.project)??E.get(String(t.project).trim().toLowerCase());d!==void 0&&(s=d!==0)}return s===void 0?!0:_==="ACTIVE"?s===!0:s===!1})),o&&(a=a.filter(t=>!t.date||t.date==="-"||t.date>=o)),u&&(a=a.filter(t=>!t.date||t.date==="-"||t.date<=u)),f&&f.length>0&&(a=a.filter(t=>t.employee&&f.includes(t.employee))),m&&m.length>0&&(a=a.filter(t=>t.taskType&&m.includes(t.taskType))),y&&y.length>0&&(a=a.filter(t=>t.taskName&&y.includes(t.taskName)));const D=new Set;return a.forEach(t=>{t.project&&D.add(t.project)}),R.length>0&&f.length===0&&y.length===0&&m.length===0&&R.forEach(t=>{const s=ue(t);if(_==="ACTIVE"&&!s||_==="INACTIVE"&&s)return;const d=t.Project_Name||t.project_name||t.Name;d&&D.add(String(d).trim())}),Array.from(D).sort()},[R,i,N,E]),Ue=A.useMemo(()=>{let a=[...i];const{from:o,to:u,project:f,employee:m,task:y,projectStatus:_}=N;_&&_!=="ALL"&&(a=a.filter(t=>{let s=t.isProjectActive;if(s===void 0&&t.project){const d=E.get(t.project)??E.get(String(t.project).trim().toLowerCase());d!==void 0&&(s=d!==0)}return s===void 0?!0:_==="ACTIVE"?s===!0:s===!1})),o&&(a=a.filter(t=>!t.date||t.date==="-"||t.date>=o)),u&&(a=a.filter(t=>!t.date||t.date==="-"||t.date<=u)),f&&f.length>0&&(a=a.filter(t=>t.project&&f.includes(t.project))),m&&m.length>0&&(a=a.filter(t=>t.employee&&m.includes(t.employee))),y&&y.length>0&&(a=a.filter(t=>t.taskName&&y.includes(t.taskName)));const D=new Set;return a.forEach(t=>{t.taskType&&t.taskType!=="-"&&D.add(t.taskType)}),Array.from(D).sort()},[i,N,E]),qe=A.useMemo(()=>{let a=[...i];const{from:o,to:u,project:f,employee:m,taskType:y,projectStatus:_}=N;_&&_!=="ALL"&&(a=a.filter(t=>{let s=t.isProjectActive;if(s===void 0&&t.project){const d=E.get(t.project)??E.get(String(t.project).trim().toLowerCase());d!==void 0&&(s=d!==0)}return s===void 0?!0:_==="ACTIVE"?s===!0:s===!1})),o&&(a=a.filter(t=>!t.date||t.date==="-"||t.date>=o)),u&&(a=a.filter(t=>!t.date||t.date==="-"||t.date<=u)),f&&f.length>0&&(a=a.filter(t=>t.project&&f.includes(t.project))),m&&m.length>0&&(a=a.filter(t=>t.employee&&m.includes(t.employee))),y&&y.length>0&&(a=a.filter(t=>t.taskType&&y.includes(t.taskType)));const D=new Set;return a.forEach(t=>{t.taskName&&D.add(t.taskName)}),Array.from(D).sort()},[i,N,E]),Ke=A.useMemo(()=>{let a=[...i];const{from:o,to:u,project:f,taskType:m,task:y,projectStatus:_}=N;_&&_!=="ALL"&&(a=a.filter(t=>{let s=t.isProjectActive;if(s===void 0&&t.project){const d=E.get(t.project)??E.get(String(t.project).trim().toLowerCase());d!==void 0&&(s=d!==0)}return s===void 0?!0:_==="ACTIVE"?s===!0:s===!1})),o&&(a=a.filter(t=>!t.date||t.date==="-"||t.date>=o)),u&&(a=a.filter(t=>!t.date||t.date==="-"||t.date<=u)),f&&f.length>0&&(a=a.filter(t=>t.project&&f.includes(t.project))),m&&m.length>0&&(a=a.filter(t=>t.taskType&&m.includes(t.taskType))),y&&y.length>0&&(a=a.filter(t=>t.taskName&&y.includes(t.taskName)));const D=new Set;return a.forEach(t=>{t.employee&&q(t.employee)&&D.add(t.employee)}),Q.length>0&&f.length===0&&y.length===0&&m.length===0&&Q.forEach(t=>{const s=t.Emp_Name||t.emp_name||t.Emp_Name_Full||t.Name;s&&q(s)&&D.add(String(s).trim())}),Array.from(D).sort()},[Q,i,N,E]),Xe=()=>{j(null)},Qe=a=>{j(a)},Ze=a=>{G(o=>({...o,[a]:!o[a]}))},ze=(a,o)=>{const u=o.split("||").filter(Boolean).join(", ");fe({show:!0,x:a.clientX+12,y:a.clientY+12,text:u||"No resources assigned"})},Oe=()=>{fe(a=>({...a,show:!1}))},J=(a,o)=>{W(u=>{const f={...u,[a]:o};return a==="projectStatus"&&u.projectStatus!==o&&(f.project=[],f.taskType=[],f.task=[],f.employee=[]),f})},et=A.useMemo(()=>N.project.filter(a=>ve.includes(a)),[N.project,ve]),Ve=()=>r.jsxs(Ce,{display:"flex",flexDirection:"column",gap:2,sx:{pt:.5},children:[r.jsxs(Ce,{display:"flex",gap:1.5,children:[r.jsx(U,{size:"small",sx:{flex:1},children:r.jsx(Be,{type:"date",size:"small",fullWidth:!0,value:N.from,onChange:a=>J("from",a.target.value),InputLabelProps:{shrink:!0},sx:{backgroundColor:"#fff","& .MuiOutlinedInput-notchedOutline":{borderColor:"#d1d5db"},"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"#cda363"}}})}),r.jsx(U,{size:"small",sx:{flex:1},children:r.jsx(Be,{type:"date",size:"small",fullWidth:!0,value:N.to,onChange:a=>J("to",a.target.value),InputLabelProps:{shrink:!0},sx:{backgroundColor:"#fff","& .MuiOutlinedInput-notchedOutline":{borderColor:"#d1d5db"},"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"#cda363"}}})})]}),r.jsx(U,{size:"small",fullWidth:!0,children:r.jsx(pe,{multiple:!0,value:et,onChange:a=>{const o=a.target.value,u=Array.isArray(o)?o:typeof o=="string"&&o?o.split(","):[];J("project",u)},allOptionLabel:"All Projects",allOptionValue:"",searchPlaceholder:"Search projects...",options:ve.map(a=>({value:a,label:a}))})}),r.jsx(U,{size:"small",fullWidth:!0,children:r.jsx(pe,{multiple:!0,value:N.taskType,onChange:a=>{const o=a.target.value,u=Array.isArray(o)?o:typeof o=="string"&&o?o.split(","):[];J("taskType",u)},allOptionLabel:"All Task Types",allOptionValue:"",searchPlaceholder:"Search task types...",options:Ue.map(a=>({value:a,label:a}))})}),r.jsx(U,{size:"small",fullWidth:!0,children:r.jsx(pe,{multiple:!0,value:N.task,onChange:a=>{const o=a.target.value,u=Array.isArray(o)?o:typeof o=="string"&&o?o.split(","):[];J("task",u)},allOptionLabel:"All Tasks",allOptionValue:"",searchPlaceholder:"Search tasks...",options:qe.map(a=>({value:a,label:a}))})}),r.jsx(U,{size:"small",fullWidth:!0,children:r.jsx(pe,{multiple:!0,value:N.employee,onChange:a=>{const o=a.target.value,u=Array.isArray(o)?o:typeof o=="string"&&o?o.split(","):[];J("employee",u)},allOptionLabel:"All Employees",allOptionValue:"",searchPlaceholder:"Search employees...",options:Ke.map(a=>({value:a,label:a}))})}),r.jsx(U,{size:"small",fullWidth:!0,children:r.jsx(pe,{value:N.projectStatus,onChange:a=>J("projectStatus",a.target.value),allOptionLabel:"All Status",allOptionValue:"ALL",searchPlaceholder:"Search status...",options:[{value:"ACTIVE",label:"Active Only"},{value:"INACTIVE",label:"Inactive Only"}]})})]}),tt=A.useMemo(()=>{const a=Ge(ge),o={},{projectStatus:u,project:f,taskType:m,task:y,employee:_}=p,D=m&&m.length>0||y&&y.length>0||_&&_.length>0,t=f&&f.length>0?new Set(f.map(d=>String(d).trim().toLowerCase())):null;return R.forEach(d=>{const T=d.Project_Name||d.project_name||d.Name;if(!T)return;const v=String(T).trim();if(!v)return;const M=ue(d);u==="ACTIVE"&&!M||u==="INACTIVE"&&M||t&&!t.has(v.toLowerCase())||D||o[v]||(o[v]=[])}),a.forEach(d=>{if(d.project){let T=d.isProjectActive;if(T===void 0){const v=E.get(d.project)??E.get(String(d.project).trim().toLowerCase());v!==void 0&&(T=v!==0)}if(u==="ACTIVE"&&T===!1||u==="INACTIVE"&&T===!0)return;o[d.project]||(!t||t.has(String(d.project).trim().toLowerCase()))&&(o[d.project]=[]),o[d.project]&&o[d.project].push(d)}}),Object.entries(o).sort((d,T)=>d[0].localeCompare(T[0])).map(([d,T])=>{const v=new Set(T.map($=>$.taskName).filter($=>$&&$!=="-")).size,M=new Set(T.map($=>$.employee).filter(q)),C=M.size,O=Array.from(M).join("||"),H=Pe(T);return{project:d,taskCount:v,empCount:C,empNames:O,startDate:H.startDate,assignHrs:H.assignHrs,endDate:H.endDate}})},[ge,p,R,E]),at=[{Field_Name:"project",ColumnHeader:"Project Name",Fied_Data:"string",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:a})=>r.jsx("strong",{className:"proj-title",children:a.project})},{Field_Name:"taskCount",ColumnHeader:"Tasks",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:a})=>r.jsx("span",{className:"indicator-badge",children:a.taskCount})},{Field_Name:"empCount",ColumnHeader:"Team Size",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:a})=>r.jsxs("span",{className:"indicator-badge team-badge",onMouseMove:o=>ze(o,a.empNames),onMouseLeave:Oe,children:[r.jsx("i",{className:"fa-solid fa-users-viewfinder"})," ",a.empCount]})},{Field_Name:"startDate",ColumnHeader:"Schedule Start Date",Fied_Data:"string",isVisible:1,align:"center"},{Field_Name:"assignHrs",ColumnHeader:"Assign Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:a})=>r.jsx("div",{style:{minWidth:"110px"},children:a.assignHrs})},{Field_Name:"endDate",ColumnHeader:"Schedule End Date",Fied_Data:"string",isVisible:1,align:"center"}],rt=A.useMemo(()=>{if(!x)return[];const a=ge.filter(m=>m.project===x),o=Ge(a),u={};return o.forEach(m=>{u[m.taskName]||(u[m.taskName]=[]),u[m.taskName].push(m)}),Object.entries(u).map(([m,y])=>{const _=new Set(y.map(v=>v.employee).filter(q)),D=_.size,t=Array.from(_).join("||"),s=Pe(y),d=y.find(v=>v.taskType&&v.taskType!=="-")?.taskType||y[0]?.taskType||"-",T={};return y.forEach(v=>{const M=q(v.employee)?v.employee:"Not Assigned";T[M]||(T[M]=[]),T[M].push(v)}),{taskName:m,taskType:d,empCount:D,empNames:t,startDate:s.startDate,assignHrs:s.assignHrs,endDate:s.endDate,empGroups:T}})},[x,ge]),st=[{Field_Name:"taskName",ColumnHeader:"Task Name",Fied_Data:"string",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:a})=>r.jsx("span",{className:"task-title",children:a.taskName})},{Field_Name:"taskType",ColumnHeader:"Task Type",Fied_Data:"string",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:a})=>r.jsx("span",{className:"task-title",style:{color:"var(--text-light)",fontSize:"13px",fontWeight:500},children:a.taskType})},{Field_Name:"empCount",ColumnHeader:"Resources",Fied_Data:"number",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:a})=>r.jsxs("span",{className:"indicator-badge team-badge",onMouseMove:o=>ze(o,a.empNames),onMouseLeave:Oe,children:[r.jsx("i",{className:"fa-solid fa-user-gear"})," ",a.empCount]})},{Field_Name:"startDate",ColumnHeader:"Schedule Start Date",Fied_Data:"string",isVisible:1,align:"center"},{Field_Name:"assignHrs",ColumnHeader:"Assign Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:a})=>r.jsx("div",{style:{minWidth:"110px"},children:a.assignHrs})},{Field_Name:"endDate",ColumnHeader:"Schedule End Date",Fied_Data:"string",isVisible:1,align:"center"}],ot=({row:a})=>{const o=a.empGroups,u=a.taskName;return r.jsx("div",{className:"my-expand-wrapper",children:r.jsx("table",{children:r.jsx("tbody",{children:Object.entries(o).map(([f,m])=>{const y=Pe(m),_=u+"_"+f,D=!!L[_];return r.jsxs(pt.Fragment,{children:[r.jsxs("tr",{className:"clickable-row detail-row",onClick:()=>Ze(_),children:[r.jsx("td",{style:{borderBottom:"1px solid #f1f5f9"}}),r.jsx("td",{style:{borderBottom:"1px solid #f1f5f9"}}),r.jsx("td",{style:{borderBottom:"1px solid #f1f5f9"}}),r.jsxs("td",{style:{textAlign:"left",padding:"10px 12px",fontSize:"13px",borderBottom:"1px solid #f1f5f9"},children:[r.jsx("button",{className:`expand-row-indicator ${D?"rotated":""}`,style:{marginRight:"8px"},children:r.jsx("i",{className:"fa-solid fa-chevron-right"})}),r.jsx("strong",{children:q(f)?f:"Not Assigned"}),q(f)&&r.jsx("span",{className:"indicator-badge",style:{marginLeft:"6px"},title:"Total Schedules",children:m.length})]}),r.jsx("td",{style:{padding:"10px",fontSize:"13px",borderBottom:"1px solid #f1f5f9",textAlign:"center"},children:y.startDate}),r.jsx("td",{style:{padding:"10px",fontSize:"13px",borderBottom:"1px solid #f1f5f9",textAlign:"center"},children:y.assignHrs}),r.jsx("td",{style:{padding:"10px",fontSize:"13px",borderBottom:"1px solid #f1f5f9",textAlign:"center"},children:y.endDate})]}),D&&m.map((t,s)=>{const d=Je(t.assignedStart,t.assignedEnd,t.assignedDurationRaw),T=t.startDate&&t.startDate!=="-"?t.startDate:t.date&&t.date!=="-"?t.date:"",v=t.endDate&&t.endDate!=="-"?t.endDate:T||"",M=T?B(T):"-",C=v?B(v):"-";return r.jsxs("tr",{className:"detail-row",children:[r.jsx("td",{style:{borderBottom:"1px solid #e2e8f0"}}),r.jsx("td",{style:{borderBottom:"1px solid #e2e8f0"}}),r.jsx("td",{style:{borderBottom:"1px solid #e2e8f0"}}),r.jsxs("td",{style:{textAlign:"left",padding:"8px 12px 8px 36px",fontSize:"12px",borderBottom:"1px solid #e2e8f0"},children:[r.jsxs("span",{style:{color:"var(--text-light)",marginRight:"6px"},children:["#",s+1]}),t.scheduleType||"-"]}),r.jsx("td",{style:{textAlign:"center",padding:"8px",fontSize:"12px",borderBottom:"1px solid #e2e8f0"},children:M}),r.jsx("td",{style:{textAlign:"center",padding:"8px",fontSize:"12px",borderBottom:"1px solid #e2e8f0"},children:d}),r.jsx("td",{style:{textAlign:"center",padding:"8px",fontSize:"12px",borderBottom:"1px solid #e2e8f0"},children:C})]},s)})]},_)})})})})};return r.jsxs(r.Fragment,{children:[r.jsx("style",{children:yt}),r.jsx("div",{className:"dashboard-container",children:r.jsx("div",{className:"card-panel",id:"dashboardPanel",children:S?r.jsxs(Ce,{sx:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minHeight:400,gap:2,backgroundColor:"#ffffff",borderRadius:"12px",p:4,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",my:2},children:[r.jsx(ct,{sx:{color:"#cda363"},size:48}),r.jsx("span",{style:{fontSize:"14px",fontWeight:600,color:"#1c2d45"},children:"Loading Project Plan Data..."})]}):x?r.jsx(Ye,{headerTitle:r.jsxs("div",{className:"drilldown-title",children:[r.jsx("button",{className:"back-icon-btn",onClick:Xe,title:"Back",children:r.jsx("i",{className:"fa-solid fa-arrow-left"})}),r.jsx("h2",{style:{margin:0},children:x})]}),headerActions:r.jsxs("div",{className:"panel-actions-row",children:[r.jsxs("div",{className:"filter-date-badge-wrapper",id:"innerPillsBar",children:[(p.from||p.to)&&r.jsxs("div",{className:"filter-badge date-badge",children:[r.jsx("i",{className:"fa-regular fa-calendar"}),r.jsxs("span",{children:[p.from?B(p.from):"Start"," -"," ",p.to?B(p.to):"End"]})]}),p.projectStatus&&p.projectStatus!=="ALL"&&r.jsxs("div",{className:"filter-badge status-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Status:"}),r.jsx("span",{children:p.projectStatus==="ACTIVE"?"Active Only":"Inactive Only"})]}),p.project&&p.project.length>0&&r.jsxs("div",{className:"filter-badge project-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Proj:"}),r.jsx("span",{children:p.project.join(", ")})]}),p.taskType&&p.taskType.length>0&&r.jsxs("div",{className:"filter-badge task-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Type:"}),r.jsx("span",{children:p.taskType.join(", ")})]}),p.task&&p.task.length>0&&r.jsxs("div",{className:"filter-badge task-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Task:"}),r.jsx("span",{children:p.task.join(", ")})]}),p.employee&&p.employee.length>0&&r.jsxs("div",{className:"filter-badge resource-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Resource:"}),r.jsx("span",{children:p.employee.join(", ")})]})]}),r.jsx(We,{showTopButton:!1,useSlider:!0,dialogOpen:re,onOpenDialog:z,onCloseDialog:me,onSearch:oe,onReset:ne,closeOnSearch:!1,children:Ve()})]}),dataArray:rt,columns:st,isExpendable:!0,expandableComp:ot,disablePagination:!1,tableMaxHeight:700,CellSize:"medium",bodyFontSizePx:14,headerFontSizePx:15,PDFPrintOption:!1,ExcelPrintOption:!1,emptyMessage:"No tasks match the filters for this project.",tableProps:{sx:{width:"100%",minWidth:"100%"}}},`project-plan-detail-table-${x}`):r.jsx(Ye,{headerTitle:r.jsx("div",{className:"panel-title",children:r.jsx("h2",{style:{margin:0},children:"Project Plan List"})}),headerActions:r.jsxs("div",{className:"panel-actions-row",children:[r.jsxs("div",{className:"filter-date-badge-wrapper",id:"innerPillsBar",children:[(p.from||p.to)&&r.jsxs("div",{className:"filter-badge date-badge",children:[r.jsx("i",{className:"fa-regular fa-calendar"}),r.jsxs("span",{children:[p.from?B(p.from):"Start"," -"," ",p.to?B(p.to):"End"]})]}),p.projectStatus&&p.projectStatus!=="ALL"&&r.jsxs("div",{className:"filter-badge status-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Status:"}),r.jsx("span",{children:p.projectStatus==="ACTIVE"?"Active Only":"Inactive Only"})]}),p.project&&p.project.length>0&&r.jsxs("div",{className:"filter-badge project-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Proj:"}),r.jsx("span",{children:p.project.join(", ")})]}),p.taskType&&p.taskType.length>0&&r.jsxs("div",{className:"filter-badge task-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Type:"}),r.jsx("span",{children:p.taskType.join(", ")})]}),p.task&&p.task.length>0&&r.jsxs("div",{className:"filter-badge task-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Task:"}),r.jsx("span",{children:p.task.join(", ")})]}),p.employee&&p.employee.length>0&&r.jsxs("div",{className:"filter-badge resource-badge",children:[r.jsx("span",{className:"badge-lbl",children:"Resource:"}),r.jsx("span",{children:p.employee.join(", ")})]})]}),r.jsx(We,{showTopButton:!1,useSlider:!0,dialogOpen:re,onOpenDialog:z,onCloseDialog:me,onSearch:oe,onReset:ne,closeOnSearch:!1,children:Ve()})]}),dataArray:tt,columns:at,onClickFun:a=>Qe(a.project),disablePagination:!1,tableMaxHeight:700,CellSize:"medium",bodyFontSizePx:14,headerFontSizePx:15,PDFPrintOption:!1,ExcelPrintOption:!1,emptyMessage:"No matching records found. Try adjusting filters or click Reset.",tableProps:{sx:{width:"100%",minWidth:"100%"}}},"project-plan-main-table")})}),X.show&&r.jsxs("div",{className:"hover-tooltip-card",style:{display:"block",left:`${X.x}px`,top:`${X.y}px`},children:[r.jsx("div",{className:"tooltip-title",children:"Assigned Resources:"}),r.jsx("p",{children:X.text})]})]})};export{Dt as default};
