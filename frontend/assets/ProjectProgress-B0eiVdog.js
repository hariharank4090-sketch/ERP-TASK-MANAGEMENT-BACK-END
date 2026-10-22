import{j as t,bw as et,bx as tt,by as rt,bz as at,B as st,a1 as me}from"./mui-DEN9m6h-.js";import{r as C}from"./vendor-BIUH9fz7.js";import{x as ot,I as it,J as nt,f as ze,H as lt,V as ct,S as ue}from"./index-CE8RPA7e.js";import{F as Ve}from"./dataTable-CAqB87RD.js";import{D as Oe}from"./TopFilterBar-CgtVBll4.js";import"./xlsx-DMLx_f5p.js";import"./appDialog-DknsA4Rw.js";const dt=`
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
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      font-size: 22px;
      color: var(--light);
    }
    .header-logo h1 {
      font-size: 19px;
      font-weight: 800;
      color: var(--light);
      letter-spacing: -0.5px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .back-btn, .filter-toggle-btn, .reset-btn {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--light);
      color: var(--text-main);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .back-btn:hover { background: #f8fafc; border-color: var(--text-light); }
    .filter-toggle-btn { background: var(--secondary); color: var(--text-dark); border: none; }
    .filter-toggle-btn:hover {
      background: var(--light);
      box-shadow: 0 4px 12px rgba(183, 154, 108, 0.25);
    }
    .reset-btn:hover { background: #ef4444; color: var(--light); border-color: #ef4444; }

    .applied-filters-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .filter-badge {
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-lbl { color: var(--text-light); font-weight: 600; }
    .date-badge {
      background: rgba(205, 163, 99, 0.08);
      border-color: rgba(205, 163, 99, 0.25);
      color: #8a6730;
      font-weight: 600;
    }

    .card-panel {
      display: flex;
      flex-direction: column;
      gap: 0px;
      background: transparent;
      box-shadow: none;
      border: none;
      padding: 0;
    }
    .panel-title { display: flex; flex-direction: column; gap: 4px; }
    .panel-title h2 { font-size: 20px; font-weight: 800; color: var(--text-dark); }
    .panel-title p, .panel-title .helper-txt { font-size: 15px; color: var(--text-light); }
    
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
    
    .proj-title { color: var(--primary); font-weight: 700; font-size: 17px; }
    .task-title { font-weight: 700; color: var(--text-dark); }
    
    .indicator-badge {
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-dark);
    }
    .team-badge {
      background: rgba(205, 163, 99, 0.1);
      color: #8a6730;
      border: 1px solid rgba(205, 163, 99, 0.25);
      cursor: help;
    }

    .progress-cell-container {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      min-width: 140px;
    }
    .progress-pct { font-size: 15px; font-weight: 700; color: var(--text-dark); min-width: 32px; text-align: right; }
    .progress-bar-track {
      width: 100px;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      border-radius: 3px;
      margin: 0;
      transition: width 0.3s ease;
    }

    .status-badge-custom { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 14px; font-weight: 700; }
    .status-badge-custom.delay-high { background: rgba(244, 63, 94, 0.1); color: var(--red); }
    .status-badge-custom.delay-normal { background: rgba(16, 185, 129, 0.1); color: var(--green); }

    .panel-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .panel-actions-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .filter-date-badge-wrapper { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

    .drilldown-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .drilldown-title { display: flex; align-items: center; gap: 12px; }
    .drilldown-title h2 { font-size: 18px; font-weight: 800; color: var(--text-dark); }
    .back-icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--primary);
      background: var(--light);
      color: var(--text-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .back-icon-btn i { font-size: 16px; color: var(--text-dark); }
    .back-icon-btn:hover { background: #f1f5f9; box-shadow: var(--shadow-sm); }
    
    .toggle-all-rows-btn-inline {
      background: transparent;
      border: none;
      color: var(--light);
      cursor: pointer;
      font-size: 16px;
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
    
    .filter-drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .filter-drawer-overlay.show { display: flex; }
    .filter-drawer {
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      background: var(--light);
      box-shadow: var(--shadow-lg);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      opacity: 0;
      transition: all 0.2s ease-out;
    }
    .filter-drawer-overlay.show .filter-drawer { transform: scale(1); opacity: 1; }
    
    .filter-drawer-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .filter-drawer-header h2 { font-size: 20px; font-weight: 800; color: var(--text-dark); }
    .close-drawer-btn { background: transparent; border: none; font-size: 28px; cursor: pointer; color: var(--text-light); }
    
    .filter-drawer-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex-grow: 1; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 15px; font-weight: 700; color: var(--text-dark); }
    .form-group input, .form-group select { padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 16px; color: var(--text-main); background: var(--light); outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(92, 85, 233, 0.1); }
    
    .filter-drawer-footer { padding: 20px; border-top: 1px solid var(--border); display: flex; gap: 12px; background: #f8fafc; }
    .clear-btn-drawer { flex: 1; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--light); color: var(--text-main); font-size: 16px; font-weight: 600; cursor: pointer; }
    .apply-btn-drawer { flex: 1.5; padding: 12px; border-radius: var(--radius-sm); border: none; background: var(--primary); color: var(--light); font-size: 16px; font-weight: 600; cursor: pointer; }
    .apply-btn-drawer:hover { background: var(--primary-hover); }

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
      display: none;
    }
    .tooltip-title { font-size: 13px; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 2px; }
    .hover-tooltip-card p { font-size: 14px; line-height: 1.4; }
    
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
`,we=i=>{if(!i)return!0;if(i.Del_Flag===!0||String(i.Del_Flag).toLowerCase()==="true")return!1;const c=Number(i.Project_Status);return!(i.Project_Status!==void 0&&i.Project_Status!==null&&!isNaN(c)&&c===0||i.IsActive!==void 0&&i.IsActive!==null&&Number(i.IsActive)===0||i.statusText&&String(i.statusText).trim().toLowerCase()==="inactive")},We=i=>{if(!i||typeof i!="string")return!1;const c=i.trim();return c!==""&&c!=="-"&&c.toLowerCase()!=="unassigned"&&c.toLowerCase()!=="employee"&&isNaN(Number(c))},Ne=i=>{if(!i)return"";if(typeof i=="string"){if(i.includes("T"))return i.split("T")[0];if(i.length===10&&i.includes("-"))return i}try{const c=typeof i=="string"?new Date(i):i;if(isNaN(c.getTime()))return"";const v=c.getFullYear(),k=String(c.getMonth()+1).padStart(2,"0"),_=String(c.getDate()).padStart(2,"0");return`${v}-${k}-${_}`}catch{return""}},re=i=>{if(!i)return"-";const c=i.split("-");if(c.length!==3)return i;const[v,k,_]=c,N=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],D=parseInt(k,10)-1;return _+" "+(N[D]||k)+" "+v},ke=i=>{if(!i)return"--:--";if(typeof i=="string"){const c=i.trim();if(!c||c==="-")return"--:--";if(c.toLowerCase().includes("am")||c.toLowerCase().includes("pm"))return c;let v=c;c.includes("T")&&(v=c.split("T")[1]);const k=v.split(":");if(k.length>=2){let _=parseInt(k[0],10);const N=parseInt(k[1],10);if(!isNaN(_)&&!isNaN(N)){const D=_>=12?"PM":"AM";return _=_%12||12,`${_}:${String(N).padStart(2,"0")} ${D}`}}}return String(i)},Ue=(i,c)=>{const v=$=>{if(!$||$==="-"||$==="--:--")return null;const q=$.trim().split(" ");if(q.length!==2)return null;const[ee,ae]=q[0].split(":");let M=parseInt(ee,10);const Y=parseInt(ae,10);return isNaN(M)||isNaN(Y)?null:(q[1].toUpperCase()==="PM"&&M!==12&&(M+=12),q[1].toUpperCase()==="AM"&&M===12&&(M=0),M*60+Y)},k=v(i),_=v(c);if(k===null||_===null)return"-";let N=_-k;N<0&&(N+=1440);const D=Math.floor(N/60),U=N%60;return D+"h "+String(U).padStart(2,"0")+"m"},Be=i=>{if(!i||i==="-")return 0;const c=String(i).trim();if(!c)return 0;const v=Number(c);if(!isNaN(v)&&!/[hm]/i.test(c))return Math.round(v*60);const k=c.split(" ");let _=0;for(const N of k)if(N.includes("h")||N.includes("hr")){const D=parseFloat(N);isNaN(D)||(_+=D*60)}else if(N.includes("m")||N.includes("min")){const D=parseFloat(N);isNaN(D)||(_+=D)}return _===0&&!isNaN(v)?Math.round(v*60):_},Re=(i,c)=>Ue(i,c),Ge=i=>{const c=new Set;return i.filter(v=>{const k=[v.date,v.project,v.taskName,v.employee].join("|");return c.has(k)?!1:(c.add(k),!0)})},Ae=(i,c)=>{const v=typeof i=="number"?i:parseFloat(String(i))||0,k=typeof c=="number"?c:parseFloat(String(c))||0,_=parseFloat((v-k).toFixed(1));return Math.abs(_)<.05?"0.0h":_<0?_.toFixed(1)+"h":"+"+_.toFixed(1)+"h"},ne=i=>{let c=0,v=0,k=0,_=0,N="",D="",U="",$=0,q=0;const ee=i.some(j=>!!j.hasProcess1||!!j.rawActualCompletedDate),ae=i.some(j=>!!j.isScheduleCompleted||Number(j.Sch_Status)===3||Number(j.schStatus)===3||Number(j.Schedule_Sch_Status)===3||String(j.Sch_Status||j.schStatus||j.Schedule_Sch_Status||"").toLowerCase()==="completed"),M=new Set;i.forEach(j=>{j.date&&j.date!=="-"&&M.add(j.date),(!N||j.date<N)&&(N=j.date),(!D||j.date>D)&&(D=j.date);const _e=Ue(j.assignedStart,j.assignedEnd),K=Be(_e),G=Be(j.executedDuration);c+=K,k+=G;const ce=String(j.executedStatus||"").toLowerCase(),de=String(j.assignedStatus||"").toLowerCase(),z=ce==="completed"||ce==="3"||de==="completed"||de==="3"||ee||!!j.hasProcess1||ae||!!j.isScheduleCompleted,B=K>0?K:G>0?G:60;$+=B,z?(v+=G>0?G:B,q+=B):_+=K>0?K:B,j.rawActualCompletedDate&&(!U||j.rawActualCompletedDate>U)&&(U=j.rawActualCompletedDate)});let Y=0;ee||ae?Y=100:$>0?Y=Math.min(100,Math.round(q/$*100)):Y=0;let R="";const je=_/60;je>0?R=je.toFixed(1)+"h":R="0.0h";const L=k,Ce=parseFloat(((c-L)/60).toFixed(1)),g=Ae(c/60,L/60),Se=(c/60).toFixed(1)+"h",A=M.size,le=`${A} ${A===1?"day":"days"}`,se=`${Se} (${le})`;return{startDate:N?re(N):"-",endDate:D?re(D):"-",actualCompletedDate:U?re(U):"-",assignHrs:se,completedHrs:(v/60).toFixed(1)+"h",delayHrs:R,workingHrs:(L/60).toFixed(1)+"h",workingDelta:g,workingDeltaVal:Ce,progress:Y}},De=i=>{const c=String(i).trim().replace(/^[+-]/,"");return t.jsx("span",{style:{fontWeight:600},children:c})},Ie=i=>i.startsWith("+")?t.jsx("span",{style:{color:"var(--green)",fontWeight:700},children:i}):i.startsWith("-")?t.jsx("span",{style:{color:"var(--red)",fontWeight:700},children:i}):t.jsx("span",{children:i});let ge=null,fe=null,he=null,xe=null,be=null,ye=null;const Je={0:{label:"New"},1:{label:"New"},2:{label:"In Progress"},3:{label:"Completed"}},pt=i=>{const c=String(i??"").toLowerCase();return c==="3"||c==="completed"?{label:"Completed"}:c==="2"||c==="pending"?{label:"Pending"}:c==="1"||c==="in progress"||c==="inprocess"?{label:"In Progress"}:{label:String(i??"")}};function yt(){const{token:i,currentCompany:c,isSwitchingCompany:v}=ot(),[k,_]=C.useState(!0),[,N]=C.useState(!1),[D,U]=C.useState([]),[$,q]=C.useState([]),[ee,ae]=C.useState([]),[M,Y]=C.useState([]),[R,je]=C.useState([]),[L,Ce]=C.useState([]),[g,Se]=C.useState({projectStatus:"ACTIVE",from:"",to:"",project:[],taskType:[],task:[],employee:[]}),[A,le]=C.useState({projectStatus:"ACTIVE",from:"",to:"",project:[],taskType:[],task:[],employee:[]}),[se,j]=C.useState(null),[_e,K]=C.useState(!0),[G,ce]=C.useState({visible:!1,text:"",x:0,y:0}),de=C.useCallback(async(r=!1)=>{if(!i||!c?.companyId){_(!1),N(!1);return}try{r?N(!0):_(!0),ge=null,fe=null,he=null,xe=null,be=null,ye=null,ge=it({},c.companyId),fe=nt({}),he=ze({address:"masters/projectSchedule/",method:"GET"}),xe=ze({address:"masters/taskType/",method:"GET"}),be=lt(c.companyId),ye=ct(c.companyId,void 0,void 0,!0);const[n,f,b,p,h,m]=await Promise.all([ge,fe,he,xe,be,ye]);let o=[];n?.data&&Array.isArray(n.data)?o=n.data:n?.items&&Array.isArray(n.items)?o=n.items:Array.isArray(n)&&(o=n);let a=[];f?.data?.items&&Array.isArray(f.data.items)?a=f.data.items:f?.data&&Array.isArray(f.data)?a=f.data:f?.items&&Array.isArray(f.items)?a=f.items:Array.isArray(f)&&(a=f);let d=[];b?.data&&Array.isArray(b.data)?d=b.data:b?.data?.data&&Array.isArray(b.data.data)?d=b.data.data:Array.isArray(b)&&(d=b);let S=[];p?.data&&Array.isArray(p.data)?S=p.data:p?.items&&Array.isArray(p.items)?S=p.items:Array.isArray(p)&&(S=p),ae(S);let y=[];Array.isArray(h)?y=h:h?.data&&Array.isArray(h.data)?y=h.data:h?.items&&Array.isArray(h.items)&&(y=h.items),je(y);let I=[];Array.isArray(m)?I=m:m?.data&&Array.isArray(m.data)?I=m.data:m?.items&&Array.isArray(m.items)&&(I=m.items),Ce(I),U(o),q(a),Y(d)}catch(n){console.error("Error loading task comparison data:",n),ge=null,fe=null,he=null,xe=null,be=null,ye=null}finally{_(!1),N(!1)}},[i,c?.companyId]);C.useEffect(()=>{if(!v)return de(),()=>{ge=null,fe=null,he=null,xe=null,be=null,ye=null}},[de,v]);const z=C.useMemo(()=>{const r=new Map,n=new Map;R.forEach(e=>{const x=e.Emp_Id??e.emp_id??e.Emp_ID??e.Id,s=e.Emp_Name||e.emp_name||e.Emp_Name_Full||e.Name;x!=null&&s&&n.set(String(x),s)});const f=new Map;ee.forEach(e=>{e.Task_Type_Id!==void 0&&e.Task_Type&&f.set(String(e.Task_Type_Id),e.Task_Type)});const b=new Map,p=new Map;L.forEach(e=>{const x=e.Project_Id??e.project_id??e.Project_ID??e.Id,s=e.Project_Name??e.project_name??e.Project_NAME??e.Name;x!=null&&b.set(String(x),e),s&&p.set(String(s).trim().toLowerCase(),e)});const h=(e,x)=>{const s=x&&String(x).trim(),l=s&&!isNaN(Number(s));if(e){const u=n.get(String(e));if(u)return u}return s&&!l?s:s||(e?String(e):"Unassigned")},m=e=>e&&f.get(String(e))||null,o=new Map,a=new Set;$.forEach(e=>{if(Number(e.Process_Id??e.process_id??e.Process_ID??e.processId??0)===1){const s=String(e.Sch_Id||e.Sch_Emp_Id||e.sch_id||e.taskDetails?.Sch_Id||""),l=String(e.Task_Id||e.taskDetails?.Task_Id||""),u=String(e.Emp_Id||"");if(s&&l&&u&&a.add(`${s}_${l}_${u}`),l&&u&&a.add(`${l}_${u}`),l&&a.add(`task_${l}`),e.Work_Dt){const w=Ne(e.Work_Dt);w&&(s&&l&&u&&o.set(`${s}_${l}_${u}`,w),l&&u&&o.set(`${l}_${u}`,w),l&&!o.has(`task_${l}`)&&o.set(`task_${l}`,w))}}});const d=new Set,S=new Set,y=new Set;M.forEach(e=>{const x=e.schStatus??e.Sch_Status??e.status;if(Number(x)===3||String(x??"").trim().toLowerCase()==="completed"){const l=String(e.schId??e.Sch_Id??e.id??e.Id??"").trim(),u=String(e.taskId??e.Task_Id??e.Task_Levl_Id??"").trim(),w=String(e.taskName??e.Task_Name??e.taskDetails?.Task_Name??"").trim().toLowerCase();l&&l!=="0"&&l!=="null"&&l!=="undefined"&&d.add(l),u&&u!=="0"&&u!=="null"&&u!=="undefined"&&S.add(u),w&&y.add(w)}});const I=e=>{const x=String(e.Sch_Id||e.Sch_Emp_Id||e.sch_id||e.taskDetails?.Sch_Id||"").trim(),s=String(e.Task_Id||e.taskDetails?.Task_Id||"").trim(),l=String(e.Task_Name||e.taskDetails?.Task_Name||"").trim().toLowerCase();if(x&&d.has(x)||s&&S.has(s)||l&&y.has(l))return!0;const u=e.Schedule_Sch_Status??e.Sch_Status??e.schStatus??e.taskDetails?.Sch_Status;return u!=null&&(Number(u)===3||String(u).trim().toLowerCase()==="completed")},J=e=>{const x=e.Project_Id||e.project_id||e.Project_ID||e.Sch_Project_Id||e.sch_project_id||e.taskDetails?.Project_Id||e.projectDetails?.Project_Id;if(x){const l=b.get(String(x));if(l)return l}const s=e.Project_Name||e.project_name||e.Project_NAME||e.Sch_Project_Name||e.sch_project_name||e.taskDetails?.Project_Name||e.projectDetails?.Project_Name;if(s){const l=String(s).trim().toLowerCase(),u=p.get(l);if(u)return u}return null},Q=e=>{const x=J(e);if(x)return we(x);const s=e.Project_Status??e.project_status??e.Project_ID_Status??e.taskDetails?.Project_Status??e.projectDetails?.Project_Status;if(s!=null&&!isNaN(Number(s))&&Number(s)===0)return!1;const l=e.IsActive??e.is_active??e.taskDetails?.IsActive??e.projectDetails?.IsActive;if(l!=null&&!isNaN(Number(l))&&Number(l)===0)return!1;const u=e.Del_Flag??e.del_flag??e.taskDetails?.Del_Flag??e.projectDetails?.Del_Flag;if(u===!0||String(u).toLowerCase()==="true")return!1;const w=e.statusText??e.taskDetails?.statusText??e.projectDetails?.statusText;return!(w&&String(w).trim().toLowerCase()==="inactive")},V=e=>{const x=J(e);if(x){const u=x.Project_Name||x.project_name||x.Name;if(u)return String(u).trim()}const s=e.Project_Name||e.project_name||e.taskDetails?.Project_Name;if(s&&String(s).trim()!==""&&!String(s).startsWith("Project "))return String(s).trim();const l=e.Project_Id||e.project_id||e.taskDetails?.Project_Id;return s||(l?`Project ${l}`:"Unassigned Project")};return D.forEach(e=>{const x=Ne(e.Task_Assign_dt);if(!x)return;const s=`${x}_${e.Task_Id}_${e.Emp_Id}`,l=Je[Number(e.Invovled_Stat??0)]??Je[0],u=m(e.Task_Type_Id)||m(e.taskDetails?.Task_Type_Id),w=String(e.Sch_Id||e.Sch_Emp_Id||e.sch_id||""),T=String(e.Task_Id||""),P=String(e.Emp_Id||""),O=o.get(`${w}_${T}_${P}`)||o.get(`${T}_${P}`)||o.get(`task_${T}`)||null,X=a.has(`${w}_${T}_${P}`)||a.has(`${T}_${P}`)||a.has(`task_${T}`)||!!O,oe=Q(e),W=I(e);r.set(s,{date:x,schId:w,project:V(e),taskId:e.Task_Id,empId:e.Emp_Id,taskName:e.Task_Name||`Task ${e.Task_Id}`,taskType:u||e.Task_Type||e.taskDetails?.Task_Type||"Development",employee:h(e.Emp_Id,e.Emp_Name),assignedStart:ke(e.Sch_Time),assignedEnd:ke(e.EN_Time),assignedStatus:l.label,executedStart:"-",executedEnd:"-",executedDuration:"-",executedStatus:"-",rawActualCompletedDate:O,hasProcess1:X,isProjectActive:oe,isScheduleCompleted:W})}),$.forEach(e=>{const x=Ne(e.Work_Dt);if(!x)return;const s=`${x}_${e.Task_Id}_${e.Emp_Id}`,l=pt(e.Work_Status),u=ke(e.Start_Time||e.Sch_Est_Start_Time),w=ke(e.End_Time||e.Sch_Est_End_Time),T=m(e.Task_Type_Id)||m(e.taskDetails?.Task_Type_Id),P=String(e.Sch_Id||e.Sch_Emp_Id||e.sch_id||e.taskDetails?.Sch_Id||""),O=String(e.Task_Id||e.taskDetails?.Task_Id||""),X=String(e.Emp_Id||""),oe=Number(e.Process_Id??e.process_id??e.Process_ID??e.processId??0),W=o.get(`${P}_${O}_${X}`)||o.get(`${O}_${X}`)||o.get(`task_${O}`)||null,E=oe===1||a.has(`${P}_${O}_${X}`)||a.has(`${O}_${X}`)||a.has(`task_${O}`)||!!W,ve=Q(e),te=I(e);if(r.has(s)){const F=r.get(s);F.executedStart=u,F.executedEnd=w,F.executedDuration=Re(u,w),F.executedStatus=l.label,T&&(F.taskType=T),W&&(F.rawActualCompletedDate=W),F.hasProcess1=F.hasProcess1||E,F.isProjectActive===void 0&&(F.isProjectActive=ve),F.isScheduleCompleted=F.isScheduleCompleted||te}else r.set(s,{date:x,schId:P,project:V(e),taskId:e.Task_Id,empId:e.Emp_Id,taskName:e.Task_Name||e.taskDetails?.Task_Name||`Task ${e.Task_Id}`,taskType:T||e.Task_Type||e.taskDetails?.Task_Type||"Development",employee:h(e.Emp_Id,e.Emp_Name),assignedStart:"-",assignedEnd:"-",assignedStatus:"-",executedStart:u,executedEnd:w,executedDuration:Re(u,w),executedStatus:l.label,rawActualCompletedDate:W,hasProcess1:E,isProjectActive:ve,isScheduleCompleted:te})}),Array.from(r.values())},[D,$,ee,R,L,M]),B=C.useMemo(()=>{const r=new Map;return L.forEach(n=>{const f=n.Project_Name||n.project_name,b=we(n)?1:0;f&&(r.set(String(f).trim(),b),r.set(String(f).trim().toLowerCase(),b));const p=n.Project_Id??n.project_id??n.Id;p!=null&&r.set(String(p),b)}),r},[L]),qe=C.useCallback(()=>{let r=[...z];const{projectStatus:n,from:f,to:b,project:p,taskType:h,task:m,employee:o}=g;if(n&&n!=="ALL"&&(r=r.filter(a=>{let d=a.isProjectActive;if(d===void 0&&a.project){const S=B.get(a.project)??B.get(String(a.project).trim().toLowerCase());S!==void 0&&(d=S!==0)}return d===void 0?!0:n==="ACTIVE"?d===!0:d===!1})),f&&(r=r.filter(a=>!a.date||a.date==="-"||a.date>=f)),b&&(r=r.filter(a=>!a.date||a.date==="-"||a.date<=b)),p&&p.length>0){const a=new Set(p.map(d=>String(d).trim().toLowerCase()));r=r.filter(d=>d.project&&a.has(String(d.project).trim().toLowerCase()))}if(h&&h.length>0){const a=new Set(h.map(d=>String(d).trim().toLowerCase()));r=r.filter(d=>d.taskType&&a.has(String(d.taskType).trim().toLowerCase()))}if(m&&m.length>0){const a=new Set(m.map(d=>String(d).trim().toLowerCase()));r=r.filter(d=>d.taskName&&a.has(String(d.taskName).trim().toLowerCase()))}if(o&&o.length>0){const a=new Set(o.map(d=>String(d).trim().toLowerCase()));r=r.filter(d=>d.employee&&a.has(String(d.employee).trim().toLowerCase()))}return r},[z,g,B]),Ye=C.useMemo(()=>{let r=[...z];const{from:n,to:f,employee:b,taskType:p,task:h,projectStatus:m}=A;m&&m!=="ALL"&&(r=r.filter(a=>{let d=a.isProjectActive;if(d===void 0&&a.project){const S=B.get(a.project)??B.get(String(a.project).trim().toLowerCase());S!==void 0&&(d=S!==0)}return d===void 0?!0:m==="ACTIVE"?d===!0:d===!1})),n&&(r=r.filter(a=>!a.date||a.date==="-"||a.date>=n)),f&&(r=r.filter(a=>!a.date||a.date==="-"||a.date<=f)),b&&b.length>0&&(r=r.filter(a=>a.employee&&b.includes(a.employee))),p&&p.length>0&&(r=r.filter(a=>a.taskType&&p.includes(a.taskType))),h&&h.length>0&&(r=r.filter(a=>a.taskName&&h.includes(a.taskName)));const o=new Set;return r.forEach(a=>{a.project&&o.add(a.project)}),L.length>0&&b.length===0&&h.length===0&&p.length===0&&L.forEach(a=>{const d=we(a);if(m==="ACTIVE"&&!d||m==="INACTIVE"&&d)return;const S=a.Project_Name||a.project_name;S&&o.add(S)}),Array.from(o).sort()},[L,z,A,B]),Xe=C.useMemo(()=>{let r=[...z];const{from:n,to:f,project:b,employee:p,task:h}=A;n&&(r=r.filter(o=>!o.date||o.date==="-"||o.date>=n)),f&&(r=r.filter(o=>!o.date||o.date==="-"||o.date<=f)),b&&b.length>0&&(r=r.filter(o=>o.project&&b.includes(o.project))),p&&p.length>0&&(r=r.filter(o=>o.employee&&p.includes(o.employee))),h&&h.length>0&&(r=r.filter(o=>o.taskName&&h.includes(o.taskName)));const m=new Set;return r.forEach(o=>{o.taskType&&o.taskType!=="-"&&m.add(o.taskType)}),Array.from(m).sort()},[z,A]),Ke=C.useMemo(()=>{let r=[...z];const{from:n,to:f,project:b,employee:p,taskType:h}=A;n&&(r=r.filter(o=>!o.date||o.date==="-"||o.date>=n)),f&&(r=r.filter(o=>!o.date||o.date==="-"||o.date<=f)),b&&b.length>0&&(r=r.filter(o=>o.project&&b.includes(o.project))),p&&p.length>0&&(r=r.filter(o=>o.employee&&p.includes(o.employee))),h&&h.length>0&&(r=r.filter(o=>o.taskType&&h.includes(o.taskType)));const m=new Set;return r.forEach(o=>{o.taskName&&m.add(o.taskName)}),Array.from(m).sort()},[z,A]),Qe=C.useMemo(()=>{let r=[...z];const{from:n,to:f,project:b,taskType:p,task:h}=A;n&&(r=r.filter(a=>!a.date||a.date==="-"||a.date>=n)),f&&(r=r.filter(a=>!a.date||a.date==="-"||a.date<=f)),b&&b.length>0&&(r=r.filter(a=>a.project&&b.includes(a.project))),p&&p.length>0&&(r=r.filter(a=>a.taskType&&p.includes(a.taskType))),h&&h.length>0&&(r=r.filter(a=>a.taskName&&h.includes(a.taskName)));const m=new Set;R&&R.length>0&&R.forEach(a=>{const d=a.Emp_Name||a.emp_name||a.Emp_Name_Full||a.Name;d&&We(d)&&m.add(String(d).trim())});const o=new Set;return r.forEach(a=>{const d=a.employee?String(a.employee).trim():"";d&&We(d)&&(m.size===0||m.has(d))&&o.add(d)}),m.size>0&&b.length===0&&h.length===0&&p.length===0&&m.forEach(a=>o.add(a)),Array.from(o).sort()},[R,z,A]),Pe=()=>{le({...g}),K(!0)},Ee=()=>{K(!1)},Fe=()=>{Se({...A}),j(null)},He=()=>{const r={projectStatus:"ACTIVE",from:"",to:"",project:[],taskType:[],task:[],employee:[]};le(r),Se(r),j(null)},pe=(r,n)=>{le(f=>({...f,[r]:n}))},Me=()=>t.jsxs(st,{display:"flex",flexDirection:"column",gap:2,sx:{pt:.5},children:[t.jsx(me,{size:"small",fullWidth:!0,children:t.jsx(ue,{multiple:!0,value:A.project,onChange:r=>{const n=r.target.value,f=Array.isArray(n)?n:typeof n=="string"&&n?n.split(","):[];pe("project",f)},allOptionLabel:"All Projects",allOptionValue:"",searchPlaceholder:"Search projects...",options:Ye.map(r=>({value:r,label:r}))})}),t.jsx(me,{size:"small",fullWidth:!0,children:t.jsx(ue,{multiple:!0,value:A.taskType,onChange:r=>{const n=r.target.value,f=Array.isArray(n)?n:typeof n=="string"&&n?n.split(","):[];pe("taskType",f)},allOptionLabel:"All Task Types",allOptionValue:"",searchPlaceholder:"Search task types...",options:Xe.map(r=>({value:r,label:r}))})}),t.jsx(me,{size:"small",fullWidth:!0,children:t.jsx(ue,{multiple:!0,value:A.task,onChange:r=>{const n=r.target.value,f=Array.isArray(n)?n:typeof n=="string"&&n?n.split(","):[];pe("task",f)},allOptionLabel:"All Tasks",allOptionValue:"",searchPlaceholder:"Search tasks...",options:Ke.map(r=>({value:r,label:r}))})}),t.jsx(me,{size:"small",fullWidth:!0,children:t.jsx(ue,{multiple:!0,value:A.employee,onChange:r=>{const n=r.target.value,f=Array.isArray(n)?n:typeof n=="string"&&n?n.split(","):[];pe("employee",f)},allOptionLabel:"All Employees",allOptionValue:"",searchPlaceholder:"Search employees...",options:Qe.map(r=>({value:r,label:r}))})}),t.jsx(me,{size:"small",fullWidth:!0,children:t.jsx(ue,{value:A.projectStatus,onChange:r=>pe("projectStatus",r.target.value),allOptionLabel:"All Status",allOptionValue:"ALL",searchPlaceholder:"Search status...",options:[{value:"ACTIVE",label:"Active Only"},{value:"INACTIVE",label:"Inactive Only"}]})})]}),Le=(r,n)=>{ce({visible:!0,text:n.split("||").filter(Boolean).join(", "),x:r.clientX+12,y:r.clientY+12})},$e=()=>{ce(r=>({...r,visible:!1}))},Ze=()=>{const r=qe(),n=new Map,f=new Map,b=new Map;if(M.forEach(p=>{const h=p.schEndDate||p.Sch_End_Date||p.sch_End_Date||p.Est_Sch_End_Date;if(!h)return;const m=Ne(h);if(!m)return;const o=String(p.Task_Id||p.taskDetails?.Task_Id||p.Task_Levl_Id||""),a=String(p.Sch_Id||p.Id||""),d=String(p.Task_Name||p.taskDetails?.Task_Name||"").toLowerCase();if(o){const S=n.get(o);(!S||m>S)&&n.set(o,m)}if(a){const S=f.get(a);(!S||m>S)&&f.set(a,m)}if(d){const S=b.get(d);(!S||m>S)&&b.set(d,m)}}),se){const p=r.filter(y=>y.project===se),h=Ge(p),m={};h.forEach(y=>{m[y.taskName]||(m[y.taskName]=[]),m[y.taskName].push(y)});const a=Object.entries(m).map(([y,I])=>{const J=new Set(I.map(T=>T.employee)),Q=J.size,V=Array.from(J).join("||"),e=ne(I),x={};I.forEach(T=>{x[T.employee]||(x[T.employee]=[]),x[T.employee].push(T)});let s=0,l=0,u=0;Object.values(x).forEach(T=>{const P=ne(T);s+=parseFloat(P.completedHrs)||0,l+=parseFloat(P.delayHrs)||0,u+=parseFloat(P.workingHrs)||0}),e.completedHrs=s.toFixed(1)+"h",e.delayHrs=l.toFixed(1)+"h",e.workingHrs=u.toFixed(1)+"h",e.workingDelta=Ae(e.assignHrs,e.workingHrs);const w=e.actualCompletedDate;return{taskName:y,taskType:I[0].taskType,empCount:Q,empNames:V,assignHrs:e.assignHrs,workingHrs:e.workingHrs,workingDelta:e.workingDelta,progress:e.progress,actualCompletedDate:w,empGroups:x}}),d=[{Field_Name:"taskName",ColumnHeader:"Task Name",Fied_Data:"string",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:y})=>t.jsx("span",{className:"task-title",children:y.taskName})},{Field_Name:"taskType",ColumnHeader:"Task Type",Fied_Data:"string",isVisible:1,align:"left"},{Field_Name:"empCount",ColumnHeader:"Work Employees",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:y})=>t.jsxs("span",{className:"indicator-badge team-badge",onMouseMove:I=>Le(I,y.empNames),onMouseLeave:$e,children:[t.jsx(rt,{fontSize:"small",style:{fontSize:"16px",marginRight:"4px"}})," ",y.empCount]})},{Field_Name:"assignHrs",ColumnHeader:"Assign Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:y})=>t.jsx("div",{style:{minWidth:"110px"},children:y.assignHrs})},{Field_Name:"workingHrs",ColumnHeader:"Total Working Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:y})=>t.jsx("div",{style:{minWidth:"60px"},children:De(y.workingHrs)})},{Field_Name:"workingDelta",ColumnHeader:"Delay",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:y})=>t.jsx("div",{style:{minWidth:"60px"},children:Ie(y.workingDelta)})},{Field_Name:"progress",ColumnHeader:"Progress",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:y})=>t.jsxs("div",{className:"progress-cell-container",children:[t.jsxs("span",{className:"progress-pct",children:[y.progress,"%"]}),t.jsx("div",{className:"progress-bar-track",children:t.jsx("div",{className:"progress-bar-fill",style:{width:`${y.progress}%`}})})]})},{Field_Name:"actualCompletedDate",ColumnHeader:"Actual Completed Date",Fied_Data:"string",isVisible:1,align:"left"}],S=({row:y})=>{const I=y.empGroups;return t.jsx("div",{className:"my-expand-wrapper",children:t.jsx("table",{children:t.jsx("tbody",{children:Object.entries(I).map(([J,Q])=>{const V=ne(Q);return t.jsxs("tr",{className:"detail-row",children:[t.jsx("td",{className:"border-r border-gray-300",style:{padding:"12px"}}),t.jsx("td",{className:"border-r border-gray-300",style:{padding:"12px"}}),t.jsx("td",{className:"border-r border-gray-300",style:{padding:"12px"}}),t.jsx("td",{className:"border-r border-gray-300",style:{padding:"12px",fontSize:"14px"},children:t.jsx("div",{style:{display:"inline-block",textAlign:"left"},children:t.jsxs("strong",{style:{color:"var(--text-main)"},children:[t.jsx(at,{fontSize:"small",style:{marginRight:"6px",color:"var(--text-light)",opacity:.7,fontSize:"16px",verticalAlign:"middle"}}),J]})})}),t.jsx("td",{className:"border-r border-gray-300",align:"center",style:{padding:"12px",fontSize:"14px"},children:V.assignHrs}),t.jsx("td",{className:"border-r border-gray-300",align:"center",style:{padding:"12px",fontSize:"14px"},children:De(V.workingHrs)}),t.jsx("td",{className:"border-r border-gray-300",align:"center",style:{padding:"12px",fontSize:"14px"},children:Ie(V.workingDelta)}),t.jsx("td",{className:"border-r border-gray-300",align:"center",style:{padding:"12px",fontSize:"14px"},children:t.jsxs("div",{className:"progress-cell-container",children:[t.jsxs("span",{className:"progress-pct",children:[V.progress,"%"]}),t.jsx("div",{className:"progress-bar-track",children:t.jsx("div",{className:"progress-bar-fill",style:{width:`${V.progress}%`}})})]})}),t.jsx("td",{className:"border-r border-gray-300",align:"left",style:{padding:"12px",fontSize:"14px"},children:V.actualCompletedDate})]},J)})})})})};return t.jsx(t.Fragment,{children:t.jsx("div",{className:"table-wrapper",children:t.jsx(Ve,{headerTitle:t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[t.jsxs("button",{className:"back-btn",onClick:()=>j(null),title:"Back",children:[t.jsx(et,{fontSize:"small",style:{fontSize:"18px"}})," Back"]}),t.jsx("span",{style:{fontWeight:700,color:"#1c2d45",fontSize:"1.25rem"},children:se})]}),headerActions:t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"},children:[t.jsxs("div",{className:"filter-date-badge-wrapper",id:"innerPillsBar",children:[(g.from||g.to)&&t.jsxs("div",{className:"filter-badge date-badge",children:[t.jsx("i",{className:"fa-regular fa-calendar"}),t.jsxs("span",{children:[g.from?re(g.from):"Start"," -"," ",g.to?re(g.to):"End"]})]}),g.projectStatus&&g.projectStatus!=="ALL"&&t.jsxs("div",{className:"filter-badge status-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Status:"}),t.jsx("span",{children:g.projectStatus==="ACTIVE"?"Active Only":"Inactive Only"})]}),g.project&&g.project.length>0&&t.jsxs("div",{className:"filter-badge project-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Proj:"}),t.jsx("span",{children:g.project.join(", ")})]}),g.taskType&&g.taskType.length>0&&t.jsxs("div",{className:"filter-badge task-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Type:"}),t.jsx("span",{children:g.taskType.join(", ")})]}),g.task&&g.task.length>0&&t.jsxs("div",{className:"filter-badge task-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Task:"}),t.jsx("span",{children:g.task.join(", ")})]}),g.employee&&g.employee.length>0&&t.jsxs("div",{className:"filter-badge resource-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Resource:"}),t.jsx("span",{children:g.employee.join(", ")})]})]}),t.jsx(Oe,{showTopButton:!0,useSlider:!0,dialogOpen:_e,onOpenDialog:Pe,onCloseDialog:Ee,onSearch:Fe,onReset:He,closeOnSearch:!1,children:Me()})]}),dataArray:a,columns:d,isExpendable:!0,expandableComp:S,disablePagination:!1,tableMaxHeight:700,CellSize:"medium",bodyFontSizePx:14,headerFontSizePx:15,PDFPrintOption:!1,ExcelPrintOption:!1,emptyMessage:"No tasks match the filters for this project.",tableProps:{sx:{width:"100%",minWidth:"100%"}}},`project-progress-detail-table-${se}`)})})}else{const p=Ge(r),h={},m=new Map;L.forEach(s=>{const l=s.Project_Name||s.project_name||s.Name;if(l){const u=String(l).trim();m.set(u.toLowerCase(),u)}});const{projectStatus:o,project:a,taskType:d,task:S,employee:y,from:I,to:J}=g,Q=d&&d.length>0||S&&S.length>0||y&&y.length>0||!!I||!!J;L.forEach(s=>{const l=s.Project_Name||s.project_name||s.Name;if(!l)return;const u=String(l).trim();if(!u)return;const w=we(s);o==="ACTIVE"&&!w||o==="INACTIVE"&&w||a&&a.length>0&&!a.includes(u)||Q||h[u]||(h[u]=[])}),p.forEach(s=>{if(!s.project)return;const l=m.get(String(s.project).trim().toLowerCase())||s.project;h[l]||(h[l]=[]),h[l].push(s)});const e=Object.entries(h).sort((s,l)=>s[0].localeCompare(l[0])).map(([s,l])=>{const u=new Set(l.map(H=>H.taskName)).size,w=new Set(l.map(H=>H.employee)),T=w.size,P=Array.from(w).join("||");let O=0,X=0,oe=0;const W={};l.forEach(H=>{W[H.taskName]||(W[H.taskName]=[]),W[H.taskName].push(H)}),Object.values(W).forEach(H=>{const Z={};H.forEach(ie=>{Z[ie.employee]||(Z[ie.employee]=[]),Z[ie.employee].push(ie)}),Object.values(Z).forEach(ie=>{const Te=ne(ie);O+=parseFloat(Te.completedHrs)||0,X+=parseFloat(Te.delayHrs)||0,oe+=parseFloat(Te.workingHrs)||0})});const E=ne(l);E.completedHrs=O.toFixed(1)+"h",E.delayHrs=X.toFixed(1)+"h",E.workingHrs=oe.toFixed(1)+"h",E.workingDelta=Ae(E.assignHrs,E.workingHrs);const ve=E.actualCompletedDate,te=[];Object.values(W).forEach(H=>{const Z=ne(H);te.push(Z.progress)});const F=te.length>0?Math.round(te.reduce((H,Z)=>H+Z,0)/te.length):E.progress;return{project:s,taskCount:u,empCount:T,empNames:P,assignHrs:E.assignHrs,workingHrs:E.workingHrs,workingDelta:E.workingDelta,progress:F,actualCompletedDate:ve,rawData:l}}),x=[{Field_Name:"project",ColumnHeader:"Project Name",Fied_Data:"string",isVisible:1,align:"left",isCustomCell:!0,Cell:({row:s})=>t.jsx("strong",{className:"proj-title",children:s.project})},{Field_Name:"taskCount",ColumnHeader:"Tasks",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsx("span",{className:"indicator-badge",children:s.taskCount})},{Field_Name:"empCount",ColumnHeader:"Work Employees",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsxs("span",{className:"indicator-badge team-badge",onMouseMove:l=>Le(l,s.empNames),onMouseLeave:$e,children:[t.jsx(tt,{fontSize:"small",style:{fontSize:"16px",marginRight:"4px"}})," ",s.empCount]})},{Field_Name:"assignHrs",ColumnHeader:"Assign Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsx("div",{style:{minWidth:"110px"},children:s.assignHrs})},{Field_Name:"workingHrs",ColumnHeader:"Total Working Hours",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsx("div",{style:{minWidth:"60px"},children:De(s.workingHrs)})},{Field_Name:"workingDelta",ColumnHeader:"Delay",Fied_Data:"string",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsx("div",{style:{minWidth:"60px"},children:Ie(s.workingDelta)})},{Field_Name:"progress",ColumnHeader:"Progress",Fied_Data:"number",isVisible:1,align:"center",isCustomCell:!0,Cell:({row:s})=>t.jsxs("div",{className:"progress-cell-container",children:[t.jsxs("span",{className:"progress-pct",children:[s.progress,"%"]}),t.jsx("div",{className:"progress-bar-track",children:t.jsx("div",{className:"progress-bar-fill",style:{width:`${s.progress}%`}})})]})},{Field_Name:"actualCompletedDate",ColumnHeader:"Actual Completed Date",Fied_Data:"string",isVisible:1,align:"left"}];return t.jsx(t.Fragment,{children:t.jsx("div",{className:"table-wrapper",children:t.jsx(Ve,{headerTitle:"Project Progress",headerActions:t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"},children:[t.jsxs("div",{className:"filter-date-badge-wrapper",id:"innerPillsBar",children:[(g.from||g.to)&&t.jsxs("div",{className:"filter-badge date-badge",children:[t.jsx("i",{className:"fa-regular fa-calendar"}),t.jsxs("span",{children:[g.from?re(g.from):"Start"," -"," ",g.to?re(g.to):"End"]})]}),g.projectStatus&&g.projectStatus!=="ALL"&&t.jsxs("div",{className:"filter-badge status-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Status:"}),t.jsx("span",{children:g.projectStatus==="ACTIVE"?"Active Only":"Inactive Only"})]}),g.project&&g.project.length>0&&t.jsxs("div",{className:"filter-badge project-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Proj:"}),t.jsx("span",{children:g.project.join(", ")})]}),g.taskType&&g.taskType.length>0&&t.jsxs("div",{className:"filter-badge task-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Type:"}),t.jsx("span",{children:g.taskType.join(", ")})]}),g.task&&g.task.length>0&&t.jsxs("div",{className:"filter-badge task-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Task:"}),t.jsx("span",{children:g.task.join(", ")})]}),g.employee&&g.employee.length>0&&t.jsxs("div",{className:"filter-badge resource-badge",children:[t.jsx("span",{className:"badge-lbl",children:"Resource:"}),t.jsx("span",{children:g.employee.join(", ")})]})]}),t.jsx(Oe,{showTopButton:!0,useSlider:!0,dialogOpen:_e,onOpenDialog:Pe,onCloseDialog:Ee,onSearch:Fe,onReset:He,closeOnSearch:!1,children:Me()})]}),dataArray:e,columns:x,onClickFun:s=>j(s.project),disablePagination:!1,tableMaxHeight:700,CellSize:"medium",bodyFontSizePx:14,headerFontSizePx:15,PDFPrintOption:!1,ExcelPrintOption:!1,emptyMessage:"No matching records found. Try adjusting filters or click Reset.",tableProps:{sx:{width:"100%",minWidth:"100%"}}},"project-progress-main-table")})})}};return t.jsxs("div",{className:"project-progress-wrapper",children:[t.jsx("style",{children:dt}),t.jsx("div",{className:"dashboard-container",children:k?t.jsx("div",{style:{textAlign:"center",margin:"20px"},children:"Loading..."}):t.jsx("div",{className:"card-panel",children:Ze()})}),t.jsxs("div",{className:"hover-tooltip-card",style:{display:G.visible?"block":"none",left:G.x,top:G.y},children:[t.jsx("div",{className:"tooltip-title",children:"Assigned Resources:"}),t.jsx("p",{children:G.text})]})]})}export{yt as default};
