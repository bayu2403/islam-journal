function ok2rgb(L,C,H){const h=H*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);const l=(L+0.3963377774*a+0.2158037573*b)**3,m=(L-0.1055613458*a-0.0638541728*b)**3,s=(L-0.0894841775*a-1.2914855480*b)**3;
return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.7076147010*s].map(v=>Math.min(1,Math.max(0,v)))}
const g=x=>x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055, ig=x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;
function parse(s){const m=s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);return {c:ok2rgb(+m[1],+m[2],+m[3]).map(g),a:m[4]?+m[4]:1}}
function over(top,bot){return top.c.map((v,i)=>v*top.a+bot[i]*(1-top.a))}
const lum=c=>{const[r,gg,b]=c.map(ig);return 0.2126*r+0.7152*gg+0.0722*b};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return ((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};
const T=require('./themes.js');
for(const [i,t] of Object.entries(T)){const bg=parse(t.background).c;
 // aurora peak: glow (blurred radial, ~70% of its alpha at centre) over bg
 const gl=parse(t.glow);gl.a*=0.7;const peak=over(gl,bg);
 const glass=over(parse(t.glass),peak);
 console.log(i,'fg',cr(parse(t.foreground).c,glass),'muted',cr(parse(t['muted-foreground']).c,glass),'fg-on-bare-peak',cr(parse(t.foreground).c,peak),'muted-bare',cr(parse(t['muted-foreground']).c,peak))}
