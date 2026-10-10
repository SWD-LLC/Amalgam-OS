"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const { mkdtempSync, rmSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const TOKEN="unit-test-token-1234567890123456789";
const SCRIPT=path.join(__dirname, "server.cjs");
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const abort=new AbortController();
async function launch(file) {
  const child=spawn(process.execPath,[SCRIPT],{env:{...process.env,HOST:"127.0.0.1",PORT:"0",AMALGAM_STUDIO_TOKEN:TOKEN,AMALGAM_LEDGER_PATH:file},stdio:["ignore","pipe","pipe"]});
  let output="";child.stdout.on("data",c=>output+=c.toString());
  child.stderr.on("data",c=>output+=c.toString());
  for(let i=0;i<60;i++){
    const port=output.match(/127\.0\.0\.1:(\d+)/)?.[1];
    if(port) return {child,base:`http://127.0.0.1:${port}`};
    if(child.exitCode!==null) throw new Error(`Backend exited: ${output}`);
    await pause(40);
  }
  child.kill(); throw new Error(`Backend start timed out: ${output}`);
}
async function request(base,url,method="GET",payload,auth=TOKEN){
  const headers={};
  if(auth!==null) headers.authorization=`Bearer ${auth}`;
  if(payload!==undefined) headers["content-type"]="application/json";
  const r=await fetch(base+url,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),signal:abort.signal});
  return {status:r.status,body:await r.json(),headers:r.headers};
}
test("operator token is required at startup",()=>{
  const x=spawnSync(process.execPath,[SCRIPT],{env:{...process.env,AMALGAM_STUDIO_TOKEN:"",PORT:"0"},encoding:"utf8"});
  assert.notEqual(x.status,0); assert.match(x.stderr,/required/);
});
test("protected session lifecycle, no false RTP success, durable failover", async()=>{
  const dir=mkdtempSync(path.join(tmpdir(),"amalgam-ledger-test-"));
  const file=path.join(dir,"records.json");
  let one; let two;
  try {
    one=await launch(file);
    const status=await request(one.base,"/api/status", "GET", undefined, null);
    assert.equal(status.status,200);
    assert.equal(status.body.mediaIngest,false);
    assert.equal((await request(one.base,"/api/sessions","POST",{title:"untrusted"},null)).status,401);
    assert.equal((await request(one.base,"/api/sessions","POST",{title:"untrusted"},"wrong")).status,401);
    assert.equal((await request(one.base,"/api/sessions","POST",{title:" "})).status,400);
    const created=await request(one.base,"/api/sessions","POST",{title:"Actual test session"});
    assert.equal(created.status,201);
    const id=created.body.session.id;
    const uri=`/api/sessions/${id}`;
    assert.equal((await request(one.base,uri)).body.session.state,"armed");
    const zero=await request(one.base,uri+"/telemetry","POST",{connectionState:"connected",bytesSent:0});
    assert.equal(zero.body.session.state,"armed");
    const live=await request(one.base,uri+"/telemetry","POST",{connectionState:"connected",bytesSent:4578});
    assert.equal(live.body.session.state,"client-reported-publishing");
    assert.equal((await request(one.base,uri+"/telemetry","POST",{connectionState:"connected",bytesSent:100})).status,409);
    const failed=await request(one.base,uri+"/failure","POST",{});
    assert.equal(failed.status,201);
    assert.equal(failed.body.event.resolved,false);
    assert.equal((await request(one.base,uri+"/recover","POST",{eventId:failed.body.event.id,connectionState:"connecting",bytesSent:100})).status,400);
    const recovered=await request(one.base,uri+"/recover","POST",{eventId:failed.body.event.id,connectionState:"connected",bytesSent:150});
    assert.equal(recovered.status,200);
    assert.equal(recovered.body.event.resolved,true);
    assert.ok(recovered.body.event.downtimeMs>=0);
    assert.equal((await request(one.base,uri+"/recover","POST",{eventId:failed.body.event.id,connectionState:"connected",bytesSent:200})).status,409);
    const closed=await request(one.base,uri+"/close","POST",{});
    assert.equal(closed.body.session.state,"closed");
    assert.equal((await request(one.base,uri+"/telemetry","POST",{connectionState:"connected",bytesSent:300})).status,409);
    assert.ok(readFileSync(file,"utf8").includes("injected_drop"));
    one.child.kill();await pause(75);one=null;
    two=await launch(file);
    const persisted=await request(two.base,uri);
    assert.equal(persisted.body.session.state,"closed");
    assert.equal(persisted.body.events.length,1);
    assert.equal(persisted.body.events[0].resolved,true);
  } finally {
    abort.abort(); one?.child.kill(); two?.child.kill(); rmSync(dir,{recursive:true,force:true});
  }
});
