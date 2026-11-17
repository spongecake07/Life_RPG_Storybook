const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('story-content/chapter-one-'),'Storybook must load canonical scene files');
assert(!html.includes('const stories={"en":'),'Do not embed duplicate story text in HTML');
const stories={};
for(const lang of ['en','fr']){
  const scenes=JSON.parse(fs.readFileSync('story-content/chapter-one-'+lang+'.json','utf8'));
  stories[lang]=scenes;
  assert.equal(scenes.length,23,lang+' scene count');
  for(let i=0;i<scenes.length;i++){
    const s=scenes[i];
    assert.equal(s.n,i+1,lang+' scene number at index '+i);
    assert.equal(typeof s.title,'string');
    assert(s.title.trim().length>0,lang+' missing title '+s.n);
    assert.equal(typeof s.body,'string');
    assert(s.body.trim().length>=100,lang+' missing/short body '+s.n);
    if(i<15)assert(/^\*\*(EXT\.|INT\.)/m.test(s.body),lang+' scene '+s.n+' missing scene heading');
  }
}
if(fs.existsSync('story-locks.json')){
  const locks=JSON.parse(fs.readFileSync('story-locks.json','utf8'));
  for(const lang of ['en','fr'])for(const [number,hash] of Object.entries(locks[lang]||{})){
    const s=stories[lang][Number(number)-1];
    assert(s&&s.n===Number(number),'Invalid lock reference');
    assert.equal(crypto.createHash('sha256').update(s.body).digest('hex'),hash,'LOCKED scene changed: '+lang+' '+number);
  }
}
console.log('Storybook canonical source validated: 23 English + 23 French scenes.');
