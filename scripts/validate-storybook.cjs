const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const begin='const stories=';
const end=';\nconst $=';
const a=html.indexOf(begin),b=html.indexOf(end,a);
assert(a>=0&&b>a,'Cannot locate Storybook scene data');
const stories=JSON.parse(html.slice(a+begin.length,b));
assert.deepEqual(Object.keys(stories).sort(),['en','fr']);
const expected=23;
for(const lang of ['en','fr']){
  const scenes=stories[lang];
  assert.equal(scenes.length,expected,lang+' scene count');
  for(let i=0;i<expected;i++){
    const s=scenes[i];
    assert.equal(s.n,i+1,lang+' scene number at index '+i);
    assert.equal(typeof s.title,'string');
    assert(s.title.trim().length>0,lang+' missing title '+s.n);
    assert.equal(typeof s.body,'string');
    assert(s.body.trim().length>=100,lang+' empty/short body '+s.n);
    if(i<15)assert(/^\*\*(EXT\.|INT\.)/m.test(s.body),lang+' scene '+s.n+' lacks established scene-heading format');
  }
}
const locksFile='story-locks.json';
if(fs.existsSync(locksFile)){
  const locks=JSON.parse(fs.readFileSync(locksFile,'utf8'));
  const crypto=require('node:crypto');
  for(const lang of ['en','fr'])for(const [number,hash] of Object.entries(locks[lang]||{})){
    const s=stories[lang][Number(number)-1];
    assert(s&&s.n===Number(number),'Invalid lock reference');
    const actual=crypto.createHash('sha256').update(s.body).digest('hex');
    assert.equal(actual,hash,'LOCKED scene changed: '+lang+' '+number);
  }
}
console.log('Storybook validation passed: 23 EN + 23 FR scenes; configured locks verified.');
