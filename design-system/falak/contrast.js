function oklchToRgb(L,C,H){const h=H*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);
const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.2914855480*b;
const l=l_**3,m=m_**3,s=s_**3;
let r=4.0767416621*l-3.3077115913*m+0.2309699292*s,g=-1.2684380046*l+2.6097574011*m-0.3413193965*s,bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s;
return [r,g,bb].map(v=>Math.min(1,Math.max(0,v)));}
function lum([r,g,b]){return 0.2126*r+0.7152*g+0.0722*b}
function parse(s){const m=s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+)%?)?\)/);return {L:+m[1],C:+m[2],H:+m[3],A:m[4]?+m[4]/100:1}}
const toLin=v=>v; // oklch->linear already
function rgbLin(s,over){const p=parse(s);let c=oklchToRgb(p.L,p.C,p.H);if(p.A<1&&over){ // composite in sRGB gamma space
 const g=x=>x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055, ig=x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;
 const o=rgbLin(over);c=c.map((v,i)=>ig(g(v)*p.A+g(o[i])*(1-p.A)));}return c;}
function cr(a,b,over){const la=lum(rgbLin(a,over)),lb=lum(rgbLin(b,over));const [x,y]=la>lb?[la,lb]:[lb,la];return ((x+0.05)/(y+0.05)).toFixed(2)}
module.exports={cr};
if(require.main===module){const T=require('./themes.js');
const pairs=[['foreground','background',4.5],['foreground','card',4.5],['muted-foreground','background',4.5],['muted-foreground','card',4.5],['muted-foreground','muted',4.5],
['primary-foreground','primary',4.5],['primary','background',4.5],['primary','card',4.5],['secondary-foreground','secondary',4.5],['accent-foreground','accent',4.5],
['card-inverse-foreground','card-inverse',4.5],['card-inverse-muted','card-inverse',4.5],['reward','card-inverse',4.5],['reward-ink','card',4.5],['reward-ink','popover',4.5],
['destructive','card',4.5],['ring','background',3],['ring','card',3],['input','card',3],['card-inverse','background',1]];
for(const [n,t] of Object.entries(T)){console.log('\n'+n);for(const [a,b,min] of pairs){const bg=t[b].includes('/')?null:t[b];const v=cr(t[a],t[b],t.background.includes('/')?null:t[b]);
 const val=t[a].includes('/')?cr(t[a],t[b],t[b]):cr(t[a],t[b]);console.log(`  ${a} on ${b}: ${val} ${+val>=min?'ok':'FAIL('+min+')'}`)}}}
