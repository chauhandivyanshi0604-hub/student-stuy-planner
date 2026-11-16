const STORAGE_KEY = "studyhub_v2_data";
const defaultData = {
  name: "Student", theme: "light",
  tasks: [
    {id:1,title:"Revise C++ functions",description:"Go through function types and examples.",priority:"High",due:"Today",done:false},
    {id:2,title:"Complete mathematics tutorial",description:"Solve the double integration questions.",priority:"Medium",due:"Today",done:false},
    {id:3,title:"Review digital logic notes",description:"Revise combinational circuits.",priority:"Low",due:"Tomorrow",done:true}
  ],
  classes: [
    {id:11,day:"Monday",time:"09:00",subject:"Programming in C++",room:"Lab 204"},
    {id:12,day:"Monday",time:"11:00",subject:"Engineering Mathematics",room:"Room 302"},
    {id:13,day:"Monday",time:"13:00",subject:"Digital Logic Design",room:"Room 105"},
    {id:14,day:"Tuesday",time:"10:00",subject:"Data Structures",room:"Room 201"},
    {id:15,day:"Wednesday",time:"09:00",subject:"Engineering Physics",room:"Lab 1"},
    {id:16,day:"Thursday",time:"12:00",subject:"Programming in C++",room:"Room 204"},
    {id:17,day:"Friday",time:"11:00",subject:"Digital Logic Design",room:"Room 105"}
  ],
  assignments:[
    {id:21,title:"C++ function worksheet",subject:"Programming in C++",due:"2026-11-20",details:"Complete questions on functions and recursion.",done:false},
    {id:22,title:"Double integrals practice",subject:"Engineering Mathematics",due:"2026-11-22",details:"Solve the assigned tutorial problems.",done:false},
    {id:23,title:"Logic gates record",subject:"Digital Logic Design",due:"2026-11-18",details:"Finish the circuit diagrams and observations.",done:true}
  ],
  subjects:[
    {id:31,name:"Programming in C++",attended:18,total:22},
    {id:32,name:"Engineering Mathematics",attended:16,total:20},
    {id:33,name:"Digital Logic Design",attended:20,total:24},
    {id:34,name:"Engineering Physics",attended:14,total:18}
  ],
  notes:[
    {id:41,title:"C++ — Functions",body:"A function is a reusable block of code that performs a specific task. Remember: declaration, definition and function call.",color:"#9b8bf0",date:"Today"},
    {id:42,title:"Maths reminders",body:"Practise changing the order of integration. Draw the region carefully before changing limits.",color:"#f1ae87",date:"Yesterday"},
    {id:43,title:"Ideas to explore",body:"Build a personal portfolio, a quiz app and a student dashboard using HTML, CSS and JavaScript.",color:"#65c9ac",date:"This week"}
  ],
  focusMinutes:0, sessions:0
};
let data = loadData();
let currentPage = "overview";
let selectedDay = "Monday";
let timerDuration = 25*60, timerRemaining = 25*60, timerInterval = null, timerRunning = false, activeMode = "focus";
let editingId = null, modalType = null;

