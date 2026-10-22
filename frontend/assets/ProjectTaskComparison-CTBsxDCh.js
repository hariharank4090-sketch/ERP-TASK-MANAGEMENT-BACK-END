import{j as e,B as C,T as A,n as We,a0 as pt,I as ut,a2 as mt,$ as ht,_ as xe,aP as gt}from"./mui-DEN9m6h-.js";import{r as m}from"./vendor-BIUH9fz7.js";import{x as ft,f as Oe,I as xt,J as bt,K as yt,H as jt,L as kt,S as V}from"./index-CE8RPA7e.js";import{D as St}from"./TopFilterBar-CgtVBll4.js";import"./xlsx-DMLx_f5p.js";import"./appDialog-DknsA4Rw.js";const Tt=`
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
`,b=o=>{if(!o)return"";if(typeof o=="string"){const i=o.trim();if(i.length>=10&&/^\d{4}-\d{2}-\d{2}/.test(i))return i.slice(0,10);if(/^\d{2}-\d{2}-\d{4}/.test(i)){const p=i.slice(0,10).split("-");return`${p[2]}-${p[1]}-${p[0]}`}if(/^\d{2}\/\d{2}\/\d{4}/.test(i)){const p=i.slice(0,10).split("/");return`${p[2]}-${p[1]}-${p[0]}`}}try{const i=typeof o=="string"?new Date(o):o;if(isNaN(i.getTime()))return"";const p=i.getFullYear(),y=String(i.getMonth()+1).padStart(2,"0"),S=String(i.getDate()).padStart(2,"0");return`${p}-${y}-${S}`}catch{return""}},ne=o=>{if(!o)return"";const i=b(o);if(!i)return o;const p=i.split("-");return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:o},le=o=>{if(!o)return new Date;const p=b(o).split("-");return p.length===3?new Date(parseInt(p[0],10),parseInt(p[1],10)-1,parseInt(p[2],10)):new Date(o)},ze=(o,i)=>{const p=new Map;for(const y of o){let S="";if(i==="assigned"){const I=y.Task_Assign_dt?b(y.Task_Assign_dt):"";S=y.Id&&String(y.Id).trim()!==""?String(y.Id).trim():`${y.Task_Id}_${y.Emp_Id}_${I}`}else S=y.Work_Id?.toString()||`${y.Task_Id}_${y.Emp_Id}_${y.Work_Dt||""}`;p.has(S)||p.set(S,y)}return Array.from(p.values())},Dt=o=>{if(!o||typeof o!="string")return null;try{if(o.includes("1970-01-01")||o.includes("1900-01-01")){const i=new Date(o);return isNaN(i.getTime())?null:{hours:i.getUTCHours(),minutes:i.getUTCMinutes(),seconds:i.getUTCSeconds()}}}catch{}return null},ie=o=>{if(!o)return"--:--";try{const i=Dt(o);if(i){const y=i.hours>=12?"PM":"AM";return`${i.hours%12||12}:${String(i.minutes).padStart(2,"0")} ${y}`}if(typeof o=="string"&&o.includes(":")){const[y,S]=o.split(":"),I=parseInt(y,10),M=I>=12?"PM":"AM";return`${I%12||12}:${(S??"00").padStart(2,"0")} ${M}`}const p=new Date(o);if(!isNaN(p.getTime()))return p.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!0})}catch{}return"--:--"},W=o=>{if(!o||o==="-"||o==="--:--")return 9999;const i=o.match(/^(\d+):(\d+)\s*(AM|PM)$/i);if(!i)return 9999;let p=parseInt(i[1],10);const y=parseInt(i[2],10),S=i[3].toUpperCase();return S==="PM"&&p<12&&(p+=12),S==="AM"&&p===12&&(p=0),p*60+y},oe=(o,i)=>o==null||i==null?!1:o==="ALL"||i==="ALL"?!0:Number(o)===Number(i),Le=(o,i)=>{if(!o||o==="-"||o==="--:--"||!i||i==="-"||i==="--:--")return"-";const p=W(o),y=W(i);if(p===9999||y===9999||y<p)return"-";const S=y-p,I=Math.floor(S/60),M=S%60;return I>0?`${I} hr${I>1?"s":""} ${M>0?`${M} min${M>1?"s":""}`:""}`.trim():`${M} min${M>1?"s":""}`},Re={0:{bg:"#ffc107",label:"New",color:"#000",class:"chip-new"},1:{bg:"#ffc107",label:"New",color:"#000",class:"chip-new"},2:{bg:"#1976d2",label:"In Progress",color:"#fff",class:"chip-progress"},3:{bg:"#4caf50",label:"Completed",color:"#fff",class:"chip-completed"}},vt=o=>{const i=String(o??"").toLowerCase();return i==="3"||i==="completed"?{bg:"#4caf50",label:"Completed",color:"#fff",class:"chip-completed"}:i==="2"||i==="pending"?{bg:"#ff9800",label:"Pending",color:"#fff",class:"chip-pending"}:i==="1"||i==="in progress"||i==="inprocess"?{bg:"#1976d2",label:"In Progress",color:"#fff",class:"chip-progress"}:{bg:"#9e9e9e",label:String(o??""),color:"#fff",class:"chip-pending"}},Nt=o=>{if(!o)return"--";let i=o;try{const p=JSON.parse(o);typeof p=="string"&&(i=p)}catch{}return i.replace(/\\n/g,`
`)};let H=null;const Mt=()=>{const{token:o,currentCompany:i,isSwitchingCompany:p}=ft(),[y,S]=m.useState(!0),[,I]=m.useState(!1),[M,Ve]=m.useState([]),[be,Be]=m.useState([]),[K,ye]=m.useState("Day"),[D,je]=m.useState(""),[ce,de]=m.useState(""),[v,pe]=m.useState(""),[_,U]=m.useState(""),[J,ke]=m.useState(()=>b(new Date)),[Q,Se]=m.useState(()=>b(new Date)),[ue,Te]=m.useState("table"),[me,Ye]=m.useState([]),[X,qe]=m.useState([]),[O,De]=m.useState(""),[Z,ve]=m.useState(""),[ee,Ne]=m.useState(""),[he,_e]=m.useState(""),[P,Ie]=m.useState(()=>b(new Date)),[B,we]=m.useState(()=>b(new Date)),[N,Ee]=m.useState("Day"),[Ge,ge]=m.useState(!1),[He,Ke]=m.useState(""),[Ue,Je]=m.useState([]),[te,Qe]=m.useState([]),[Xe,se]=m.useState(!1),Ce=m.useCallback((s,n,t)=>{const l=b(n)||b(new Date),a=l?le(l):new Date,r=new Date(a.getFullYear(),a.getMonth(),a.getDate());if(s==="Week"){const d=new Date(r);d.setDate(r.getDate()-r.getDay());const h=new Date(d);return h.setDate(d.getDate()+6),{fromDate:b(d),toDate:b(h)}}if(s==="Month"){const d=new Date(r.getFullYear(),r.getMonth(),1),h=new Date(r.getFullYear(),r.getMonth()+1,0);return{fromDate:b(d),toDate:b(h)}}if(s==="Over All")return{fromDate:"",toDate:""};const c=b(n)||b(new Date),u=b(t)||c;return{fromDate:c,toDate:u}},[]),R=m.useCallback(async(s=!1,n,t,l)=>{if(!o||!i?.companyId){S(!1),I(!1);return}try{s?(I(!0),H=null):S(!0),H||(H=Oe({address:"masters/taskType/",method:"GET"}));const a=l??N,r=n??P,c=t??B,{fromDate:u,toDate:d}=Ce(a,r,c),h={},j={};u&&(h.from_Task_Assign_dt=u),d&&(h.to_Task_Assign_dt=d),u&&(j.fromDate=u),d&&(j.toDate=d);const[f,x,g,k,T]=await Promise.all([xt(h,i.companyId),bt(j),yt().catch(()=>Oe({address:"masters/projectSchedule/",method:"GET"})),jt(i.companyId),H]);let E=[];f?.data&&Array.isArray(f.data)?E=f.data:f?.items&&Array.isArray(f.items)?E=f.items:Array.isArray(f)&&(E=f);let L=[];x?.data?.items&&Array.isArray(x.data.items)?L=x.data.items:x?.data&&Array.isArray(x.data)?L=x.data:x?.items&&Array.isArray(x.items)?L=x.items:Array.isArray(x)&&(L=x);let q=[];Array.isArray(g)?q=g:g?.data&&Array.isArray(g.data)?q=g.data:g?.data?.data&&Array.isArray(g.data.data)?q=g.data.data:g?.items&&Array.isArray(g.items)&&(q=g.items);let G=[];Array.isArray(k)?G=k:k?.data&&Array.isArray(k.data)?G=k.data:k?.items&&Array.isArray(k.items)&&(G=k.items),Ye(G);let ae=[];T?.data&&Array.isArray(T.data)?ae=T.data:T?.items&&Array.isArray(T.items)?ae=T.items:Array.isArray(T)&&(ae=T),qe(ae);const re=new Set(G.map($=>Number($.Emp_Id))),Fe=ze(E,"assigned"),ot=re.size>0?Fe.filter($=>re.has(Number($.Emp_Id))):Fe,ct=L.map($=>({...$,Task_Name:$.taskDetails?.Task_Name||$.Task_Name||`Task ${$.Task_Id}`})),Pe=ze(ct,"executed"),dt=re.size>0?Pe.filter($=>re.has(Number($.Emp_Id))):Pe;Ve(ot),Be(dt),Qe(q)}catch(a){console.error("Error loading task comparison data:",a)}finally{S(!1),I(!1)}},[o,i?.companyId,N,P,B,Ce]),Ze=m.useCallback(()=>{S(!0),De(D),ve(ce),Ne(v),_e(_),Ie(J),we(Q),Ee(K),R(!1,J,Q,K),se(!1)},[D,ce,v,_,J,Q,K,R]),et=m.useCallback(()=>{const s=b(new Date);ye("Day"),je(""),de(""),pe(""),U(""),ke(s),Se(s),Te("table"),De(""),ve(""),Ne(""),_e(""),Ie(s),we(s),Ee("Day"),R(!1,s,s,"Day"),se(!1)},[R]);m.useEffect(()=>{if(!p)return R(),()=>{H=null}},[R,p]);const w=m.useMemo(()=>{const s=new Map;return M.filter(t=>!kt(t,te)).forEach(t=>{const l=b(t.Task_Assign_dt||t.Schedule_Sch_Date||t.Sch_Date||t.Schedule_Sch_Start_Date);if(!l)return;const a=String(t.Sch_Id||""),r=String(t.Task_Id||""),c=Number(t.Emp_Id),u=`${l}_${r}_${a}_${c}`,d=Re[Number(t.Invovled_Stat??0)]??Re[0];s.set(u,{key:u,dateStr:ne(l),dateObj:le(l),taskId:t.Task_Id,schId:t.Sch_Id,taskName:t.taskDetails?.Task_Name||t.Task_Name||`Task ${t.Task_Id}`,empId:t.Emp_Id,empName:t.Emp_Name||"",projectName:t.Project_Name||"",taskTypeId:t.Task_Type_Id||t.taskDetails?.Task_Type_Id||null,taskTypeName:t.Task_Type||t.taskDetails?.Task_Type||"",projectId:t.Project_Id||t.taskDetails?.Project_Id||null,assignedStartTime:ie(t.Sch_Time),assignedEndTime:ie(t.EN_Time),assignedStatus:d.label,assignedStatusClass:d.class,executedStartTime:"-",executedEndTime:"-",executedDuration:"-",executedStatus:"-",executedStatusClass:"",workDetails:"-"})}),be.forEach(t=>{const l=b(t.Work_Dt||t.workDate||t.Work_Date);if(!l)return;const a=String(t.Sch_Id||""),r=String(t.Task_Id||""),c=Number(t.Emp_Id),u=vt(t.Work_Status),d=ie(t.Start_Time||t.Sch_Est_Start_Time),h=ie(t.End_Time||t.Sch_Est_End_Time),j=Nt(t.Work_Done);let f=null;const x=`${l}_${r}_${a}_${c}`;if(s.has(x))f=x;else for(const[g,k]of s.entries())if(b(k.dateObj)===l&&Number(k.empId)===c){const E=a&&k.schId&&a===String(k.schId),L=r&&k.taskId&&r===String(k.taskId);if(E||L){f=g;break}}if(f&&s.has(f)){const g=s.get(f);g.executedStartTime=d,g.executedEndTime=h,g.executedDuration=Le(d,h),g.executedStatus=u.label,g.executedStatusClass=u.class,g.workDetails=j,g.taskTypeId||(g.taskTypeId=t.Task_Type_Id||t.taskDetails?.Task_Type_Id||null),g.taskTypeName||(g.taskTypeName=t.Task_Type||t.taskDetails?.Task_Type||""),g.projectId||(g.projectId=t.Project_Id||t.taskDetails?.Project_Id||null)}else{const g=`exec_${l}_${r}_${a}_${c}_${t.Work_Id||Math.random()}`;s.set(g,{key:g,dateStr:ne(l),dateObj:le(l),taskId:t.Task_Id,schId:t.Sch_Id,taskName:t.taskDetails?.Task_Name||t.Task_Name||`Task ${t.Task_Id}`,empId:t.Emp_Id,empName:t.Emp_Name||"",projectName:t.Project_Name||t.taskDetails?.Project_Name||"",taskTypeId:t.Task_Type_Id||t.taskDetails?.Task_Type_Id||null,taskTypeName:t.Task_Type||t.taskDetails?.Task_Type||"",projectId:t.Project_Id||t.taskDetails?.Project_Id||null,assignedStartTime:"-",assignedEndTime:"-",assignedStatus:"-",assignedStatusClass:"",executedStartTime:d,executedEndTime:h,executedDuration:Le(d,h),executedStatus:u.label,executedStatusClass:u.class,workDetails:j})}}),Array.from(s.values()).sort((t,l)=>{const a=l.dateObj.getTime()-t.dateObj.getTime();if(a!==0)return a;const r=W(t.executedStartTime!=="-"?t.executedStartTime:t.assignedStartTime),c=W(l.executedStartTime!=="-"?l.executedStartTime:l.assignedStartTime);if(r!==9999&&c!==9999&&r!==c)return r-c;if(r===9999)return 1;if(c===9999)return-1;const u=W(t.executedEndTime!=="-"?t.executedEndTime:t.assignedEndTime),d=W(l.executedEndTime!=="-"?l.executedEndTime:l.assignedEndTime);return u!==9999&&d!==9999&&u!==d?u-d:0})},[M,be,te]),tt=m.useMemo(()=>{const s=new Set;return w.forEach(n=>{let t=!0;v!==""&&(t=oe(n.taskTypeId,v)||String(n.taskTypeName).toLowerCase()===String(v).toLowerCase());let l=!0;_!==""&&(l=String(n.taskId)===_),t&&l&&n.projectName&&s.add(n.projectName)}),Array.from(s)},[w,v,_]),Y=m.useMemo(()=>{if(!D)return null;const s=w.find(n=>n.projectName===D);return s?s.projectId:null},[D,w]),st=m.useMemo(()=>{const s=new Set;w.forEach(t=>{let l=!0;D!==""&&(l=t.projectName===D);let a=!0;_!==""&&(a=String(t.taskId)===_),l&&a&&(t.taskTypeId&&s.add(String(t.taskTypeId)),t.taskTypeName&&s.add(String(t.taskTypeName).toLowerCase()))});let n=X.filter(t=>Y&&String(t.Project_Id)!==String(Y)?!1:s.has(String(t.Task_Type_Id))||s.has(String(t.Task_Type).toLowerCase()));return n.length===0&&(Y?n=X.filter(t=>String(t.Project_Id)===String(Y)):n=X),n.map(t=>({label:t.Task_Type,value:String(t.Task_Type_Id)}))},[w,D,_,X,Y]),at=m.useMemo(()=>{const s=new Set;return w.forEach(n=>{let t=!0;D!==""&&(t=n.projectName===D);let l=!0;v!==""&&(l=oe(n.taskTypeId,v)||String(n.taskTypeName).toLowerCase()===String(v).toLowerCase());let a=!0;_!==""&&(a=String(n.taskId)===_),t&&l&&a&&s.add(n.empId.toString())}),D===""&&v===""&&_===""?me:me.filter(n=>s.has(n.Emp_Id?.toString()))},[me,D,v,_,w]),rt=m.useMemo(()=>{const s=new Map;return w.forEach(n=>{let t=!0;D!==""&&(t=n.projectName===D);let l=!0;v!==""&&(l=oe(n.taskTypeId,v)||String(n.taskTypeName).toLowerCase()===String(v).toLowerCase()),t&&l&&n.taskId&&n.taskName&&s.set(String(n.taskId),n.taskName)}),Array.from(s.entries()).map(([n,t])=>({value:n,label:t}))},[w,D,v]),Ae=m.useCallback(()=>{const s=P?le(P):new Date,n=new Date(s.getFullYear(),s.getMonth(),s.getDate()),t=new Date(n);t.setDate(n.getDate()-n.getDay());const l=new Date(t);l.setDate(t.getDate()+6);const a=new Date(n.getFullYear(),n.getMonth(),1),r=new Date(n.getFullYear(),n.getMonth()+1,0);return{today:n,startOfWeek:t,endOfWeek:l,startOfMonth:a,endOfMonth:r}},[P]),F=m.useMemo(()=>{const{startOfWeek:s,endOfWeek:n,startOfMonth:t,endOfMonth:l}=Ae();return w.filter(a=>{let r=!0;const c=b(a.dateObj);if(N==="Day"){const f=b(P),x=b(B)||f;f&&c<f&&(r=!1),x&&c>x&&(r=!1)}else if(N==="List"){const f=b(P),x=b(B);f&&c<f&&(r=!1),x&&c>x&&(r=!1)}else if(N==="Week"){const f=b(s),x=b(n);f&&c<f&&(r=!1),x&&c>x&&(r=!1)}else if(N==="Month"){const f=b(t),x=b(l);f&&c<f&&(r=!1),x&&c>x&&(r=!1)}else N==="Over All"&&(r=!0);let u=!0;O!==""&&(u=a.projectName===O);let d=!0;Z!==""&&(d=a.empId.toString()===Z.toString());let h=!0;ee!==""&&(h=oe(a.taskTypeId,ee)||String(a.taskTypeName).toLowerCase()===String(ee).toLowerCase());let j=!0;return he!==""&&(j=String(a.taskId)===he),r&&u&&d&&h&&j})},[w,N,O,Z,P,B,ee,he]),fe=m.useMemo(()=>{let s=0,n=0,t=0,l=te;O!==""&&(l=l.filter(r=>r.Project_Name===O||r.projectName===O));const a=l.length;return l.forEach(r=>{const c=Number(r.schStatus||r.Sch_Status);c===3?s++:c===1?n++:c===2&&t++}),a===0?{completed:0,inprocess:0,pending:0}:{completed:Math.round(s/a*100),inprocess:Math.round(n/a*100),pending:Math.round(t/a*100)}},[te,O]),Me=m.useMemo(()=>{let s=0;if(F.forEach(l=>{const a=W(l.executedStartTime),r=W(l.executedEndTime);a!==9999&&r!==9999&&r>=a&&(s+=r-a)}),s===0)return"0m";const n=Math.floor(s/60),t=s%60;return n>0?`${n}h ${t>0?`${t}m`:""}`.trim():`${t}m`},[F]),z=(s,n)=>{Ke(s),Je(n),ge(!0)},nt=()=>{const{startOfWeek:s,startOfMonth:n}=Ae(),t=new Map;F.forEach(a=>{t.has(a.dateStr)||t.set(a.dateStr,[]),t.get(a.dateStr).push(a)});const l=a=>{let r=a.executedStatus;return(r==="-"||r==="--"||r==="")&&(r=a.assignedStatus),r=r.toLowerCase(),r.includes("completed")?"completed":r.includes("in progress")?"in-progress":r.includes("pending")?"pending":"none"};if(N==="Day")return F.length===0?e.jsx("div",{style:{padding:16,textAlign:"center",color:"#757575"},children:"No tasks found."}):e.jsx("div",{className:"calendar-list-view",children:F.map(a=>{const r=l(a),c=r==="completed"?"chip-completed":r==="in-progress"?"chip-progress":"chip-pending",u=a.executedStatus!=="-"&&a.executedStatus!=="--"&&a.executedStatus!==""?a.executedStatus:a.assignedStatus;return e.jsxs("div",{className:"calendar-list-item",onClick:()=>z(a.dateStr,[a]),style:{cursor:"pointer"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("strong",{style:{color:"var(--primary-color)",fontSize:"1.1rem"},children:a.taskName}),e.jsxs("span",{style:{color:"#757575",fontSize:"0.85rem"},children:["Project: ",a.projectName," | Employee: ",a.empName," | Date: ",a.dateStr]})]}),e.jsx("div",{children:e.jsx("span",{className:`chip ${c}`,children:u})})]},a.key)})});if(N==="List"||N==="Over All")return F.length===0?e.jsx("div",{style:{padding:16,textAlign:"center",color:"#757575"},children:"No tasks found."}):e.jsx("div",{className:"calendar-list-view",children:Array.from(t.entries()).map(([a,r])=>{let c=0,u=0,d=0;return r.forEach(h=>{const j=l(h);j==="completed"?c++:j==="in-progress"?u++:j==="pending"&&d++}),e.jsxs("div",{className:"calendar-list-item",style:{cursor:"pointer"},onClick:()=>z(a,r),children:[e.jsxs("div",{children:[e.jsx("strong",{style:{color:"var(--primary-color)",fontSize:"1.1rem"},children:a}),e.jsxs("span",{style:{color:"#757575",fontSize:"0.85rem",marginLeft:8},children:["Total Tasks: ",r.length]})]}),e.jsxs("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[c>0&&e.jsxs("span",{className:"chip chip-completed",children:["Completed: ",c]}),u>0&&e.jsxs("span",{className:"chip chip-progress",children:["In Process: ",u]}),d>0&&e.jsxs("span",{className:"chip chip-pending",children:["Pending: ",d]})]})]},a)})});if(N==="Week"){const a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],r=[];for(let c=0;c<7;c++){const u=new Date(s);u.setDate(s.getDate()+c);const d=ne(b(u)),h=t.get(d)||[];let j=0,f=0,x=0;h.forEach(g=>{const k=l(g);k==="completed"?j++:k==="in-progress"?f++:k==="pending"&&x++}),r.push(e.jsxs("div",{className:`calendar-cell ${h.length===0?"empty":""}`,style:h.length>0?{cursor:"pointer"}:{},onClick:()=>{h.length>0&&z(d,h)},children:[e.jsx("div",{className:"date-label",children:d}),h.length>0&&e.jsxs("div",{style:{fontSize:"0.7rem",marginBottom:6,display:"flex",gap:4,flexWrap:"wrap"},children:[e.jsxs("span",{style:{background:"var(--completed-color)",color:"#1e4620",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Completed: ",j]}),e.jsxs("span",{style:{background:"var(--inprocess-color)",color:"#004085",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["In Process: ",f]}),e.jsxs("span",{style:{background:"var(--pending-color)",color:"#856404",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Pending: ",x]})]}),h.map(g=>e.jsx("div",{className:`calendar-task ${l(g)}`,title:g.taskName,onClick:k=>{k.stopPropagation(),z(d,[g])},children:g.taskName},g.key))]},c))}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"calendar-header",children:a.map(c=>e.jsx("div",{children:c},c))}),e.jsx("div",{className:"calendar-grid",children:r})]})}else if(N==="Month"){const a=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],r=new Date(n);r.setDate(1-n.getDay());const c=[];for(let u=0;u<35;u++){const d=new Date(r);d.setDate(r.getDate()+u);const h=ne(b(d)),j=t.get(h)||[],f=d.getMonth()!==n.getMonth();let x=0,g=0,k=0;j.forEach(T=>{const E=l(T);E==="completed"?x++:E==="in-progress"?g++:E==="pending"&&k++}),c.push(e.jsxs("div",{className:`calendar-cell ${j.length===0?"empty":""}`,style:{opacity:f?.5:1,cursor:j.length>0?"pointer":"default"},onClick:()=>{j.length>0&&z(h,j)},children:[e.jsx("div",{className:"date-label",children:d.getDate()}),j.length>0&&e.jsxs("div",{style:{fontSize:"0.7rem",marginBottom:6,display:"flex",gap:4,flexWrap:"wrap"},children:[e.jsxs("span",{style:{background:"var(--completed-color)",color:"#1e4620",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Completed: ",x]}),e.jsxs("span",{style:{background:"var(--inprocess-color)",color:"#004085",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["In Process: ",g]}),e.jsxs("span",{style:{background:"var(--pending-color)",color:"#856404",padding:"2px 4px",borderRadius:3,fontWeight:"bold"},children:["Pending: ",k]})]}),j.map(T=>e.jsx("div",{className:`calendar-task ${l(T)}`,title:T.taskName,onClick:E=>{E.stopPropagation(),z(h,[T])},children:T.taskName},T.key))]},u))}return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"calendar-header",children:a.map(u=>e.jsx("div",{children:u},u))}),e.jsx("div",{className:"calendar-grid",children:c})]})}return null},$e=s=>e.jsxs("tr",{children:[e.jsx("td",{children:s.dateStr}),e.jsx("td",{className:"task-name-cell",title:s.taskName,children:s.taskName}),e.jsx("td",{children:s.empName}),e.jsx("td",{className:"border-left",children:s.assignedStartTime}),e.jsx("td",{children:s.assignedEndTime}),e.jsx("td",{children:s.assignedStatus!=="-"&&s.assignedStatus!=="--"?e.jsx("span",{className:`chip ${s.assignedStatusClass}`,children:s.assignedStatus}):"-"}),e.jsx("td",{className:"border-left",children:s.executedStartTime}),e.jsx("td",{children:s.executedEndTime}),e.jsx("td",{children:s.executedDuration}),e.jsx("td",{children:s.executedStatus!=="-"?e.jsx("span",{className:`chip ${s.executedStatusClass}`,children:s.executedStatus}):"-"}),e.jsx("td",{className:"work-details",title:s.workDetails,children:s.workDetails})]},s.key),lt=()=>{if(N==="Day")return F.map($e);const s=new Map;return F.forEach(n=>{s.has(n.dateStr)||s.set(n.dateStr,[]),s.get(n.dateStr).push(n)}),Array.from(s.entries()).map(([n,t])=>{let l=0,a=0,r=0;t.forEach(d=>{let h=d.executedStatus;(h==="-"||h==="--"||h==="")&&(h=d.assignedStatus),h=h.toLowerCase(),h.includes("completed")?l++:h.includes("in progress")?a++:h.includes("pending")&&r++});const c=l+r+a,u=c===0?0:Math.round(l/c*100);return e.jsxs("tr",{className:"dynamic-group-row",style:{cursor:"pointer"},onClick:()=>z(n,t),children:[e.jsx("td",{style:{verticalAlign:"middle",fontWeight:600},children:n}),e.jsx("td",{colSpan:9,style:{padding:"8px 16px"},children:e.jsxs(C,{sx:{display:"flex",alignItems:"center",gap:3,flexWrap:"wrap",justifyContent:"center"},children:[e.jsxs(A,{variant:"body2",sx:{fontWeight:600,color:"var(--text-main)"},children:["Total Tasks: ",t.length]}),e.jsxs(ht,{direction:"row",spacing:1,children:[e.jsx(xe,{label:`Completed (${l})`,sx:{background:"#2e7d32",color:"#fff",fontWeight:600},size:"small"}),e.jsx(xe,{label:`Pending (${r})`,sx:{background:"#ed6c02",color:"#fff",fontWeight:600},size:"small"}),e.jsx(xe,{label:`In Progress (${a})`,sx:{background:"#0288d1",color:"#fff",fontWeight:600},size:"small"})]}),e.jsxs(C,{sx:{width:160,display:"flex",flexDirection:"column",alignItems:"center"},children:[e.jsxs(A,{fontSize:12,mb:.5,sx:{alignSelf:"flex-start"},children:[u,"%"]}),e.jsx(gt,{variant:"determinate",value:u,sx:{height:8,borderRadius:5,width:"100%"}})]}),e.jsx(A,{variant:"caption",sx:{color:"var(--primary-color)"},children:"(Click to View All)"})]})})]},n)})},it=e.jsxs(C,{sx:{display:"flex",flexDirection:"column",gap:2,pt:1},children:[e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Display Format"}),e.jsx(V,{value:ue,onChange:s=>Te(s.target.value),options:[{label:"Table View",value:"table"},{label:"Calendar View",value:"calendar"}],sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"View"}),e.jsx(V,{value:K,onChange:s=>ye(s.target.value),options:[{label:"Day",value:"Day"},{label:"Week",value:"Week"},{label:"Month",value:"Month"},{label:"List",value:"List"}],sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Project"}),e.jsx(V,{value:D,onChange:s=>{je(s.target.value),pe(""),U(""),de("")},allOptionLabel:"All Projects",allOptionValue:"",options:tt.map(s=>({label:s,value:s})),sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Task Type"}),e.jsx(V,{value:v,onChange:s=>{pe(s.target.value),U("")},allOptionLabel:"All Task Types",allOptionValue:"",options:st,sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Task"}),e.jsx(V,{value:_,onChange:s=>U(s.target.value),allOptionLabel:"All Tasks",allOptionValue:"",options:rt,sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"Select Employee"}),e.jsx(V,{value:ce,onChange:s=>de(s.target.value),allOptionLabel:"All Employees",allOptionValue:"",options:at.map(s=>({label:s.Emp_Name,value:String(s.Emp_Id)})),sx:{height:"38px",bgcolor:"white",width:"100%","& .MuiSelect-select":{padding:"8px 12px",fontSize:"0.9rem"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"From Date"}),e.jsx(We,{type:"date",fullWidth:!0,size:"small",value:J,onChange:s=>ke(s.target.value),InputLabelProps:{shrink:!0},sx:{"& .MuiInputBase-root":{height:"38px",fontSize:"0.9rem",backgroundColor:"white"}}})]}),e.jsxs(C,{children:[e.jsx(A,{variant:"caption",sx:{fontWeight:600,mb:.5,display:"block"},children:"To Date"}),e.jsx(We,{type:"date",fullWidth:!0,size:"small",value:Q,onChange:s=>Se(s.target.value),InputLabelProps:{shrink:!0},sx:{"& .MuiInputBase-root":{height:"38px",fontSize:"0.9rem",backgroundColor:"white"}}})]})]});return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Tt}),e.jsxs("div",{className:"container",children:[e.jsxs("div",{className:"header-panel",children:[e.jsxs("div",{className:"header-title",children:[e.jsx("svg",{viewBox:"0 0 24 24",children:e.jsx("path",{d:"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"})}),"Project Task Comparison"]}),e.jsxs("div",{className:"header-actions",children:[e.jsx(St,{dialogOpen:Xe,onOpenDialog:()=>se(!0),onCloseDialog:()=>{se(!1)},onSearch:Ze,children:it}),e.jsx(pt,{title:"Reset Filters & Refresh",children:e.jsx(ut,{onClick:et,sx:{backgroundColor:"#ffffff",border:"1.5px solid #000000",borderRadius:"50%",width:36,height:36,padding:0,"&:hover":{backgroundColor:"#f5f5f5",border:"1.5px solid #000000"},boxShadow:"0 1px 3px rgba(0,0,0,0.12)"},children:e.jsx(mt,{sx:{fontSize:20,color:"#000000"}})})})]})]}),e.jsxs("div",{className:"summary-stats",children:[e.jsxs("div",{className:"stat-box purple",children:[e.jsx("div",{className:"stat-title",children:"Total Records"}),e.jsx("div",{className:"stat-value",children:F.length})]}),Z!==""&&e.jsxs("div",{className:"stat-box teal",children:[e.jsx("div",{className:"stat-title",children:"Total Duration"}),e.jsx("div",{className:"stat-value",style:{fontSize:Me.length>8?"2.1rem":"2.5rem"},children:Me})]}),e.jsxs("div",{className:"stat-box blue",children:[e.jsx("div",{className:"stat-title",children:"project Completed"}),e.jsxs("div",{className:"stat-value",children:[fe.completed,"%"]})]}),e.jsxs("div",{className:"stat-box green",children:[e.jsx("div",{className:"stat-title",children:"project inprocess"}),e.jsxs("div",{className:"stat-value",children:[fe.inprocess,"%"]})]}),e.jsxs("div",{className:"stat-box orange",children:[e.jsx("div",{className:"stat-title",children:"project pending"}),e.jsxs("div",{className:"stat-value",children:[fe.pending,"%"]})]})]}),y&&e.jsx("div",{style:{textAlign:"center",margin:"20px"},children:"Loading..."}),!y&&ue==="table"&&e.jsx("div",{className:"table-container",children:e.jsxs("table",{children:[N==="Day"&&e.jsxs("thead",{children:[e.jsxs("tr",{children:[e.jsx("th",{className:"bg-default",children:"Date"}),e.jsx("th",{className:"bg-default",children:"Task Name"}),e.jsx("th",{className:"bg-default",children:"Employee"}),e.jsx("th",{className:"bg-assigned text-center",colSpan:3,children:"Assigned Details"}),e.jsx("th",{className:"bg-executed text-center",colSpan:5,children:"Executed Details"})]}),e.jsxs("tr",{children:[e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-assigned border-left",children:"Start Time"}),e.jsx("th",{className:"bg-assigned",children:"End Time"}),e.jsx("th",{className:"bg-assigned",children:"Status"}),e.jsx("th",{className:"bg-executed border-left",children:"Start Time"}),e.jsx("th",{className:"bg-executed",children:"End Time"}),e.jsx("th",{className:"bg-executed",children:"Duration"}),e.jsx("th",{className:"bg-executed",children:"Status"}),e.jsx("th",{className:"bg-executed",children:"Work Details"})]})]}),e.jsx("tbody",{children:lt()})]})}),!y&&ue==="calendar"&&e.jsx("div",{className:"calendar-container",children:nt()}),Ge&&e.jsx("div",{className:"modal open",onClick:s=>{s.target===s.currentTarget&&ge(!1)},children:e.jsxs("div",{className:"modal-content",children:[e.jsx("span",{className:"close-btn",onClick:()=>ge(!1),children:"×"}),e.jsxs("h2",{style:{marginTop:0},children:["Tasks for ",He]}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{className:"modal-table",children:[e.jsxs("thead",{children:[e.jsxs("tr",{children:[e.jsx("th",{className:"bg-default",children:"Date"}),e.jsx("th",{className:"bg-default",children:"Task Name"}),e.jsx("th",{className:"bg-default",children:"Employee"}),e.jsx("th",{className:"bg-assigned text-center",colSpan:3,children:"Assigned Details"}),e.jsx("th",{className:"bg-executed text-center",colSpan:5,children:"Executed Details"})]}),e.jsxs("tr",{children:[e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-default"}),e.jsx("th",{className:"bg-assigned border-left",children:"Start Time"}),e.jsx("th",{className:"bg-assigned",children:"End Time"}),e.jsx("th",{className:"bg-assigned",children:"Status"}),e.jsx("th",{className:"bg-executed border-left",children:"Start Time"}),e.jsx("th",{className:"bg-executed",children:"End Time"}),e.jsx("th",{className:"bg-executed",children:"Duration"}),e.jsx("th",{className:"bg-executed",children:"Status"}),e.jsx("th",{className:"bg-executed",children:"Work Details"})]})]}),e.jsx("tbody",{children:Ue.map($e)})]})})]})})]})]})};export{Mt as default};
