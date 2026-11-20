import{j as s,B as G,T as q,n as st,b as Ee,bn as at,bo as rt,a0 as Rt,I as Ot,a2 as Vt,t as L,$ as Bt,as as Yt}from"./mui-C2PSBjIJ.js";import{r as _}from"./vendor-BIUH9fz7.js";import{u as Ht,J as nt,X as Gt,Y as qt,Z as Xt,W as Kt,L as Ut,$ as Jt,R as ot,T as lt,S as de,D as Qt}from"./index-z4HibTrx.js";import{u as pe,w as it}from"./xlsx-DMLx_f5p.js";const Zt=`
    :root {
      --primary-color: #1976d2;
      --bg-color: #f5f5f5;
      --card-bg: #ffffff;
      --text-main: rgba(0, 0, 0, 0.87);
      --border-color: #e0e0e0;
      --header-bg: #f5f5f5;
      --assigned-bg: #e3f2fd;
      --executed-bg: #e8f5e9;
      --completed-color: #d4edda;
      --inprocess-color: #cce5ff;
      --pending-color: #fff3cd;
    }

    .container {
      width: 100%;
      max-width: 100%;
      margin: 0;
    }

    .header-panel {
      padding: 8px 0 16px 0;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-title svg {
      fill: var(--primary-color);
      width: 24px;
      height: 24px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .reset-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background-color: transparent;
      color: #333;
      border: 1.5px solid #ccc;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      height: 36px;
      transition: all 0.2s;
    }

    .reset-btn:hover {
      background-color: #f5f5f5;
      border-color: #bbb;
    }

    .reset-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .summary-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-box {
      flex: 1;
      background: var(--card-bg);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .stat-title {
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 500;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
    }

    .stat-box.blue .stat-value { color: #1976d2; }
    .stat-box.green .stat-value { color: #4caf50; }
    .stat-box.orange .stat-value { color: #ff9800; }
    .stat-box.purple .stat-value { color: #9c27b0; }
    .stat-box.teal .stat-value { color: #009688; }

    .table-container {
      background: var(--card-bg);
      border-radius: 4px;
      box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
      overflow-x: auto;
      max-height: 700px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    th, td {
      padding: 6px 16px;
      border-bottom: 1px solid rgba(224, 224, 224, 1);
    }

    th {
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    
    tr:nth-child(2) th {
      top: 36px;
      z-index: 1;
    }

    tbody tr:hover {
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    /* Task Name column - full width, no truncation */
    .task-name-cell {
      white-space: normal !important;
      word-break: break-word;
      min-width: 150px;
      max-width: 300px;
    }

    .bg-default { background-color: var(--header-bg); }
    .bg-assigned { background-color: var(--assigned-bg); border-left: 2px solid #ccc; }
    .bg-executed { background-color: var(--executed-bg); border-left: 2px solid #ccc; }
    
    .border-left { border-left: 2px solid #ccc; }
    .text-center { text-align: center; }

    .chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      padding: 0 8px;
      border-radius: 16px;
      font-size: 0.7rem;
      font-weight: bold;
      white-space: nowrap;
    }

    .chip-new { background-color: #ffc107; color: #000; }
    .chip-progress { background-color: #1976d2; color: #fff; }
    .chip-completed { background-color: #4caf50; color: #fff; }
    .chip-pending { background-color: #ff9800; color: #fff; }

    .text-truncate {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .work-details {
      max-width: 300px;
      white-space: pre-wrap;
    }

    .modal {
      display: none; 
      position: fixed; 
      z-index: 1000; 
      left: 0;
      top: 0;
      width: 100%; 
      height: 100%; 
      overflow: auto; 
      background-color: rgba(0,0,0,0.5); 
    }
    
    .modal.open {
      display: block;
    }

    .modal-content {
      background-color: var(--card-bg);
      margin: 5% auto; 
      padding: 24px;
      border-radius: 8px;
      width: 95%; 
      max-width: 1200px;
      box-shadow: 0px 4px 20px rgba(0,0,0,0.2);
      position: relative;
    }

    .close-btn {
      color: #999;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      line-height: 1;
    }

    .close-btn:hover,
    .close-btn:focus {
      color: #333;
      text-decoration: none;
    }

    .modal-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    .modal-table th, .modal-table td {
      border: 1px solid var(--border-color);
      padding: 10px 16px;
      text-align: left;
    }

    .modal-table th {
      background-color: var(--header-bg);
      font-weight: 600;
    }

    .dynamic-group-row {
      background-color: #f0f8ff !important;
      font-weight: 500;
    }

    .calendar-container {
      background-color: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0px 4px 20px rgba(0,0,0,0.05);
      padding: 16px;
      margin-bottom: 24px;
      overflow-x: auto;
    }

    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      min-width: 900px;
      text-align: center;
      font-weight: 600;
      color: #757575;
      margin-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      min-width: 900px;
      gap: 8px;
      min-height: 400px;
    }

    .calendar-cell {
      border: 1px solid var(--border-color);
      border-radius: 4px;
      min-height: 100px;
      min-width: 0;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background-color: #fafafa;
    }

    .calendar-cell.empty {
      background-color: #f5f5f5;
    }

    .calendar-cell .date-label {
      font-weight: bold;
      text-align: right;
      font-size: 0.85rem;
      color: var(--text-main);
      margin-bottom: 4px;
      white-space: nowrap;
    }

    .calendar-task {
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 4px;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      background-color: var(--primary-color);
    }
    
    .calendar-task.completed { background-color: var(--completed-color); color: #1e4620; }
    .calendar-task.in-progress { background-color: var(--inprocess-color); color: #004085; }
    .calendar-task.pending { background-color: var(--pending-color); color: #856404; }

    .calendar-list-view {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .calendar-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: #fafafa;
    }
`,T=b=>{if(!b)return"";if(typeof b=="string"){const g=b.trim();if(g.length>=10&&/^\d{4}-\d{2}-\d{2}/.test(g))return g.slice(0,10);if(/^\d{2}-\d{2}-\d{4}/.test(g)){const y=g.slice(0,10).split("-");return`${y[2]}-${y[1]}-${y[0]}`}if(/^\d{2}\/\d{2}\/\d{4}/.test(g)){const y=g.slice(0,10).split("/");return`${y[2]}-${y[1]}-${y[0]}`}}try{const g=typeof b=="string"?new Date(b):b;if(isNaN(g.getTime()))return"";const y=g.getFullYear(),S=String(g.getMonth()+1).padStart(2,"0"),v=String(g.getDate()).padStart(2,"0");return`${y}-${S}-${v}`}catch{return""}},ne=b=>{if(!b)return"";const g=T(b);if(!g)return b;const y=g.split("-");return y.length===3?`${y[2]}-${y[1]}-${y[0]}`:b},ye=b=>{if(!b)return new Date;const y=T(b).split("-");return y.length===3?new Date(parseInt(y[0],10),parseInt(y[1],10)-1,parseInt(y[2],10)):new Date(b)},ct=(b,g)=>{const y=new Map;for(const S of b){let v="";if(g==="assigned"){const C=S.Task_Assign_dt||S.Schedule_Sch_Date||S.Sch_Date||S.Schedule_Sch_Start_Date?T(S.Task_Assign_dt||S.Schedule_Sch_Date||S.Sch_Date||S.Schedule_Sch_Start_Date):"",z=S.Sch_Id!=null?String(S.Sch_Id).trim():"",je=S.Task_Id!=null?String(S.Task_Id).trim():"",ue=S.Emp_Id!=null?String(S.Emp_Id).trim():"",we=S.Sch_Time!=null?String(S.Sch_Time).trim():"";v=z!==""&&z!=="0"&&z!=="null"&&z!=="undefined"?`${z}_${je}_${ue}_${C}`:`${je}_${ue}_${C}_${we}`}else v=S.Work_Id?.toString()||`${S.Task_Id}_${S.Emp_Id}_${S.Work_Dt||""}`;y.has(v)||y.set(v,S)}return Array.from(y.values())},es=b=>{if(!b||typeof b!="string")return null;try{if(b.includes("1970-01-01")||b.includes("1900-01-01")){const g=new Date(b);return isNaN(g.getTime())?null:{hours:g.getUTCHours(),minutes:g.getUTCMinutes(),seconds:g.getUTCSeconds()}}}catch{}return null},se=b=>{if(!b)return"--:--";try{const g=es(b);if(g){const S=g.hours>=12?"PM":"AM";return`${g.hours%12||12}:${String(g.minutes).padStart(2,"0")} ${S}`}if(typeof b=="string"&&b.includes(":")){const[S,v]=b.split(":"),C=parseInt(S,10),z=C>=12?"PM":"AM";return`${C%12||12}:${(v??"00").padStart(2,"0")} ${z}`}const y=new Date(b);if(!isNaN(y.getTime()))return y.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!0})}catch{}return"--:--"},ze=b=>{if(!b||b==="-"||b==="--:--"||b==="—"||b==="--")return null;try{const g=String(b).trim(),y=g.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(AM|PM)$/i);if(y){let v=parseInt(y[1],10);const C=y[2]?parseInt(y[2],10):0,z=y[3].toUpperCase();return z==="PM"&&v<12&&(v+=12),z==="AM"&&v===12&&(v=0),{hours:v,minutes:C}}let S=g.match(/T(\d{2}):(\d{2}):(\d{2})/);return S||(S=g.match(/(\d{2}):(\d{2}):(\d{2})/)),S||(S=g.match(/(\d{1,2}):(\d{2})/)),S&&S[1]&&S[2]?{hours:parseInt(S[1],10),minutes:parseInt(S[2],10)}:null}catch{return null}},Ce=b=>{const g=ze(b);return g?g.hours*60+g.minutes:9999},Re=(b,g)=>{const y=ze(b),S=ze(g);if(!y||!S)return null;const v=y.hours*60+y.minutes;let C=S.hours*60+S.minutes;return C<v&&(C+=1440),C<=v?null:{start:v,end:C}},dt=b=>{if(b.length<=1)return b;const g=[...b].sort((v,C)=>v.start-C.start||v.end-C.end),y=[];let S=g[0];for(let v=1;v<g.length;v++){const C=g[v];C.start<=S.end?S={start:S.start,end:Math.max(S.end,C.end)}:(y.push(S),S=C)}return y.push(S),y},_e=(b,g)=>b==null||g==null?!1:b==="ALL"||g==="ALL"?!0:Number(b)===Number(g),ts=(b,g)=>{const y=Re(b,g);return y?y.end-y.start:0},Me=(b,g)=>{if(!b||!g||b==="-"||g==="-"||b==="--:--"||g==="--:--"||b==="—"||g==="—")return"-";try{const y=ts(b,g);if(y===0)return"-";const S=Math.floor(y/60),v=y%60;return S>0?`${S}h ${v>0?`${v}m`:""}`.trim():`${v}m`}catch{return"-"}},pt={0:{bg:"#ffc107",label:"New",color:"#000",class:"chip-new"},1:{bg:"#ffc107",label:"New",color:"#000",class:"chip-new"},2:{bg:"#1976d2",label:"In Progress",color:"#fff",class:"chip-progress"},3:{bg:"#4caf50",label:"Completed",color:"#fff",class:"chip-completed"}},ut=b=>{const g=String(b??"").toLowerCase();return g==="3"||g==="completed"?{bg:"#4caf50",label:"Completed",color:"#fff",class:"chip-completed"}:g==="2"||g==="pending"?{bg:"#ff9800",label:"Pending",color:"#fff",class:"chip-pending"}:g==="1"||g==="in progress"||g==="inprocess"?{bg:"#1976d2",label:"In Progress",color:"#fff",class:"chip-progress"}:{bg:"#9e9e9e",label:String(b??""),color:"#fff",class:"chip-pending"}},ht=b=>{if(!b)return"--";let g=b;try{const y=JSON.parse(b);typeof y=="string"&&(g=y)}catch{}return g.replace(/\\n/g,`
`)};let De=null;const os=()=>{const{token:b,currentCompany:g,isSwitchingCompany:y}=Ht(),[S,v]=_.useState(!0),[,C]=_.useState(!1),[z,je]=_.useState([]),[ue,we]=_.useState([]),[he,Oe]=_.useState("Day"),[P,Ve]=_.useState(""),[$e,Ae]=_.useState(""),[W,Pe]=_.useState(""),[R,Te]=_.useState(""),[ke,Be]=_.useState(()=>T(new Date)),[ve,Ye]=_.useState(()=>T(new Date)),[me,He]=_.useState("table"),[ge,mt]=_.useState([]),[oe,gt]=_.useState([]),[Y,Ge]=_.useState(""),[U,qe]=_.useState(""),[M,Xe]=_.useState(""),[J,Ke]=_.useState(""),[O,Ue]=_.useState(()=>T(new Date)),[Q,Je]=_.useState(()=>T(new Date)),[N,Qe]=_.useState("Day"),[ft,We]=_.useState(!1),[te,xt]=_.useState(""),[Z,bt]=_.useState([]),[fe,St]=_.useState([]),[xe,yt]=_.useState([]),Fe=_.useCallback(e=>{if(!xe||xe.length===0)return!0;const o=e?.Project_Id??e?.project_id??e?.Project_ID??e?.Sch_Project_Id??e?.sch_project_id??e?.taskDetails?.Project_Id??e?.projectDetails?.Project_Id;if(o!=null&&o!==0&&o!==""&&o!=="0"){const n=xe.find(a=>Number(a.Project_Id)===Number(o));if(n){const a=n.Project_Status!==void 0?n.Project_Status:n.IsActive;if(a!=null)return Number(a)===1}}const r=e?.Project_Name??e?.project_name??e?.Project_NAME??e?.Sch_Project_Name??e?.sch_project_name??e?.taskDetails?.Project_Name??e?.projectDetails?.Project_Name;if(r){const n=String(r).trim().toLowerCase(),a=xe.find(l=>l.Project_Name&&l.Project_Name.trim().toLowerCase()===n);if(a){const l=a.Project_Status!==void 0?a.Project_Status:a.IsActive;if(l!=null)return Number(l)===1}}return e?.Project_Status!==void 0&&e?.Project_Status!==null?Number(e.Project_Status)===1:e?.Project_IsActive!==void 0&&e?.Project_IsActive!==null?Number(e.Project_IsActive)===1:e?.IsActive!==void 0&&e?.IsActive!==null?Number(e.IsActive)===1:!0},[xe]),[_t,Ne]=_.useState(!1),Ie=_.useCallback((e,o,r)=>{const n=T(o)||T(new Date),a=n?ye(n):new Date,l=new Date(a.getFullYear(),a.getMonth(),a.getDate());if(e==="Week"){const p=new Date(l);p.setDate(l.getDate()-l.getDay());const t=new Date(p);return t.setDate(p.getDate()+6),{fromDate:T(p),toDate:T(t)}}if(e==="Month"){const p=new Date(l.getFullYear(),l.getMonth(),1),t=new Date(l.getFullYear(),l.getMonth()+1,0);return{fromDate:T(p),toDate:T(t)}}if(e==="Over All")return{fromDate:"",toDate:""};const d=T(o)||T(new Date),h=T(r)||d;return{fromDate:d,toDate:h}},[]),le=_.useCallback(async(e=!1,o,r,n)=>{if(!b||!g?.companyId){v(!1),C(!1);return}try{e?(C(!0),De=null):v(!0),De||(De=nt({address:"masters/taskType/",method:"GET"}));const a=n??N,l=o??O,d=r??Q,{fromDate:h,toDate:p}=Ie(a,l,d),t={},c={};h&&(t.from_Task_Assign_dt=h),p&&(t.to_Task_Assign_dt=p),h&&(c.fromDate=h),p&&(c.toDate=p);const[m,u,i,x,f,j]=await Promise.all([Gt(t,g.companyId),qt(c,g.companyId),Xt().catch(()=>nt({address:"masters/projectSchedule/",method:"GET"})),Kt(g.companyId),De,Ut().catch(()=>[])]);let I=[];m?.data&&Array.isArray(m.data)?I=m.data:m?.items&&Array.isArray(m.items)?I=m.items:Array.isArray(m)&&(I=m);let E=[];u?.data?.items&&Array.isArray(u.data.items)?E=u.data.items:u?.data&&Array.isArray(u.data)?E=u.data:u?.items&&Array.isArray(u.items)?E=u.items:Array.isArray(u)&&(E=u);let w=[];Array.isArray(i)?w=i:i?.data&&Array.isArray(i.data)?w=i.data:i?.data?.data&&Array.isArray(i.data.data)?w=i.data.data:i?.items&&Array.isArray(i.items)&&(w=i.items);let A=[];Array.isArray(x)?A=x:x?.data&&Array.isArray(x.data)?A=x.data:x?.items&&Array.isArray(x.items)&&(A=x.items),mt(A);let K=[];f?.data&&Array.isArray(f.data)?K=f.data:f?.items&&Array.isArray(f.items)?K=f.items:Array.isArray(f)&&(K=f),gt(K);const k=new Set(A.map(H=>Number(H.Emp_Id))),ee=ct(I,"assigned"),ie=k.size>0?ee.filter(H=>k.has(Number(H.Emp_Id))):ee,re=E.map(H=>({...H,Task_Name:H.taskDetails?.Task_Name||H.Task_Name||`Task ${H.Task_Id}`})),Le=ct(re,"executed"),ce=k.size>0?Le.filter(H=>k.has(Number(H.Emp_Id))):Le;je(ie),we(ce),St(w),yt(j||[])}catch(a){console.error("Error loading task comparison data:",a)}finally{v(!1),C(!1)}},[b,g?.companyId,N,O,Q,Ie]),Dt=_.useCallback(()=>{v(!0),Ge(P),qe($e),Xe(W),Ke(R),Ue(ke),Je(ve),Qe(he),le(!1,ke,ve,he),Ne(!1)},[P,$e,W,R,ke,ve,he,le]),jt=_.useCallback(()=>{const e=T(new Date);Oe("Day"),Ve(""),Ae(""),Pe(""),Te(""),Be(e),Ye(e),He("table"),Ge(""),qe(""),Xe(""),Ke(""),Ue(e),Je(e),Qe("Day"),le(!1,e,e,"Day"),Ne(!1)},[le]);_.useEffect(()=>{if(!y)return le(),()=>{De=null}},[le,y]);const F=_.useMemo(()=>{const o=N==="Day"||N==="List"&&(!Q||O===Q)?O:void 0,r=o?T(o):void 0,n=z.filter(Fe).filter(t=>{const c=T(t.Task_Assign_dt||t.Schedule_Sch_Date||t.Sch_Date||t.Schedule_Sch_Start_Date);return!Jt(t,fe,o||c)}),a=(()=>{if(!r)return n;const t=new Map;return n.forEach(c=>{const m=T(c.Task_Assign_dt||c.Schedule_Sch_Date||c.Sch_Date||c.Schedule_Sch_Start_Date),u=!m||m<=r?r:m,i=c.Sch_Id!=null?String(c.Sch_Id).trim():"",x=c.Task_Id!=null?String(c.Task_Id).trim():"",f=c.Emp_Id!=null?String(c.Emp_Id).trim():"",j=c.Sch_Time!=null?String(c.Sch_Time).trim():"",E=i!==""&&i!=="0"&&i!=="null"&&i!=="undefined"?`${u}_${i}_${x}_${f}`:`${u}_${x}_${f}_${j}`;(!t.get(E)||m===r)&&t.set(E,c)}),Array.from(t.values())})(),l=ue.filter(Fe),d=new Map;a.forEach(t=>{d.set(t,[])});const h=new Set;l.forEach(t=>{const c=T(t.Work_Dt||t.workDate||t.Work_Date);if(!c)return;const m=String(t.Sch_Id||""),u=String(t.Task_Id||""),i=Number(t.Emp_Id);if(m){const x=a.find(f=>{const j=T(f.Task_Assign_dt||f.Schedule_Sch_Date||f.Sch_Date||f.Schedule_Sch_Start_Date),I=r&&(!j||j<=r)?r:j,E=String(f.Sch_Id||""),w=String(f.Task_Id||""),A=Number(f.Emp_Id);return I===c&&A===i&&w===u&&E===m});x&&(d.get(x).push(t),h.add(t))}}),l.forEach(t=>{if(h.has(t))return;const c=T(t.Work_Dt||t.workDate||t.Work_Date);if(!c)return;const m=String(t.Task_Id||""),u=Number(t.Emp_Id),i=a.find(x=>{const f=T(x.Task_Assign_dt||x.Schedule_Sch_Date||x.Sch_Date||x.Schedule_Sch_Start_Date),j=r&&(!f||f<=r)?r:f,I=String(x.Task_Id||""),E=Number(x.Emp_Id);return j===c&&E===u&&I===m});i&&(d.get(i).push(t),h.add(t))}),l.forEach(t=>{if(h.has(t))return;const c=T(t.Work_Dt||t.workDate||t.Work_Date);if(!c)return;const m=String(t.Sch_Id||""),u=Number(t.Emp_Id);if(!m)return;const i=a.find(x=>{const f=T(x.Task_Assign_dt||x.Schedule_Sch_Date||x.Sch_Date||x.Schedule_Sch_Start_Date),j=r&&(!f||f<=r)?r:f,I=String(x.Sch_Id||""),E=Number(x.Emp_Id);return j===c&&E===u&&I===m});i&&(d.get(i).push(t),h.add(t))});const p=[];return a.forEach((t,c)=>{const m=t.Sch_Id!=null&&t.Sch_Id!==""&&t.Sch_Id!=="0"&&t.Sch_Id!=="null"?String(t.Sch_Id).trim():"",u=m?(fe||[]).find(k=>String(k?.schId??k?.Sch_Id??k?.id??"").trim()===m):null,i=t.Sch_Time||t.Sch_Est_Start_Time||t.Schedule_Sch_Est_Start_Time||u?.schEstStartTime||u?.Sch_Est_Start_Time||null,x=t.EN_Time||t.Sch_Est_End_Time||t.Schedule_Sch_Est_End_Time||u?.schEstEndTime||u?.Sch_Est_End_Time||null,f=T(t.Task_Assign_dt||t.Schedule_Sch_Date||t.Sch_Date||t.Schedule_Sch_Start_Date),j=r&&(!f||f<=r)?r:f;if(!j)return;const I=String(t.Task_Id||""),E=Number(t.Emp_Id),w=pt[Number(t.Invovled_Stat??0)]??pt[0],A=d.get(t)||[],K=Me(i,x);if(A.length===0){const k=`assign_${j}_${I}_${m}_${E}_${t.Id||c}`;p.push({key:k,dateStr:ne(j),dateObj:ye(j),taskId:t.Task_Id,schId:t.Sch_Id,taskName:t.taskDetails?.Task_Name||t.Task_Name||`Task ${t.Task_Id}`,empId:t.Emp_Id,empName:t.Emp_Name||"",projectName:t.Project_Name||"",taskTypeId:t.Task_Type_Id||t.taskDetails?.Task_Type_Id||null,taskTypeName:t.Task_Type||t.taskDetails?.Task_Type||"",projectId:t.Project_Id||t.taskDetails?.Project_Id||null,assignedStartTime:se(i),assignedEndTime:se(x),assignedDuration:K,assignedStatus:w.label,assignedStatusClass:w.class,executedStartTime:"-",executedEndTime:"-",executedDuration:"-",executedStatus:"-",executedStatusClass:"",workDetails:"-",rawStartTime:null,rawEndTime:null,rawWorkDate:j,rawAssignedStartTime:i||null,rawAssignedEndTime:x||null,rawAssignedDate:j})}else A.sort((k,ee)=>{const ie=k.Start_Time||k.Sch_Est_Start_Time||"",re=ee.Start_Time||ee.Sch_Est_Start_Time||"";return ie.localeCompare(re)}),A.forEach((k,ee)=>{const ie=ut(k.Work_Status),re=k.Start_Time||k.Sch_Est_Start_Time,ce=!k.End_Time&&(k.Work_Status==="In Progress"||String(k.Work_Status)==="2"||!!k.Start_Time)?null:k.End_Time||k.Sch_Est_End_Time||null,H=se(re),Ft=ce?se(ce):"-",Lt=ht(k.Work_Done),Mt=Me(re,ce),zt=`assign_exec_${j}_${I}_${m}_${E}_${k.Work_Id||ee}`;p.push({key:zt,dateStr:ne(j),dateObj:ye(j),taskId:t.Task_Id,schId:t.Sch_Id,taskName:t.taskDetails?.Task_Name||t.Task_Name||`Task ${t.Task_Id}`,empId:t.Emp_Id,empName:t.Emp_Name||"",projectName:t.Project_Name||k.Project_Name||"",taskTypeId:t.Task_Type_Id||t.taskDetails?.Task_Type_Id||k.Task_Type_Id||k.taskDetails?.Task_Type_Id||null,taskTypeName:t.Task_Type||t.taskDetails?.Task_Type||k.Task_Type||k.taskDetails?.Task_Type||"",projectId:t.Project_Id||t.taskDetails?.Project_Id||k.Project_Id||k.taskDetails?.Project_Id||null,assignedStartTime:se(i),assignedEndTime:se(x),assignedDuration:K,assignedStatus:w.label,assignedStatusClass:w.class,executedStartTime:H,executedEndTime:Ft,executedDuration:Mt,executedStatus:ie.label,executedStatusClass:ie.class,workDetails:Lt,rawStartTime:re,rawEndTime:ce,rawWorkDate:j,rawAssignedStartTime:i||null,rawAssignedEndTime:x||null,rawAssignedDate:j})})}),l.forEach((t,c)=>{if(h.has(t))return;const m=T(t.Work_Dt||t.workDate||t.Work_Date);if(!m)return;const u=ut(t.Work_Status),i=t.Start_Time||t.Sch_Est_Start_Time,f=!t.End_Time&&(t.Work_Status==="In Progress"||String(t.Work_Status)==="2"||!!t.Start_Time)?null:t.End_Time||t.Sch_Est_End_Time||null,j=se(i),I=f?se(f):"-",E=ht(t.Work_Done),w=Me(i,f),A=`exec_only_${m}_${t.Task_Id}_${t.Sch_Id}_${t.Emp_Id}_${t.Work_Id||c}`;p.push({key:A,dateStr:ne(m),dateObj:ye(m),taskId:t.Task_Id,schId:t.Sch_Id,taskName:t.taskDetails?.Task_Name||t.Task_Name||`Task ${t.Task_Id}`,empId:t.Emp_Id,empName:t.Emp_Name||"",projectName:t.Project_Name||t.taskDetails?.Project_Name||"",taskTypeId:t.Task_Type_Id||t.taskDetails?.Task_Type_Id||null,taskTypeName:t.Task_Type||t.taskDetails?.Task_Type||"",projectId:t.Project_Id||t.taskDetails?.Project_Id||null,assignedStartTime:"-",assignedEndTime:"-",assignedDuration:"-",assignedStatus:"-",assignedStatusClass:"",executedStartTime:j,executedEndTime:I,executedDuration:w,executedStatus:u.label,executedStatusClass:u.class,workDetails:E,rawStartTime:i,rawEndTime:f,rawWorkDate:m,rawAssignedStartTime:null,rawAssignedEndTime:null,rawAssignedDate:null})}),p.sort((t,c)=>{const m=c.dateObj.getTime()-t.dateObj.getTime();if(m!==0)return m;const u=Ce(t.executedStartTime!=="-"?t.executedStartTime:t.assignedStartTime),i=Ce(c.executedStartTime!=="-"?c.executedStartTime:c.assignedStartTime);if(u!==9999&&i!==9999&&u!==i)return u-i;if(u===9999)return 1;if(i===9999)return-1;const x=Ce(t.executedEndTime!=="-"?t.executedEndTime:t.assignedEndTime),f=Ce(c.executedEndTime!=="-"?c.executedEndTime:c.assignedEndTime);return x!==9999&&f!==9999&&x!==f?x-f:0})},[z,ue,fe,Fe,N,O,Q]),Tt=_.useMemo(()=>{const e=new Set;return F.forEach(o=>{let r=!0;W!==""&&(r=_e(o.taskTypeId,W)||String(o.taskTypeName).toLowerCase()===String(W).toLowerCase());let n=!0;R!==""&&(n=String(o.taskId)===R),r&&n&&o.projectName&&e.add(o.projectName)}),Array.from(e)},[F,W,R]),be=_.useMemo(()=>{if(!P)return null;const e=F.find(o=>o.projectName===P);return e?e.projectId:null},[P,F]),kt=_.useMemo(()=>{const e=new Set;F.forEach(r=>{let n=!0;P!==""&&(n=r.projectName===P);let a=!0;R!==""&&(a=String(r.taskId)===R),n&&a&&(r.taskTypeId&&e.add(String(r.taskTypeId)),r.taskTypeName&&e.add(String(r.taskTypeName).toLowerCase()))});let o=oe.filter(r=>be&&String(r.Project_Id)!==String(be)?!1:e.has(String(r.Task_Type_Id))||e.has(String(r.Task_Type).toLowerCase()));return o.length===0&&(be?o=oe.filter(r=>String(r.Project_Id)===String(be)):o=oe),o.map(r=>({label:r.Task_Type,value:String(r.Task_Type_Id)}))},[F,P,R,oe,be]),vt=_.useMemo(()=>{const e=new Set;return F.forEach(o=>{let r=!0;P!==""&&(r=o.projectName===P);let n=!0;W!==""&&(n=_e(o.taskTypeId,W)||String(o.taskTypeName).toLowerCase()===String(W).toLowerCase());let a=!0;R!==""&&(a=String(o.taskId)===R),r&&n&&a&&e.add(o.empId.toString())}),P===""&&W===""&&R===""?ge:ge.filter(o=>e.has(o.Emp_Id?.toString()))},[ge,P,W,R,F]),Nt=_.useMemo(()=>{const e=new Map;return F.forEach(o=>{let r=!0;P!==""&&(r=o.projectName===P);let n=!0;W!==""&&(n=_e(o.taskTypeId,W)||String(o.taskTypeName).toLowerCase()===String(W).toLowerCase()),r&&n&&o.taskId&&o.taskName&&e.set(String(o.taskId),o.taskName)}),Array.from(e.entries()).map(([o,r])=>({value:o,label:r}))},[F,P,W]),Ze=_.useCallback(()=>{const e=O?ye(O):new Date,o=new Date(e.getFullYear(),e.getMonth(),e.getDate()),r=new Date(o);r.setDate(o.getDate()-o.getDay());const n=new Date(r);n.setDate(r.getDate()+6);const a=new Date(o.getFullYear(),o.getMonth(),1),l=new Date(o.getFullYear(),o.getMonth()+1,0);return{today:o,startOfWeek:r,endOfWeek:n,startOfMonth:a,endOfMonth:l}},[O]),$=_.useMemo(()=>{const{startOfWeek:e,endOfWeek:o,startOfMonth:r,endOfMonth:n}=Ze();return F.filter(a=>{let l=!0;const d=T(a.dateObj);if(N==="Day"){const m=T(O),u=T(Q)||m;m&&d<m&&(l=!1),u&&d>u&&(l=!1)}else if(N==="List"){const m=T(O),u=T(Q)||m;m&&d<m&&(l=!1),u&&d>u&&(l=!1)}else if(N==="Week"){const m=T(e),u=T(o);m&&d<m&&(l=!1),u&&d>u&&(l=!1)}else if(N==="Month"){const m=T(r),u=T(n);m&&d<m&&(l=!1),u&&d>u&&(l=!1)}else N==="Over All"&&(l=!0);let h=!0;Y!==""&&(h=a.projectName===Y);let p=!0;U!==""&&(p=a.empId.toString()===U.toString());let t=!0;M!==""&&(t=_e(a.taskTypeId,M)||String(a.taskTypeName).toLowerCase()===String(M).toLowerCase());let c=!0;return J!==""&&(c=String(a.taskId)===J),l&&h&&p&&t&&c})},[F,N,Y,U,O,Q,M,J]),X=_.useMemo(()=>{let e=0,o=0,r=0,n=fe;Y!==""&&(n=n.filter(l=>l.Project_Name===Y||l.projectName===Y));const a=n.length;return n.forEach(l=>{const d=Number(l.schStatus||l.Sch_Status);d===3?e++:d===1?o++:d===2&&r++}),a===0?{completed:0,inprocess:0,pending:0}:{completed:Math.round(e/a*100),inprocess:Math.round(o/a*100),pending:Math.round(r/a*100)}},[fe,Y]),V=_.useMemo(()=>{const e=new Set,o=new Map,r=new Set;let n=0;$.forEach(i=>{if(i.assignedStartTime==="-"&&i.assignedEndTime==="-")return;const x=`${i.dateStr}_${i.taskId}_${i.schId||""}_${i.empId}`;if(e.has(x))return;e.add(x),n++;const f=T(i.rawAssignedDate||i.dateObj)||i.dateStr;f&&r.add(f);const j=Re(i.rawAssignedStartTime||i.assignedStartTime,i.rawAssignedEndTime||i.assignedEndTime);if(j){const I=`${f}_${i.empId||i.empName||"default"}`;o.has(I)||o.set(I,[]),o.get(I).push(j)}});let a=0;o.forEach(i=>{dt(i).forEach(f=>{a+=f.end-f.start})});const l=r.size||1,d=Math.round(a/l);let h="0m";const p=Math.floor(d/60),t=d%60;p>0?h=`${p}h ${t>0?`${t}m`:""}`.trim():t>0&&(h=`${t}m`);let c="0m";const m=Math.floor(a/60),u=a%60;return m>0?c=`${m}h ${u>0?`${u}m`:""}`.trim():u>0&&(c=`${u}m`),{records:n,totalMinutes:a,totalDurationStr:c,avgDurationStr:h,daysCount:l}},[$]),B=_.useMemo(()=>{const e=new Set,o=new Map,r=new Set;let n=0;$.forEach(i=>{if(i.executedStartTime==="-"&&i.executedEndTime==="-"||i.key&&e.has(i.key))return;i.key&&e.add(i.key),n++;const x=T(i.rawWorkDate||i.dateObj)||i.dateStr;x&&r.add(x);const f=Re(i.rawStartTime||i.executedStartTime,i.rawEndTime||i.executedEndTime);if(f){const j=`${x}_${i.empId||i.empName||"default"}`;o.has(j)||o.set(j,[]),o.get(j).push(f)}});let a=0;o.forEach(i=>{dt(i).forEach(f=>{a+=f.end-f.start})});const l=r.size||1,d=Math.round(a/l);let h="0m";const p=Math.floor(d/60),t=d%60;p>0?h=`${p}h ${t>0?`${t}m`:""}`.trim():t>0&&(h=`${t}m`);let c="0m";const m=Math.floor(a/60),u=a%60;return m>0?c=`${m}h ${u>0?`${u}m`:""}`.trim():u>0&&(c=`${u}m`),{records:n,totalMinutes:a,totalDurationStr:c,avgDurationStr:h,daysCount:l}},[$]),ae=(e,o)=>{xt(e),bt(o),We(!0)},D=_.useMemo(()=>{const{fromDate:e,toDate:o}=Ie(N,O,Q),r=Y||"All Projects";let n="All Task Types";if(M!==""){const d=oe.find(p=>String(p.Task_Type_Id)===String(M)||String(p.Task_Type).toLowerCase()===String(M).toLowerCase()),h=F.find(p=>_e(p.taskTypeId,M)||String(p.taskTypeName).toLowerCase()===String(M).toLowerCase());n=d?.Task_Type||h?.taskTypeName||M}let a="All Tasks";J!==""&&(a=F.find(h=>String(h.taskId)===String(J))?.taskName||J);let l="All Employees";if(U!==""){const d=ge.find(p=>String(p.Emp_Id)===String(U)),h=F.find(p=>String(p.empId)===String(U));l=d?.Emp_Name||h?.empName||U}return{displayFormatLabel:me==="table"?"Table View":"Calendar View",viewLabel:N,projectLabel:r,taskTypeLabel:n,taskLabel:a,employeeLabel:l,fromDateLabel:e?ne(e):"All",toDateLabel:o?ne(o):"All"}},[N,O,Q,Y,M,J,U,me,oe,ge,F,Ie]),Se=_.useMemo(()=>{const e=new Map;return $.forEach(o=>{e.has(o.dateStr)||e.set(o.dateStr,[]),e.get(o.dateStr).push(o)}),Array.from(e.entries()).map(([o,r])=>{let n=0,a=0,l=0;r.forEach(p=>{let t=p.executedStatus;(t==="-"||t==="--"||t==="")&&(t=p.assignedStatus),t=t.toLowerCase(),t.includes("completed")?n++:t.includes("in progress")?a++:t.includes("pending")&&l++});const d=n+l+a,h=d===0?0:Math.round(n/d*100);return{dateStr:o,totalTasks:r.length,completed:n,pending:l,inProgress:a,progressPct:h,rows:r}})},[$]),It=_.useCallback(()=>{if($.length===0)return;const e=[["Project Task Comparison Report"],["View",D.viewLabel,"Display Format",D.displayFormatLabel,"From Date",D.fromDateLabel,"To Date",D.toDateLabel],["Project",D.projectLabel,"Task Type",D.taskTypeLabel,"Task",D.taskLabel,"Employee",D.employeeLabel],["Assigned Records",V.records,"Assigned Duration",V.totalDurationStr,"Assigned Avg Duration/Day",V.avgDurationStr,"Executed Records",B.records,"Executed Duration",B.totalDurationStr,"Executed Avg Duration/Day",B.avgDurationStr,"Project Completed",`${X.completed}%`,"Project Inprocess",`${X.inprocess}%`,"Project Pending",`${X.pending}%`],[]];N!=="Day"&&(e.push([`${N} View - Date Summary`]),e.push(["Date","Total Tasks","Completed","Pending","In Progress","Progress (%)"]),Se.forEach(n=>{e.push([n.dateStr,n.totalTasks,n.completed,n.pending,n.inProgress,`${n.progressPct}%`])}),e.push([])),e.push(["S.No","Date","Project","Task Type","Task Name","Employee","Assigned Start Time","Assigned End Time","Assigned Duration","Assigned Status","Executed Start Time","Executed End Time","Executed Duration","Executed Status","Work Details"]),$.forEach((n,a)=>{e.push([a+1,n.dateStr,n.projectName||"-",n.taskTypeName||"-",n.taskName,n.empName||"-",n.assignedStartTime,n.assignedEndTime,n.assignedDuration,n.assignedStatus,n.executedStartTime,n.executedEndTime,n.executedDuration,n.executedStatus,n.workDetails])});const o=pe.aoa_to_sheet(e);o["!cols"]=[{wch:8},{wch:14},{wch:24},{wch:20},{wch:32},{wch:22},{wch:18},{wch:18},{wch:16},{wch:16},{wch:18},{wch:18},{wch:16},{wch:16},{wch:40}];const r=pe.book_new();pe.book_append_sheet(r,o,`${N}_Comparison`),it(r,`Project_Task_Comparison_${N}_${D.fromDateLabel}_to_${D.toDateLabel}.xlsx`)},[$,D,X,U,V,B,N,Se]),Et=(e,o)=>{const r=o||"",n=(e||"").toLowerCase();return r==="chip-completed"||n.includes("completed")?{bg:[76,175,80],text:[255,255,255]}:r==="chip-progress"||n.includes("in progress")?{bg:[25,118,210],text:[255,255,255]}:r==="chip-pending"||n.includes("pending")?{bg:[255,152,0],text:[255,255,255]}:r==="chip-new"||n.includes("new")?{bg:[255,193,7],text:[0,0,0]}:null},et=(e,o,r,n=10)=>{lt(e,{head:[[{content:"Date",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"Task Name",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"Employee",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"Assigned Details",colSpan:4,styles:{halign:"center",fillColor:[227,242,253],textColor:[33,33,33]}},{content:"Executed Details",colSpan:5,styles:{halign:"center",fillColor:[232,245,233],textColor:[33,33,33]}}],[{content:"",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"",styles:{fillColor:[245,245,245],textColor:[33,33,33]}},{content:"Start Time",styles:{fillColor:[227,242,253],textColor:[33,33,33]}},{content:"End Time",styles:{fillColor:[227,242,253],textColor:[33,33,33]}},{content:"Duration",styles:{fillColor:[227,242,253],textColor:[33,33,33]}},{content:"Status",styles:{fillColor:[227,242,253],textColor:[33,33,33]}},{content:"Start Time",styles:{fillColor:[232,245,233],textColor:[33,33,33]}},{content:"End Time",styles:{fillColor:[232,245,233],textColor:[33,33,33]}},{content:"Duration",styles:{fillColor:[232,245,233],textColor:[33,33,33]}},{content:"Status",styles:{fillColor:[232,245,233],textColor:[33,33,33]}},{content:"Work Details",styles:{fillColor:[232,245,233],textColor:[33,33,33]}}]],body:o.map(a=>[a.dateStr,a.taskName,a.empName||"-",a.assignedStartTime,a.assignedEndTime,a.assignedDuration,a.assignedStatus!=="-"&&a.assignedStatus!=="--"?a.assignedStatus:"-",a.executedStartTime,a.executedEndTime,a.executedDuration,a.executedStatus!=="-"?a.executedStatus:"-",a.workDetails]),startY:r,theme:"grid",styles:{fontSize:8,cellPadding:2.2,overflow:"linebreak",fillColor:[255,255,255],textColor:[33,33,33],lineColor:[224,224,224],lineWidth:.25,valign:"middle"},headStyles:{fontStyle:"bold",lineColor:[204,204,204],lineWidth:.3},columnStyles:{0:{cellWidth:20},1:{cellWidth:38},2:{cellWidth:26},3:{cellWidth:15},4:{cellWidth:15},5:{cellWidth:16},6:{cellWidth:20},7:{cellWidth:15},8:{cellWidth:15},9:{cellWidth:16},10:{cellWidth:20},11:{cellWidth:61}},didDrawCell:a=>{if(a.section==="body"&&(a.column.index===6||a.column.index===10)){const l=o[a.row.index];if(!l)return;const d=a.column.index===6,h=d?l.assignedStatus:l.executedStatus,p=d?l.assignedStatusClass:l.executedStatusClass;if(!h||h==="-"||h==="--")return;const t=Et(h,p);if(!t)return;const c=a.cell;e.setFillColor(255,255,255),e.rect(c.x+.3,c.y+.3,c.width-.6,c.height-.6,"F"),e.setFont("helvetica","bold"),e.setFontSize(7);const m=e.getTextWidth(h),u=Math.min(c.width-2,m+5),i=4.8,x=c.x+(c.width-u)/2,f=c.y+(c.height-i)/2;e.setFillColor(t.bg[0],t.bg[1],t.bg[2]),e.roundedRect(x,f,u,i,2,2,"F"),e.setTextColor(t.text[0],t.text[1],t.text[2]),e.text(h,x+u/2,f+3.3,{align:"center"})}},margin:{left:n,right:n,bottom:12}})},Ct=_.useCallback(()=>{if($.length===0)return;const e=new ot({orientation:"landscape"}),o=e.internal.pageSize.getWidth(),r=10,n=o-r*2;let l=(()=>{e.setFont("helvetica","bold"),e.setFontSize(14),e.setTextColor(25,118,210),e.text("Project Task Comparison",r,12);const d=16,h=14;e.setFillColor(255,255,255),e.setDrawColor(224,224,224),e.roundedRect(r,d,n,h,2,2,"FD"),e.setFont("helvetica","bold"),e.setFontSize(8.5),e.setTextColor(25,118,210),e.text("Filter Details:",r+3,d+5.5);const p=(E,w,A,K,k)=>{e.setFont("helvetica","bold"),e.setFontSize(7.5);const ee=e.getTextWidth(E)+5;return e.setFillColor(K[0],K[1],K[2]),e.roundedRect(w,A,ee,4.8,1.8,1.8,"F"),e.setTextColor(k[0],k[1],k[2]),e.text(E,w+2.5,A+3.4),w+ee+2.5};let t=r+26;const c=d+2;t=p(`Format: ${D.displayFormatLabel}`,t,c,[245,245,245],[33,33,33]),t=p(`View: ${D.viewLabel}`,t,c,[227,242,253],[21,101,192]),t=p(`Project: ${D.projectLabel}`,t,c,[245,245,245],[33,33,33]),t=p(`Task Type: ${D.taskTypeLabel}`,t,c,[245,245,245],[33,33,33]),p(`Task: ${D.taskLabel}`,t,c,[245,245,245],[33,33,33]);let m=r+26;const u=d+7.8;m=p(`Employee: ${D.employeeLabel}`,m,u,[245,245,245],[33,33,33]),m=p(`From Date: ${D.fromDateLabel}`,m,u,[232,245,233],[46,125,50]),p(`To Date: ${D.toDateLabel}`,m,u,[232,245,233],[46,125,50]);const i=[{title:"Assigned Records",value:String(V.records),color:[25,118,210]},{title:"Assigned Duration",value:V.totalDurationStr,color:[25,118,210]},{title:"Assigned Avg/Day",value:V.avgDurationStr,color:[25,118,210]},{title:"Executed Records",value:String(B.records),color:[46,125,50]},{title:"Executed Duration",value:B.totalDurationStr,color:[46,125,50]},{title:"Executed Avg/Day",value:B.avgDurationStr,color:[46,125,50]},{title:"Project Completed",value:`${X.completed}%`,color:[25,118,210]},{title:"Project Inprocess",value:`${X.inprocess}%`,color:[76,175,80]},{title:"Project Pending",value:`${X.pending}%`,color:[255,152,0]}],x=d+h+3,f=16,j=3,I=(n-j*(i.length-1))/i.length;return i.forEach((E,w)=>{const A=r+w*(I+j);e.setFillColor(255,255,255),e.setDrawColor(224,224,224),e.roundedRect(A,x,I,f,2.5,2.5,"FD"),e.setFont("helvetica","normal"),e.setFontSize(8),e.setTextColor(110,110,110),e.text(E.title,A+I/2,x+5.5,{align:"center"}),e.setFont("helvetica","bold"),e.setFontSize(13),e.setTextColor(E.color[0],E.color[1],E.color[2]),e.text(E.value,A+I/2,x+12.8,{align:"center"})}),x+f+4})();N!=="Day"&&(lt(e,{head:[["Date",`${N} View Summary (Click to View All)`]],body:Se.map(d=>[d.dateStr,`Total Tasks: ${d.totalTasks}     |     Completed (${d.completed})     Pending (${d.pending})     In Progress (${d.inProgress})     |     Progress: ${d.progressPct}%`]),startY:l,theme:"grid",styles:{fontSize:8.5,cellPadding:3,fillColor:[240,248,255],textColor:[33,33,33],fontStyle:"bold",lineColor:[224,224,224],lineWidth:.25},headStyles:{fillColor:[245,245,245],textColor:[33,33,33],fontStyle:"bold"},columnStyles:{0:{cellWidth:32}},didDrawCell:d=>{if(d.section==="body"&&d.column.index===1){const h=Se[d.row.index];if(!h)return;const p=d.cell;e.setFillColor(240,248,255),e.rect(p.x+.3,p.y+.3,p.width-.6,p.height-.6,"F");const t=p.y+p.height/2;let c=p.x+6;e.setFont("helvetica","bold"),e.setFontSize(8.5),e.setTextColor(33,33,33);const m=`Total Tasks: ${h.totalTasks}`;e.text(m,c,t+1),c+=e.getTextWidth(m)+8;const u=(f,j)=>{e.setFont("helvetica","bold"),e.setFontSize(7.5);const I=e.getTextWidth(f)+5;e.setFillColor(j[0],j[1],j[2]),e.roundedRect(c,t-2.4,I,4.8,2,2,"F"),e.setTextColor(255,255,255),e.text(f,c+2.5,t+.9),c+=I+3};u(`Completed (${h.completed})`,[46,125,50]),u(`Pending (${h.pending})`,[237,108,2]),u(`In Progress (${h.inProgress})`,[2,136,209]),c+=6,e.setFont("helvetica","normal"),e.setFontSize(7),e.setTextColor(33,33,33),e.text(`${h.progressPct}%`,c,t-.8);const i=35,x=2.2;e.setFillColor(187,222,251),e.roundedRect(c,t+.3,i,x,1,1,"F"),h.progressPct>0&&(e.setFillColor(25,118,210),e.roundedRect(c,t+.3,i*h.progressPct/100,x,1,1,"F")),c+=i+8,e.setFont("helvetica","normal"),e.setFontSize(7.5),e.setTextColor(25,118,210),e.text("(Click to View All)",c,t+1)}},margin:{left:r,right:r}}),l=(e.lastAutoTable?.finalY||l)+5),et(e,$,l,r),e.save(`Project_Task_Comparison_${N}_${D.fromDateLabel}_to_${D.toDateLabel}.pdf`)},[$,D,U,V,B,X,N,Se]),wt=_.useCallback(()=>{if(Z.length===0)return;const e=[[`Tasks for ${te} - Employee: ${D.employeeLabel}`],["Date",te,"Employee",D.employeeLabel,"Project",D.projectLabel,"Task Type",D.taskTypeLabel,"Task",D.taskLabel,"Total Tasks",Z.length],[],["S.No","Date","Task Name","Employee","Assigned Start Time","Assigned End Time","Assigned Duration","Assigned Status","Executed Start Time","Executed End Time","Executed Duration","Executed Status","Work Details"]];Z.forEach((n,a)=>{e.push([a+1,n.dateStr,n.taskName,n.empName||"-",n.assignedStartTime,n.assignedEndTime,n.assignedDuration,n.assignedStatus,n.executedStartTime,n.executedEndTime,n.executedDuration,n.executedStatus,n.workDetails])});const o=pe.aoa_to_sheet(e);o["!cols"]=[{wch:8},{wch:14},{wch:32},{wch:22},{wch:18},{wch:18},{wch:16},{wch:16},{wch:18},{wch:18},{wch:16},{wch:16},{wch:40}];const r=pe.book_new();pe.book_append_sheet(r,o,`Tasks_${te}`),it(r,`Tasks_for_${te}_${D.employeeLabel}.xlsx`)},[Z,te,D]),$t=_.useCallback(()=>{if(Z.length===0)return;const e=new ot({orientation:"landscape"}),o=e.internal.pageSize.getWidth(),r=10,n=o-r,a=12;let l=r,d=a;e.setFont("helvetica","bold"),e.setFontSize(14),e.setTextColor(33,33,33);const h=`Tasks for ${te}`;e.text(h,l,d+5.5),l+=e.getTextWidth(h)+6;const p=c=>{e.setFont("helvetica","bold"),e.setFontSize(8.5);const u=e.getTextWidth(c)+8,i=6;l+u>n&&(l=r,d+=8),e.setFillColor(227,242,253),e.roundedRect(l,d,u,i,2,2,"F"),e.setTextColor(21,101,192),e.text(c,l+4,d+4.2),l+=u+4};Y!==""&&p(`Project: ${D.projectLabel}`),M!==""&&p(`Task Type: ${D.taskTypeLabel}`),J!==""&&p(`Task: ${D.taskLabel}`),p(`Employee: ${D.employeeLabel}`);const t=Math.max(d+10,22);et(e,Z,t,r),e.save(`Tasks_for_${te}_${D.employeeLabel}.pdf`)},[Z,te,D,Y,M,J]),At=()=>{const{startOfWeek:e,startOfMonth:o}=Ze(),r=new Map;$.forEach(a=>{r.has(a.dateStr)||r.set(a.dateStr,[]),r.get(a.dateStr).push(a)});const n=a=>{let l=a.executedStatus;return(l==="-"||l==="--"||l==="")&&(l=a.assignedStatus),l=l.toLowerCase(),l.includes("completed")?"completed":l.includes("in progress")?"in-progress":l.includes("pending")?"pending":"none"};if(N==="Day")return $.length===0?s.jsx("div",{style:{padding:16,textAlign:"center",color:"#757575"},children:"No tasks found."}):s.jsx("div",{className:"calendar-list-view",children:$.map(a=>{const l=n(a),d=l==="completed"?"chip-completed":l==="in-progress"?"chip-progress":"chip-pending",h=a.executedStatus!=="-"&&a.executedStatus!=="--"&&a.executedStatus!==""?a.executedStatus:a.assignedStatus;return s.jsxs("div",{className:"calendar-list-item",onClick:()=>ae(a.dateStr,[a]),style:{cursor:"pointer"},children:[s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[s.jsx("strong",{style:{color:"var(--primary-color)",fontSize:"1.1rem"},children:a.taskName}),s.jsxs("span",{style:{color:"#757575",fontSize:"0.85rem"},children:["Project: ",a.projectName," | Employee: ",a.empName," | Date: ",a.dateStr]})]}),s.jsx("div",{children:s.jsx("span",{className:`chip ${d}`,children:h})})]},a.key)})});if(N==="List"||N==="Over All")return $.length===0?s.jsx("div",{style:{padding:16,textAlign:"center",color:"#757575"},children:"No tasks found."}):s.jsx("div",{className:"calendar-list-view",children:Array.from(r.entries()).map(([a,l])=>{let d=0,h=0,p=0;return l.forEach(t=>{const c=n(t);c==="completed"?d++:c==="in-progress"?h++:c==="pending"&&p++}),s.jsxs("div",{className:"calendar-list-item",style:{cursor:"pointer"},onClick:()=>ae(a,l),children:[s.jsxs("div",{children:[s.jsx("strong",{style:{color:"var(--primary-color)",fontSize:"1.1rem"},children:a}),s.jsxs("span",{style:{color:"#757575",fontSize:"0.85rem",marginLeft:8},children:["Total Tasks: ",l.length]})]}),s.jsxs("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[d>0&&s.jsxs("span",{className:"chip chip-completed",children:["Completed: ",d]}),h>0&&s.jsxs("span",{className:"chip chip-progress",children:["In Process: ",h]}),p>0&&s.jsxs("span",{className:"chip chip-pending",children:["Pending: ",p]})]})]},a)})});if(N==="Week"){const a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],l=[];for(let d=0;d<7;d++){const h=new Date(e);h.setDate(e.getDate()+d);const p=ne(T(h)),t=r.get(p)||[];let c=0,m=0,u=0;t.forEach(i=>{const x=n(i);x==="completed"?c++:x==="in-progress"?m++:x==="pending"&&u++}),l.push(s.jsxs("div",{className:`calendar-cell ${t.length===0?"empty":""}`,style:t.length>0?{cursor:"pointer"}:{},onClick:()=>{t.length>0&&ae(p,t)},children:[s.jsx("div",{className:"date-label",children:p}),t.length>0&&s.jsxs("div",{style:{fontSize:"0.7rem",marginBottom:6,display:"flex",gap:4,flexWrap:"wrap"},children:[s.jsxs("span",{style:{background:"var(--completed-color)",color:"#1e4620",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Completed: ",c]}),s.jsxs("span",{style:{background:"var(--inprocess-color)",color:"#004085",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["In Process: ",m]}),s.jsxs("span",{style:{background:"var(--pending-color)",color:"#856404",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Pending: ",u]})]}),t.map(i=>s.jsx("div",{className:`calendar-task ${n(i)}`,title:i.taskName,onClick:x=>{x.stopPropagation(),ae(p,[i])},children:i.taskName},i.key))]},d))}return s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"calendar-header",children:a.map(d=>s.jsx("div",{children:d},d))}),s.jsx("div",{className:"calendar-grid",children:l})]})}else if(N==="Month"){const a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],l=new Date(o);l.setDate(1-o.getDay());const d=[];for(let h=0;h<35;h++){const p=new Date(l);p.setDate(l.getDate()+h);const t=ne(T(p)),c=r.get(t)||[],m=p.getMonth()!==o.getMonth();let u=0,i=0,x=0;c.forEach(f=>{const j=n(f);j==="completed"?u++:j==="in-progress"?i++:j==="pending"&&x++}),d.push(s.jsxs("div",{className:`calendar-cell ${c.length===0?"empty":""}`,style:{opacity:m?.5:1,cursor:c.length>0?"pointer":"default"},onClick:()=>{c.length>0&&ae(t,c)},children:[s.jsx("div",{className:"date-label",children:p.getDate()}),c.length>0&&s.jsxs("div",{style:{fontSize:"0.7rem",marginBottom:6,display:"flex",gap:4,flexWrap:"wrap"},children:[s.jsxs("span",{style:{background:"var(--completed-color)",color:"#1e4620",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Completed: ",u]}),s.jsxs("span",{style:{background:"var(--inprocess-color)",color:"#004085",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["In Process: ",i]}),s.jsxs("span",{style:{background:"var(--pending-color)",color:"#856404",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Pending: ",x]})]}),c.map(f=>s.jsx("div",{className:`calendar-task ${n(f)}`,title:f.taskName,onClick:j=>{j.stopPropagation(),ae(t,[f])},children:f.taskName},f.key))]},h))}return s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"calendar-header",children:a.map(h=>s.jsx("div",{children:h},h))}),s.jsx("div",{className:"calendar-grid",children:d})]})}return null},tt=e=>s.jsxs("tr",{children:[s.jsx("td",{children:e.dateStr}),s.jsx("td",{className:"task-name-cell",title:e.taskName,children:e.taskName}),s.jsx("td",{children:e.empName}),s.jsx("td",{className:"border-left",children:e.assignedStartTime}),s.jsx("td",{children:e.assignedEndTime}),s.jsx("td",{children:e.assignedDuration}),s.jsx("td",{children:e.assignedStatus!=="-"&&e.assignedStatus!=="--"?s.jsx("span",{className:`chip ${e.assignedStatusClass}`,children:e.assignedStatus}):"-"}),s.jsx("td",{className:"border-left",children:e.executedStartTime}),s.jsx("td",{children:e.executedEndTime}),s.jsx("td",{children:e.executedDuration}),s.jsx("td",{children:e.executedStatus!=="-"?s.jsx("span",{className:`chip ${e.executedStatusClass}`,children:e.executedStatus}):"-"}),s.jsx("td",{className:"work-details",title:e.workDetails,children:e.workDetails})]},e.key),Pt=()=>{if(N==="Day")return $.map(tt);const e=new Map;return $.forEach(o=>{e.has(o.dateStr)||e.set(o.dateStr,[]),e.get(o.dateStr).push(o)}),Array.from(e.entries()).map(([o,r])=>{let n=0,a=0,l=0;r.forEach(p=>{let t=p.executedStatus;(t==="-"||t==="--"||t==="")&&(t=p.assignedStatus),t=t.toLowerCase(),t.includes("completed")?n++:t.includes("in progress")?a++:t.includes("pending")&&l++});const d=n+l+a,h=d===0?0:Math.round(n/d*100);return s.jsxs("tr",{className:"dynamic-group-row",style:{cursor:"pointer"},onClick:()=>ae(o,r),children:[s.jsx("td",{style:{verticalAlign:"middle",fontWeight:600},children:o}),s.jsx("td",{colSpan:9,style:{padding:"8px 16px"},children:s.jsxs(G,{sx:{display:"flex",alignItems:"center",gap:3,flexWrap:"wrap",justifyContent:"center"},children:[s.jsxs(q,{variant:"body2",sx:{fontWeight:600,color:"var(--text-main)"},children:["Total Tasks: ",r.length]}),s.jsxs(Bt,{direction:"row",spacing:1,children:[s.jsx(L,{label:`Completed (${n})`,sx:{background:"#2e7d32",color:"#fff",fontWeight:600},size:"small"}),s.jsx(L,{label:`Pending (${l})`,sx:{background:"#ed6c02",color:"#fff",fontWeight:600},size:"small"}),s.jsx(L,{label:`In Progress (${a})`,sx:{background:"#0288d1",color:"#fff",fontWeight:600},size:"small"})]}),s.jsxs(G,{sx:{width:160,display:"flex",flexDirection:"column",alignItems:"center"},children:[s.jsxs(q,{fontSize:12,mb:.5,sx:{alignSelf:"flex-start"},children:[h,"%"]}),s.jsx(Yt,{variant:"determinate",value:h,sx:{height:8,borderRadius:5,width:"100%"}})]}),s.jsx(q,{variant:"caption",sx:{color:"var(--primary-color)"},children:"(Click to View All)"})]})})]},o)})},Wt=s.jsxs(G,{sx:{display:"flex",flexDirection:"column",gap:2,pt:1},children:[s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Display Format"}),s.jsx(de,{value:me,onChange:e=>He(e.target.value),options:[{label:"Table View",value:"table"},{label:"Calendar View",value:"calendar"}],sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"View"}),s.jsx(de,{value:he,onChange:e=>Oe(e.target.value),options:[{label:"Day",value:"Day"},{label:"Week",value:"Week"},{label:"Month",value:"Month"},{label:"List",value:"List"}],sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Project"}),s.jsx(de,{value:P,onChange:e=>{Ve(e.target.value),Pe(""),Te(""),Ae("")},allOptionLabel:"All Projects",allOptionValue:"",options:Tt.map(e=>({label:e,value:e})),sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Task Type"}),s.jsx(de,{value:W,onChange:e=>{Pe(e.target.value),Te("")},allOptionLabel:"All Task Types",allOptionValue:"",options:kt,sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Task"}),s.jsx(de,{value:R,onChange:e=>Te(e.target.value),allOptionLabel:"All Tasks",allOptionValue:"",options:Nt,sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Employee"}),s.jsx(de,{value:$e,onChange:e=>Ae(e.target.value),allOptionLabel:"All Employees",allOptionValue:"",options:vt.map(e=>({label:e.Emp_Name,value:String(e.Emp_Id)})),sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"From Date"}),s.jsx(st,{type:"date",fullWidth:!0,size:"small",value:ke,onChange:e=>Be(e.target.value),InputLabelProps:{shrink:!0},sx:{"& .MuiInputBase-root":{height:"38px",fontSize:"0.9rem",backgroundColor:"white"}}})]}),s.jsxs(G,{children:[s.jsx(q,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"To Date"}),s.jsx(st,{type:"date",fullWidth:!0,size:"small",value:ve,onChange:e=>Ye(e.target.value),InputLabelProps:{shrink:!0},sx:{"& .MuiInputBase-root":{height:"38px",fontSize:"0.9rem",backgroundColor:"white"}}})]})]});return s.jsxs(s.Fragment,{children:[s.jsx("style",{children:Zt}),s.jsxs("div",{className:"container",children:[s.jsxs("div",{className:"header-panel",children:[s.jsxs("div",{className:"header-title",children:[s.jsx("svg",{viewBox:"0 0 24 24",children:s.jsx("path",{d:"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"})}),"Project Task Comparison"]}),s.jsxs("div",{className:"header-actions",children:[s.jsx(Ee,{variant:"contained",startIcon:s.jsx(at,{}),onClick:It,disabled:S||$.length===0,size:"small",sx:{borderRadius:"20px",textTransform:"none",backgroundColor:"#28a745",flex:"none",height:"36px","&:hover":{backgroundColor:"#218838"}},children:"Excel"}),s.jsx(Ee,{variant:"contained",startIcon:s.jsx(rt,{}),onClick:Ct,disabled:S||$.length===0,size:"small",sx:{borderRadius:"20px",textTransform:"none",backgroundColor:"#dc3545",flex:"none",height:"36px","&:hover":{backgroundColor:"#bb2d3b"}},children:"PDF"}),s.jsx(Qt,{dialogOpen:_t,onOpenDialog:()=>Ne(!0),onCloseDialog:()=>{Ne(!1)},onSearch:Dt,children:Wt}),s.jsx(Rt,{title:"Reset Filters & Refresh",children:s.jsx(Ot,{onClick:jt,sx:{backgroundColor:"#ffffff",border:"1.5px solid #000000",borderRadius:"50%",width:36,height:36,padding:0,"&:hover":{backgroundColor:"#f5f5f5",border:"1.5px solid #000000"},boxShadow:"0 1px 3px rgba(0,0,0,0.12)"},children:s.jsx(Vt,{sx:{fontSize:20,color:"#000000"}})})})]})]}),s.jsxs(G,{sx:{background:"var(--card-bg)",borderRadius:"8px",p:"12px 16px",mb:2,boxShadow:"0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",display:"flex",flexWrap:"wrap",alignItems:"center",gap:1.5},children:[s.jsx(q,{variant:"subtitle2",sx:{fontWeight:700,color:"var(--primary-color)",mr:1},children:"Filter Details:"}),s.jsx(L,{size:"small",label:`Format: ${D.displayFormatLabel}`,sx:{fontWeight:600,bgcolor:"#f5f5f5"}}),s.jsx(L,{size:"small",label:`View: ${D.viewLabel}`,sx:{fontWeight:600,bgcolor:"#e3f2fd",color:"#1565c0"}}),s.jsx(L,{size:"small",label:`Project: ${D.projectLabel}`,sx:{fontWeight:600,bgcolor:"#f5f5f5"}}),s.jsx(L,{size:"small",label:`Task Type: ${D.taskTypeLabel}`,sx:{fontWeight:600,bgcolor:"#f5f5f5"}}),s.jsx(L,{size:"small",label:`Task: ${D.taskLabel}`,sx:{fontWeight:600,bgcolor:"#f5f5f5"}}),s.jsx(L,{size:"small",label:`Employee: ${D.employeeLabel}`,sx:{fontWeight:600,bgcolor:"#f5f5f5"}}),s.jsx(L,{size:"small",label:`From Date: ${D.fromDateLabel}`,sx:{fontWeight:600,bgcolor:"#e8f5e9",color:"#2e7d32"}}),s.jsx(L,{size:"small",label:`To Date: ${D.toDateLabel}`,sx:{fontWeight:600,bgcolor:"#e8f5e9",color:"#2e7d32"}})]}),s.jsxs("div",{className:"summary-stats",style:{flexWrap:"wrap"},children:[s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #1976d2",background:"#f4f9fd"},children:[s.jsx("div",{className:"stat-title",style:{color:"#1565c0",fontWeight:700},children:"Assigned Records"}),s.jsx("div",{className:"stat-value",style:{color:"#1976d2"},children:V.records})]}),s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #1976d2",background:"#f4f9fd"},children:[s.jsx("div",{className:"stat-title",style:{color:"#1565c0",fontWeight:700},children:"Assigned Duration"}),s.jsx("div",{className:"stat-value",style:{color:"#1976d2",fontSize:V.totalDurationStr.length>8?"2.1rem":"2.5rem"},children:V.totalDurationStr})]}),s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #1976d2",background:"#f4f9fd"},children:[s.jsx("div",{className:"stat-title",style:{color:"#1565c0",fontWeight:700},children:"Assigned Avg Duration/Day"}),s.jsx("div",{className:"stat-value",style:{color:"#1976d2",fontSize:V.avgDurationStr.length>8?"2.1rem":"2.5rem"},children:V.avgDurationStr})]}),s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #2e7d32",background:"#f4fbf5"},children:[s.jsx("div",{className:"stat-title",style:{color:"#2e7d32",fontWeight:700},children:"Executed Records"}),s.jsx("div",{className:"stat-value",style:{color:"#2e7d32"},children:B.records})]}),s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #2e7d32",background:"#f4fbf5"},children:[s.jsx("div",{className:"stat-title",style:{color:"#2e7d32",fontWeight:700},children:"Executed Duration"}),s.jsx("div",{className:"stat-value",style:{color:"#2e7d32",fontSize:B.totalDurationStr.length>8?"2.1rem":"2.5rem"},children:B.totalDurationStr})]}),s.jsxs("div",{className:"stat-box",style:{borderLeft:"4px solid #2e7d32",background:"#f4fbf5"},children:[s.jsx("div",{className:"stat-title",style:{color:"#2e7d32",fontWeight:700},children:"Executed Avg Duration/Day"}),s.jsx("div",{className:"stat-value",style:{color:"#2e7d32",fontSize:B.avgDurationStr.length>8?"2.1rem":"2.5rem"},children:B.avgDurationStr})]}),s.jsxs("div",{className:"stat-box blue",children:[s.jsx("div",{className:"stat-title",children:"project Completed"}),s.jsxs("div",{className:"stat-value",children:[X.completed,"%"]})]}),s.jsxs("div",{className:"stat-box green",children:[s.jsx("div",{className:"stat-title",children:"project inprocess"}),s.jsxs("div",{className:"stat-value",children:[X.inprocess,"%"]})]}),s.jsxs("div",{className:"stat-box orange",children:[s.jsx("div",{className:"stat-title",children:"project pending"}),s.jsxs("div",{className:"stat-value",children:[X.pending,"%"]})]})]}),S&&s.jsx("div",{style:{textAlign:"center",margin:"20px"},children:"Loading..."}),!S&&me==="table"&&s.jsx("div",{className:"table-container",children:s.jsxs("table",{children:[N==="Day"&&s.jsxs("thead",{children:[s.jsxs("tr",{children:[s.jsx("th",{className:"bg-default",children:"Date"}),s.jsx("th",{className:"bg-default",children:"Task Name"}),s.jsx("th",{className:"bg-default",children:"Employee"}),s.jsx("th",{className:"bg-assigned text-center",colSpan:4,children:"Assigned Details"}),s.jsx("th",{className:"bg-executed text-center",colSpan:5,children:"Executed Details"})]}),s.jsxs("tr",{children:[s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-assigned border-left",children:"Start Time"}),s.jsx("th",{className:"bg-assigned",children:"End Time"}),s.jsx("th",{className:"bg-assigned",children:"Duration"}),s.jsx("th",{className:"bg-assigned",children:"Status"}),s.jsx("th",{className:"bg-executed border-left",children:"Start Time"}),s.jsx("th",{className:"bg-executed",children:"End Time"}),s.jsx("th",{className:"bg-executed",children:"Duration"}),s.jsx("th",{className:"bg-executed",children:"Status"}),s.jsx("th",{className:"bg-executed",children:"Work Details"})]})]}),s.jsx("tbody",{children:Pt()})]})}),!S&&me==="calendar"&&s.jsx("div",{className:"calendar-container",children:At()}),ft&&s.jsx("div",{className:"modal open",onClick:e=>{e.target===e.currentTarget&&We(!1)},children:s.jsxs("div",{className:"modal-content",children:[s.jsx("span",{className:"close-btn",onClick:()=>We(!1),children:"×"}),s.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap",marginBottom:"12px"},children:[s.jsxs("h2",{style:{margin:0,fontSize:"1.5rem"},children:["Tasks for ",te]}),Y!==""&&s.jsx(L,{label:`Project: ${D.projectLabel}`,sx:{fontSize:"1.5rem",fontWeight:700,height:"auto",py:.25,bgcolor:"#e3f2fd",color:"#1565c0"}}),M!==""&&s.jsx(L,{label:`Task Type: ${D.taskTypeLabel}`,sx:{fontSize:"1.5rem",fontWeight:700,height:"auto",py:.25,bgcolor:"#e3f2fd",color:"#1565c0"}}),J!==""&&s.jsx(L,{label:`Task: ${D.taskLabel}`,sx:{fontSize:"1.5rem",fontWeight:700,height:"auto",py:.25,bgcolor:"#e3f2fd",color:"#1565c0"}}),s.jsx(L,{label:`Employee: ${D.employeeLabel}`,sx:{fontSize:"1.5rem",fontWeight:700,height:"auto",py:.25,bgcolor:"#e3f2fd",color:"#1565c0"}}),s.jsx(Ee,{variant:"contained",startIcon:s.jsx(at,{}),onClick:wt,disabled:Z.length===0,size:"small",sx:{borderRadius:"20px",textTransform:"none",backgroundColor:"#28a745",flex:"none",height:"36px","&:hover":{backgroundColor:"#218838"}},children:"Excel"}),s.jsx(Ee,{variant:"contained",startIcon:s.jsx(rt,{}),onClick:$t,disabled:Z.length===0,size:"small",sx:{borderRadius:"20px",textTransform:"none",backgroundColor:"#dc3545",flex:"none",height:"36px","&:hover":{backgroundColor:"#bb2d3b"}},children:"PDF"})]}),s.jsx("div",{style:{overflowX:"auto"},children:s.jsxs("table",{className:"modal-table",children:[s.jsxs("thead",{children:[s.jsxs("tr",{children:[s.jsx("th",{className:"bg-default",children:"Date"}),s.jsx("th",{className:"bg-default",children:"Task Name"}),s.jsx("th",{className:"bg-default",children:"Employee"}),s.jsx("th",{className:"bg-assigned text-center",colSpan:4,children:"Assigned Details"}),s.jsx("th",{className:"bg-executed text-center",colSpan:5,children:"Executed Details"})]}),s.jsxs("tr",{children:[s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-default"}),s.jsx("th",{className:"bg-assigned border-left",children:"Start Time"}),s.jsx("th",{className:"bg-assigned",children:"End Time"}),s.jsx("th",{className:"bg-assigned",children:"Duration"}),s.jsx("th",{className:"bg-assigned",children:"Status"}),s.jsx("th",{className:"bg-executed border-left",children:"Start Time"}),s.jsx("th",{className:"bg-executed",children:"End Time"}),s.jsx("th",{className:"bg-executed",children:"Duration"}),s.jsx("th",{className:"bg-executed",children:"Status"}),s.jsx("th",{className:"bg-executed",children:"Work Details"})]})]}),s.jsx("tbody",{children:Z.map(tt)})]})})]})})]})]})};export{os as default};