function loadData(){try{return {...structuredClone(defaultData),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch(e){return structuredClone(defaultData)}}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function $(id){return document.getElementById(id)}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function dateLabel(){return new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"}).format(new Date())}
function showPage(page){currentPage=page;document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active-page",p.id===`page-${page}`));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("breadcrumbPage").textContent=page==="overview"?"Overview":page.charAt(0).toUpperCase()+page.slice(1);$("sidebar").classList.remove("open");renderPage(page);window.scrollTo({top:0,behavior:"smooth"})}
function renderPage(page){if(page==="overview")renderOverview();if(page==="tasks")renderTasks();if(page==="timetable")renderTimetable();if(page==="assignments")renderAssignments();if(page==="attendance")renderAttendance();if(page==="focus")renderFocus();if(page==="notes")renderNotes();if(page==="progress")renderProgress();if(page==="settings")renderSettings()}
function completedTasks(){return data.tasks.filter(t=>t.done).length}
function attendanceAverage(){let total=data.subjects.reduce((a,s)=>a+s.total,0),att=data.subjects.reduce((a,s)=>a+s.attended,0);return total?Math.round(att/total*100):null}
function renderOverview(){
  const done=completedTasks(),total=data.tasks.length,pct=total?Math.round(done/total*100):0;
  $("welcomeTitle").innerHTML=`Make today <span>count.</span>`;$("statTasks").textContent=done;$("taskProgressBar").style.width=pct+"%";$("taskProgressText").textContent=`${pct}% of your tasks`;
  $("statFocus").textContent=data.focusMinutes;$("statAssignments").textContent=data.assignments.filter(a=>!a.done).length;
  const avg=attendanceAverage();$("statAttendance").textContent=avg===null?"—":avg;$("attendanceUnit").textContent=avg===null?"":"%";
  $("sideTaskCount").textContent=data.tasks.filter(t=>!t.done).length;$("miniName").textContent=data.name;$("miniAvatar").textContent=(data.name||"S")[0].toUpperCase();$("topAvatar").textContent=(data.name||"S")[0].toUpperCase();
  const list=data.tasks.filter(t=>!t.done).slice(0,4);
  $("overviewTasks").innerHTML=list.length?list.map(t=>`<div class="priority-item"><button class="check-circle" data-toggle-task="${t.id}" aria-label="Complete task"></button><div class="priority-info"><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.due||"No due date")}</small></div><span class="priority-tag ${t.priority.toLowerCase()}">${escapeHTML(t.priority)}</span></div>`).join(""):`<div class="empty-state">All caught up! Add a task when you're ready ✦</div>`;
  const today=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
  const classes=data.classes.filter(c=>c.day===today).sort((a,b)=>a.time.localeCompare(b.time)).slice(0,3);
  $("overviewSchedule").innerHTML=classes.length?classes.map(c=>`<div class="coming-item"><span class="time-block">${formatTime(c.time)}</span><span class="class-dot"></span><div class="class-info"><strong>${escapeHTML(c.subject)}</strong><small>${escapeHTML(c.room)}</small></div></div>`).join(""):`<div class="empty-state">No classes scheduled for today. Enjoy the breathing room!</div>`;
  $("miniTimer").textContent=formatTimer(timerRemaining);$("miniFocusRing").style.background=`conic-gradient(#8271ee ${360*(timerDuration-timerRemaining)/timerDuration}deg,#eae7fc 0deg)`;
}
function renderTasks(){
  const search=($("taskSearch")?.value||"").toLowerCase(),filter=$("taskFilter")?.value||"all";
  const tasks=data.tasks.filter(t=>(t.title+" "+(t.description||"")).toLowerCase().includes(search)).filter(t=>filter==="all"||(filter==="active"&&!t.done)||(filter==="done"&&t.done));
  $("taskBoard").innerHTML=tasks.length?tasks.map(t=>`<article class="task-card"><button class="check-circle ${t.done?"checked":""}" data-toggle-task="${t.id}">${t.done?"✓":""}</button><div class="task-card-body"><strong class="${t.done?"completed-text":""}">${escapeHTML(t.title)}</strong><p>${escapeHTML(t.description||"No description added.")}</p><div class="task-meta"><span>${escapeHTML(t.due||"No due date")}</span><span>${escapeHTML(t.priority)} priority</span></div></div><div class="task-actions"><button class="small-action" data-edit="task" data-id="${t.id}" aria-label="Edit">✎</button><button class="small-action" data-delete="task" data-id="${t.id}" aria-label="Delete">×</button></div></article>`).join(""):`<div class="empty-state">No tasks found. Try another search or add a new task.</div>`;
  const done=completedTasks(),total=data.tasks.length,pct=total?Math.round(done/total*100):0;$("taskTotal").textContent=total;$("taskDone").textContent=done;$("taskLeft").textContent=total-done;$("taskPageProgress").style.width=pct+"%";$("taskPagePercent").textContent=pct+"% complete";$("sideTaskCount").textContent=total-done;
}
function renderTimetable(){
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  $("dayTabs").innerHTML=days.map(d=>`<button class="day-tab ${selectedDay===d?"active":""}" data-day="${d}">${d.slice(0,3)}</button>`).join("");
  $("selectedDayLabel").textContent=selectedDay;
  const classes=data.classes.filter(c=>c.day===selectedDay).sort((a,b)=>a.time.localeCompare(b.time));
  $("daySchedule").innerHTML=classes.length?classes.map((c,i)=>`<div class="schedule-row"><span class="schedule-time">${formatTime(c.time)}</span><span class="schedule-color" style="background:${["#9382ed","#70b6dc","#f0a77e","#66c7a7"][i%4]}"></span><div><strong>${escapeHTML(c.subject)}</strong><small>${escapeHTML(c.room)}</small></div><button class="small-action" data-delete="class" data-id="${c.id}">×</button></div>`).join(""):`<div class="empty-state">A clear day! Add a class to build your timetable.</div>`;
}
function renderAssignments(){
  const pending=data.assignments.filter(a=>!a.done).length,done=data.assignments.length-pending;
  $("assignmentSummary").innerHTML=`<div class="summary-box"><strong>${data.assignments.length}</strong><span>Total assignments</span></div><div class="summary-box"><strong>${pending}</strong><span>Still pending</span></div><div class="summary-box"><strong>${done}</strong><span>Completed</span></div>`;
  $("assignmentGrid").innerHTML=data.assignments.length?data.assignments.map((a,i)=>`<article class="assignment-card" style="--accent:${["#8d7ce9","#67bfa5","#eda47d"][i%3]}"><div class="assignment-card-top"><div><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.details||"No extra details.")}</p></div><button class="small-action" data-delete="assignment" data-id="${a.id}">×</button></div><div class="assignment-card-foot"><span class="due-label">◷ ${a.due?new Date(a.due+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"No due date"} · ${escapeHTML(a.subject)}</span><button class="status-pill ${a.done?"done":""}" data-toggle-assignment="${a.id}">${a.done?"Completed":"Mark done"}</button></div></article>`).join(""):`<div class="empty-state">No assignments yet. Add one to keep your deadlines organised.</div>`;
}
function renderAttendance(){
  const avg=attendanceAverage();$("overallAttendance").innerHTML=avg===null?'—<small>%</small>':`${avg}<small>%</small>`;$("attendanceMeterFill").style.width=(avg||0)+"%";
  $("subjectList").innerHTML=data.subjects.length?data.subjects.map(s=>{let p=s.total?Math.round(s.attended/s.total*100):0;return `<div class="subject-row"><div><strong>${escapeHTML(s.name)}</strong><br><small>${s.attended} attended out of ${s.total} classes</small></div><div class="subject-bar"><span style="width:${p}%;background:${p<75?"linear-gradient(90deg,#e7a17f,#f0bc8e)":""}"></span></div><div class="subject-percent" style="color:${p<75?"#df9672":"var(--text)"}">${p}%</div><div class="attendance-actions"><button class="present" data-attendance="present" data-id="${s.id}">+ Present</button><button class="absent" data-attendance="absent" data-id="${s.id}">− Absent</button><button data-delete="subject" data-id="${s.id}">×</button></div></div>`}).join(""):`<div class="empty-state">Add your subjects to start tracking attendance.</div>`;
}
function renderFocus(){updateTimerUI();$("focusTotal").textContent=data.focusMinutes}
function renderNotes(){
  const q=($("noteSearch")?.value||"").toLowerCase(),notes=data.notes.filter(n=>(n.title+" "+n.body).toLowerCase().includes(q));
  $("noteCount").textContent=`${notes.length} NOTES`;$("notesGrid").innerHTML=notes.length?notes.map(n=>`<article class="note-card" style="--note-color:${n.color}"><div class="note-actions"><button data-edit="note" data-id="${n.id}">✎</button><button data-delete="note" data-id="${n.id}">×</button></div><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.body)}</p><small>${escapeHTML(n.date||"Saved note")}</small></article>`).join(""):`<div class="empty-state">No notes found. Create a note to save an idea.</div>`;
}
function renderProgress(){
  const total=data.tasks.length,done=completedTasks(),avg=attendanceAverage();
  $("progressOverview").innerHTML=`<div class="progress-stat"><strong>${done}/${total}</strong><span>Tasks completed</span></div><div class="progress-stat"><strong>${data.focusMinutes} min</strong><span>Total focus time</span></div><div class="progress-stat"><strong>${avg===null?"—":avg+"%"}</strong><span>Attendance average</span></div>`;
  const vals=[10,22,16,34,28,48,38],days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  $("activityBars").innerHTML=days.map((d,i)=>`<div class="activity-day"><div class="bar-stack"><span style="height:${Math.min(100,vals[i]+Math.min(data.focusMinutes/10,35))}%"></span></div><small>${d}</small></div>`).join("");
}
function renderSettings(){$("profileName").value=data.name||""}
function formatTime(t){let [h,m]=t.split(":").map(Number);return `${(h%12)||12}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`}
function formatTimer(seconds){return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`}
function openModal(type,id=null){
  modalType=type;editingId=id;const existing=id?findItem(type,id):null;
  const configs={
    task:{title:"Add a new task",fields:[["title","Task title","text",existing?.title||""],["description","Description","textarea",existing?.description||""],["priority","Priority","select",existing?.priority||"Medium",["Low","Medium","High"]],["due","Due","text",existing?.due||"Today"]]},
    class:{title:"Add a class",fields:[["subject","Subject name","text",existing?.subject||""],["day","Day","select",existing?.day||selectedDay,["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]],["time","Start time","time",existing?.time||"09:00"],["room","Room / location","text",existing?.room||""]]},
    assignment:{title:"Add an assignment",fields:[["title","Assignment title","text",existing?.title||""],["subject","Subject","text",existing?.subject||""],["due","Due date","date",existing?.due||""],["details","Details","textarea",existing?.details||""]]},
    subject:{title:"Add a subject",fields:[["name","Subject name","text",existing?.name||""],["attended","Classes attended","number",existing?.attended??0],["total","Total classes held","number",existing?.total??0]]},
    note:{title:"Create a note",fields:[["title","Note title","text",existing?.title||""],["body","Your note","textarea",existing?.body||""]]}
  };
  const config=configs[type];$("modalTitle").textContent=existing?`Edit ${type}`:config.title;
  $("modalFields").innerHTML=config.fields.map(f=>{let [name,label,inputType,value,options]=f;if(inputType==="select")return `<label>${label}<select name="${name}">${options.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></label>`;if(inputType==="textarea")return `<label>${label}<textarea name="${name}" required="${name==="body"||name==="title"}">${escapeHTML(value)}</textarea></label>`;return `<label>${label}<input name="${name}" type="${inputType}" value="${escapeHTML(value)}" ${["title","subject","name"].includes(name)?"required":""} ${inputType==="number"?'min="0"':""}></label>`}).join("");
  $("modalSubmit").textContent=existing?"Update":"Save";$("modalBackdrop").classList.add("show");
  const first=$("modalFields").querySelector("input,textarea,select");if(first)first.focus();
}
function findItem(type,id){let list=type==="task"?"tasks":type==="class"?"classes":type==="assignment"?"assignments":type==="subject"?"subjects":"notes";return data[list].find(x=>x.id===Number(id))}
function closeModal(){$("modalBackdrop").classList.remove("show");$("modalForm").reset();editingId=null;modalType=null}
function submitModal(e){
  e.preventDefault();const form=new FormData($("modalForm")),v=Object.fromEntries(form.entries()),id=editingId||Date.now();
  if(modalType==="task"){let obj={id,title:v.title,description:v.description,priority:v.priority,due:v.due||"No due date",done:findItem("task",id)?.done||false};upsert("tasks",obj)}
  if(modalType==="class"){upsert("classes",{id,...v})}
  if(modalType==="assignment"){upsert("assignments",{id,...v,done:findItem("assignment",id)?.done||false})}
  if(modalType==="subject"){upsert("subjects",{id,name:v.name,attended:Number(v.attended),total:Number(v.total)})}
  if(modalType==="note"){upsert("notes",{id,...v,color:findItem("note",id)?.color||["#9b8bf0","#f1ae87","#65c9ac"][Math.floor(Math.random()*3)],date:"Just now"})}
  saveData();closeModal();renderPage(currentPage);renderOverview();toast("Saved successfully ✦");
}
function upsert(key,obj){const index=data[key].findIndex(x=>x.id===obj.id);if(index>=0)data[key][index]=obj;else data[key].unshift(obj)}
function deleteItem(type,id){
  const keys={task:"tasks",class:"classes",assignment:"assignments",subject:"subjects",note:"notes"},key=keys[type];
  if(!confirm("Delete this item?"))return;data[key]=data[key].filter(x=>x.id!==Number(id));saveData();renderPage(currentPage);renderOverview();toast("Item deleted");
}
function toggleTask(id){const t=findItem("task",id);if(t){t.done=!t.done;saveData();renderPage(currentPage);renderOverview();toast(t.done?"Task completed. Nice work!":"Task moved back to your list.")}}
function toggleAssignment(id){const a=findItem("assignment",id);if(a){a.done=!a.done;saveData();renderAssignments();renderOverview();toast(a.done?"Assignment completed!":"Assignment reopened.")}}
function setTheme(){data.theme=data.theme==="dark"?"light":"dark";document.body.classList.toggle("dark",data.theme==="dark");saveData()}
function startTimer(){if(timerRunning){clearInterval(timerInterval);timerRunning=false;$("timerStart").textContent="Resume session";$("sessionCaption").textContent="Paused. Take your time.";return}
  timerRunning=true;$("timerStart").textContent="Pause session";$("sessionCaption").textContent="You're doing great. Stay with it.";
  timerInterval=setInterval(()=>{timerRemaining--;updateTimerUI();if(timerRemaining<=0){clearInterval(timerInterval);timerRunning=false;if(activeMode==="focus"){data.focusMinutes+=Math.round(timerDuration/60);data.sessions++;saveData();$("focusTotal").textContent=data.focusMinutes;toast("Focus session complete. Great work!")}else toast("Break finished. Ready to focus?");$("timerStart").textContent="Start again";$("sessionCaption").textContent="Session complete. Take a moment to reset.";renderOverview()}},1000)
}
function resetTimer(){clearInterval(timerInterval);timerRunning=false;timerRemaining=timerDuration;$("timerStart").textContent="Start session";$("sessionCaption").textContent="Ready when you are.";updateTimerUI()}
function chooseTimer(minutes){activeMode=minutes===25?"focus":"break";timerDuration=minutes*60;timerRemaining=timerDuration;clearInterval(timerInterval);timerRunning=false;document.querySelectorAll(".preset").forEach(b=>b.classList.toggle("active",Number(b.dataset.minutes)===minutes));$("timerStart").textContent="Start session";$("timerMode").textContent=activeMode==="focus"?"FOCUS SESSION":"BREAK TIME";$("sessionCaption").textContent=activeMode==="focus"?"Ready for a focused session?":"Take a breath. You've earned a break.";updateTimerUI()}
function updateTimerUI(){if(!$("timerDisplay"))return;$("timerDisplay").textContent=formatTimer(timerRemaining);$("clockProgress").style.background=`conic-gradient(transparent 0deg,transparent 0deg)`;$("bigClock").style.background=`conic-gradient(var(--purple) ${360*(timerDuration-timerRemaining)/timerDuration}deg,#e7e3f8 0deg)`;$("timerMode").textContent=activeMode==="focus"?"FOCUS SESSION":"BREAK TIME"}
function init(){
  $("todayLabel").textContent=dateLabel();document.body.classList.toggle("dark",data.theme==="dark");
  document.addEventListener("click",e=>{
    const page=e.target.closest("[data-page]");if(page){showPage(page.dataset.page);return}
    const open=e.target.closest("[data-open-modal]");if(open){openModal(open.dataset.openModal);return}
    const toggle=e.target.closest("[data-toggle-task]");if(toggle){toggleTask(toggle.dataset.toggleTask);return}
    const edit=e.target.closest("[data-edit]");if(edit){openModal(edit.dataset.edit,edit.dataset.id);return}
    const del=e.target.closest("[data-delete]");if(del){deleteItem(del.dataset.delete,del.dataset.id);return}
    const ass=e.target.closest("[data-toggle-assignment]");if(ass){toggleAssignment(ass.dataset.toggleAssignment);return}
    const day=e.target.closest("[data-day]");if(day){selectedDay=day.dataset.day;renderTimetable();return}
    const att=e.target.closest("[data-attendance]");if(att){let s=findItem("subject",att.dataset.id);if(s){s.total++;if(att.dataset.attendance==="present")s.attended++;saveData();renderAttendance();renderOverview()}return}
    const preset=e.target.closest("[data-minutes]");if(preset){chooseTimer(Number(preset.dataset.minutes));return}
  });
  document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
  $("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
  $("themeToggle").addEventListener("click",setTheme);$("settingsTheme").addEventListener("click",setTheme);
  $("modalClose").addEventListener("click",closeModal);$("modalCancel").addEventListener("click",closeModal);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal()});
  $("modalForm").addEventListener("submit",submitModal);$("taskSearch").addEventListener("input",renderTasks);$("taskFilter").addEventListener("change",renderTasks);$("noteSearch").addEventListener("input",renderNotes);
  $("prevDay").addEventListener("click",()=>moveDay(-1));$("nextDay").addEventListener("click",()=>moveDay(1));
  $("timerStart").addEventListener("click",startTimer);$("timerReset").addEventListener("click",resetTimer);
  $("saveProfile").addEventListener("click",()=>{data.name=$("profileName").value.trim()||"Student";saveData();renderOverview();toast("Profile updated ✦")});
  $("clearData").addEventListener("click",()=>{if(confirm("This will clear all StudyHub data saved in this browser. Continue?")){localStorage.removeItem(STORAGE_KEY);data=structuredClone(defaultData);saveData();renderPage(currentPage);renderOverview();toast("Workspace restored to sample data") }});
  renderOverview();showPage("overview");
}
function moveDay(direction){const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],i=days.indexOf(selectedDay);selectedDay=days[(i+direction+7)%7];renderTimetable()}
init();
