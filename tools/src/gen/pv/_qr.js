/* pbQR(text) → {size, dark(r,c)}: QR Code, byte mode, error correction M, versions 1–10 (up to 213 bytes). pbQRSvg(text) → SVG markup. */
function pbQR(text){
  var data=[].slice.call(new TextEncoder().encode(text));
  var T=[null,[10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],[16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44]];
  var AL=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
  var v=1,cap;for(;v<=10;v++){var t=T[v];cap=t[1]*t[2]+t[3]*t[4];if(4+(v<10?8:16)+data.length*8<=cap*8)break;}
  if(v>10)throw new Error('pbQR: text too long');
  var t=T[v],bits=[];function put(x,n){for(var i=n-1;i>=0;i--)bits.push((x>>>i)&1);}
  put(4,4);put(data.length,v<10?8:16);data.forEach(function(b){put(b,8)});
  for(var i=0;i<4&&bits.length<cap*8;i++)bits.push(0);while(bits.length%8)bits.push(0);
  var cw=[];for(i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=b<<1|bits[i+j];cw.push(b);}
  for(var p=0;cw.length<cap;p++)cw.push(p%2?0x11:0xEC);
  var EXP=[],LOG=[],x=1;for(i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d;}for(i=255;i<512;i++)EXP[i]=EXP[i-255];
  function mul(a,b){return a&&b?EXP[LOG[a]+LOG[b]]:0;}
  var ecn=t[0],gen=[1];for(i=0;i<ecn;i++){var ng=new Array(gen.length+1).fill(0);for(j=0;j<gen.length;j++){ng[j]^=gen[j];ng[j+1]^=mul(gen[j],EXP[i]);}gen=ng;}
  function rs(d){var r=d.concat(new Array(ecn).fill(0));for(var i=0;i<d.length;i++){var c=r[i];if(c)for(var j=0;j<gen.length;j++)r[i+j]^=mul(gen[j],c);}return r.slice(d.length);}
  var blocks=[],ecs=[],k=0;for(i=0;i<t[1]+t[3];i++){var n=i<t[1]?t[2]:t[4];var d=cw.slice(k,k+n);k+=n;blocks.push(d);ecs.push(rs(d));}
  var seq=[],mx=Math.max(t[2],t[4]);for(i=0;i<mx;i++)blocks.forEach(function(b){if(i<b.length)seq.push(b[i])});for(i=0;i<ecn;i++)ecs.forEach(function(e){seq.push(e[i])});
  var N=17+4*v,M=[],F=[];for(i=0;i<N;i++){M.push(new Array(N).fill(0));F.push(new Array(N).fill(false));}
  function set(r,c,d){M[r][c]=d?1:0;F[r][c]=true;}
  function finder(r,c){for(var y=-1;y<=7;y++)for(var x=-1;x<=7;x++){var rr=r+y,cc=c+x;if(rr<0||cc<0||rr>=N||cc>=N)continue;var d=(y>=0&&y<=6&&(x===0||x===6))||(x>=0&&x<=6&&(y===0||y===6))||(y>=2&&y<=4&&x>=2&&x<=4);set(rr,cc,d);}}
  finder(0,0);finder(0,N-7);finder(N-7,0);
  for(i=8;i<N-8;i++){if(!F[6][i])set(6,i,i%2===0);if(!F[i][6])set(i,6,i%2===0);}
  var al=AL[v];var L=al[al.length-1];al.forEach(function(r){al.forEach(function(c){if((r===6&&c===6)||(r===6&&c===L)||(r===L&&c===6))return;for(var y=-2;y<=2;y++)for(var x=-2;x<=2;x++)set(r+y,c+x,Math.max(Math.abs(x),Math.abs(y))!==1);});});
  set(N-8,8,1);
  for(i=0;i<9;i++){if(!F[8][i])F[8][i]=true;if(!F[i][8])F[i][8]=true;}for(i=0;i<8;i++){F[8][N-1-i]=true;F[N-1-i][8]=true;}
  if(v>=7)for(i=0;i<6;i++)for(j=0;j<3;j++){F[i][N-11+j]=true;F[N-11+j][i]=true;}
  var bitsOut=[];seq.forEach(function(b){for(var i=7;i>=0;i--)bitsOut.push((b>>i)&1);});
  var bi=0,up=true;for(var c=N-1;c>0;c-=2){if(c===6)c--;for(var s=0;s<N;s++){var r=up?N-1-s:s;for(var dc=0;dc<2;dc++){var cc=c-dc;if(F[r][cc])continue;M[r][cc]=bi<bitsOut.length?bitsOut[bi]:0;bi++;}}up=!up;}
  var MASK=[function(r,c){return (r+c)%2===0},function(r){return r%2===0},function(r,c){return c%3===0},function(r,c){return (r+c)%3===0},function(r,c){return (Math.floor(r/2)+Math.floor(c/3))%2===0},function(r,c){return r*c%2+r*c%3===0},function(r,c){return (r*c%2+r*c%3)%2===0},function(r,c){return ((r+c)%2+r*c%3)%2===0}];
  function bch(val,poly,bitsLen){var d=val<<(bitsLen);var pl=poly.toString(2).length;while(d.toString(2).length>=pl)d^=poly<<(d.toString(2).length-pl);return (val<<bitsLen)|d;}
  function build(m){var G=M.map(function(row){return row.slice()});
    for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(!F[r][c]&&MASK[m](r,c))G[r][c]^=1;
    var f=bch((0<<3)|m,0x537,10)^0x5412;
    for(var i=0;i<15;i++){var bit=(f>>i)&1;
      if(i<6)G[i][8]=bit;else if(i===6)G[7][8]=bit;else if(i===7)G[8][8]=bit;else if(i===8)G[8][7]=bit;else G[8][14-i]=bit;
      if(i<8)G[8][N-1-i]=bit;else G[N-15+i][8]=bit;}
    G[N-8][8]=1;
    if(v>=7){var vi=bch(v,0x1f25,12);for(var i2=0;i2<18;i2++){var b=(vi>>i2)&1,a=Math.floor(i2/3),q=i2%3+N-11;G[a][q]=b;G[q][a]=b;}}
    return G;}
  function penalty(G){var p=0,r,c,i;
    for(r=0;r<N;r++){for(var dir=0;dir<2;dir++){var run=1;for(c=1;c<N;c++){var a=dir?G[c][r]:G[r][c],b=dir?G[c-1][r]:G[r][c-1];if(a===b){run++;if(run===5)p+=3;else if(run>5)p++;}else run=1;}}}
    for(r=0;r<N-1;r++)for(c=0;c<N-1;c++){var s=G[r][c]+G[r+1][c]+G[r][c+1]+G[r+1][c+1];if(s===0||s===4)p+=3;}
    var pat1=[1,0,1,1,1,0,1,0,0,0,0],pat2=[0,0,0,0,1,0,1,1,1,0,1];
    for(r=0;r<N;r++)for(c=0;c<=N-11;c++){var m1=true,m2=true,m3=true,m4=true;for(i=0;i<11;i++){if(G[r][c+i]!==pat1[i])m1=false;if(G[r][c+i]!==pat2[i])m2=false;if(G[c+i][r]!==pat1[i])m3=false;if(G[c+i][r]!==pat2[i])m4=false;}p+=40*(m1+m2+m3+m4);}
    var dark=0;for(r=0;r<N;r++)for(c=0;c<N;c++)dark+=G[r][c];p+=Math.floor(Math.abs(dark*100/(N*N)-50)/5)*10;return p;}
  var best=null,bp=1e9;for(var m=0;m<8;m++){var G=build(m),pp=penalty(G);if(pp<bp){bp=pp;best=G;}}
  return {size:N,version:v,dark:function(r,c){return !!best[r][c];}};}
function pbQRSvg(text,quiet){var q=pbQR(text),z=quiet==null?0:quiet,n=q.size+2*z,d='';
  for(var r=0;r<q.size;r++)for(var c=0;c<q.size;c++)if(q.dark(r,c))d+='M'+(c+z)+' '+(r+z)+'h1v1h-1z';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges" role="img" aria-label="QR code"><path fill="#17150f" d="'+d+'"/></svg>';}
function pbQRCode(el){var t=el.dataset.qr,box=el.querySelector('.pb-qr__code');try{box.innerHTML=pbQRSvg(t);box.firstChild.setAttribute('aria-label','QR code for '+t);}catch(e){box.textContent='Too long for a QR code';}}
