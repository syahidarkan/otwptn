import numpy as np, cv2, vtracer, re
from PIL import Image
SHEET="/Users/acan/pemrograman/otwptn/Maskot/2d all pov.png"
K=4  # upscale
BOXES={"front":(40,50,360,415),"right":(410,50,670,415),"left":(760,50,1010,415),"back":(1060,50,1340,415),
       "top":(120,460,440,720),"three":(570,420,800,720),"bottom":(1060,480,1340,720)}
def load(view):
    im=cv2.cvtColor(cv2.imread(SHEET),cv2.COLOR_BGR2RGB)
    x0,y0,x1,y1=BOXES[view]
    c=im[y0:y1,x0:x1]
    c=cv2.resize(c,None,fx=K,fy=K,interpolation=cv2.INTER_CUBIC)
    return c
def fg_mask(rgb):
    hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV).astype(np.float32)
    s=hsv[...,1]/255; v=hsv[...,2]/255
    m=((s>0.10)|(v<0.55)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    # fill holes
    ff=m.copy(); h,w=m.shape; pad=np.zeros((h+2,w+2),np.uint8)
    cv2.floodFill(ff,pad,(0,0),2) if m[0,0]==0 else None
    holes=(ff==0)
    m[holes]=1
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    keep=np.zeros_like(m)
    for i in range(1,n):
        if st[i,cv2.CC_STAT_AREA]>2500: keep[lab==i]=1
    return keep

import subprocess, os, tempfile
def _flip(d,H):
    toks=re.findall(r'[MmLlCcZz]|-?\d+\.?\d*',d)
    out=[];cmd=None;nums=[]
    def flush():
        pass
    i=0;res=[]
    while i<len(toks):
        t=toks[i]
        if t.isalpha():
            cmd=t;res.append(t);i+=1
            if t in 'zZ':continue
            continue
        # number pairs
        x=float(toks[i]);y=float(toks[i+1]);i+=2
        if cmd=='M': y=H-y
        elif cmd in 'mlc' : y=-y
        elif cmd in 'LC': y=H-y
        res.append(x);res.append(y)
    return res
def potrace_mask(mask,scale=1.0,turd=6,alpha=1.0,opt=0.4,blur=2.2):
    if blur:
        mask=(cv2.GaussianBlur(mask.astype(np.float32),(0,0),blur)>0.5).astype(np.uint8)
    H,W=mask.shape
    with tempfile.TemporaryDirectory() as td:
        Image.fromarray(((1-mask)*255).astype(np.uint8)).convert('1').save(td+'/m.pbm')
        subprocess.run(['potrace','-s','-u','1','-t',str(turd),'-a',str(alpha),'-O',str(opt),'--flat',td+'/m.pbm','-o',td+'/m.svg'],check=True)
        sv=open(td+'/m.svg').read()
    ds=re.findall(r'<path d="([^"]+)"',sv)
    out=[]
    for d in ds:
        # tokenise keeping command letters; potrace emits implicit repeats
        toks=re.findall(r'[MmLlCcZz]|-?\d+\.?\d*',d)
        cmd=None;i=0;parts=[]
        nargs={'M':2,'m':2,'L':2,'l':2,'C':6,'c':6}
        while i<len(toks):
            t=toks[i]
            if t.isalpha():
                cmd=t;i+=1
                if t in 'zZ': parts.append('z')
                continue
            n=nargs[cmd]; v=[float(x) for x in toks[i:i+n]]; i+=n
            if cmd in 'MLC': v=[(x if j%2==0 else H-x) for j,x in enumerate(v)]
            else: v=[(x if j%2==0 else -x) for j,x in enumerate(v)]
            parts.append(cmd+' '+' '.join(('%.1f'%(a*scale)).rstrip('0').rstrip('.') for a in v))
            if cmd=='M': cmd='L'
            if cmd=='m': cmd='l'
        out.append(''.join(parts))
    return ''.join(out)
def kmeans_palette(rgb,mask,k=14,seed=1):
    px=rgb[mask>0].astype(np.float32)
    idx=np.random.RandomState(seed).choice(len(px),min(60000,len(px)),replace=False)
    crit=(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,50,0.5)
    _,_,c=cv2.kmeans(px[idx],k,None,crit,4,cv2.KMEANS_PP_CENTERS)
    return c
def classify(rgb,pal,smooth=3.0):
    sm=cv2.bilateralFilter(rgb,9,40,7)
    d=((sm[:,:,None,:].astype(np.float32)-pal[None,None])**2).sum(-1)
    lab=d.argmin(-1)
    if smooth:
        n=len(pal); best=None; arg=np.zeros(lab.shape,np.int32); bv=np.full(lab.shape,-1,np.float32)
        cnt=np.bincount(lab.ravel(),minlength=n)/lab.size
        for i in range(n):
            sg=smooth*1.7 if cnt[i]>0.02 else smooth*0.8   # big flat areas: very smooth, thin details: keep
            ch=cv2.GaussianBlur((lab==i).astype(np.float32),(0,0),sg)
            u=ch>bv; bv[u]=ch[u]; arg[u]=i
        lab=arg
    return lab


import math
def _split(P,t):
    (x0,y0),(x1,y1),(x2,y2),(x3,y3)=P
    a=(x0+(x1-x0)*t,y0+(y1-y0)*t); b=(x1+(x2-x1)*t,y1+(y2-y1)*t); cc=(x2+(x3-x2)*t,y2+(y3-y2)*t)
    d=(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t); e=(b[0]+(cc[0]-b[0])*t,b[1]+(cc[1]-b[1])*t)
    f=(d[0]+(e[0]-d[0])*t,d[1]+(e[1]-d[1])*t)
    return [P[0],a,d,f],[f,e,cc,P[3]]
def d_to_cubics(d,maxseg=3.4):
    """potrace-style path string -> list of subpaths, each a flat list [x0,y0, (c1,c2,p)*]; every segment is
    split into pieces <= maxseg long so a per-point bend deformer stays smooth."""
    toks=re.findall(r'[MmLlCcz]|-?\d+\.?\d*',d)
    subs=[];cur=None;pos=(0.0,0.0);start=pos;cmd=None;i=0
    def emit(P):
        ln=math.dist(P[0],P[1])+math.dist(P[1],P[2])+math.dist(P[2],P[3])
        n=max(1,int(math.ceil(ln/maxseg))); rest=P
        for k in range(n):
            if k==n-1: seg=rest
            else: seg,rest=_split(rest,1.0/(n-k))
            cur.extend([round(seg[1][0],1),round(seg[1][1],1),round(seg[2][0],1),round(seg[2][1],1),round(seg[3][0],1),round(seg[3][1],1)])
    while i<len(toks):
        t=toks[i]
        if t.isalpha():
            cmd=t;i+=1
            if t=='z':
                if cur is not None and len(cur)>2: subs.append(cur)
                cur=None;pos=start
            continue
        if cmd in 'Mm':
            x,y=float(toks[i]),float(toks[i+1]);i+=2
            if cmd=='m': x+=pos[0];y+=pos[1]
            start=pos=(x,y);cur=[round(x,1),round(y,1)];cmd='L' if cmd=='M' else 'l'
        elif cmd in 'Ll':
            x,y=float(toks[i]),float(toks[i+1]);i+=2
            if cmd=='l': x+=pos[0];y+=pos[1]
            p3=(x,y);emit([pos,(pos[0]+(x-pos[0])/3,pos[1]+(y-pos[1])/3),(pos[0]+2*(x-pos[0])/3,pos[1]+2*(y-pos[1])/3),p3]);pos=p3
        else:
            v=[float(q) for q in toks[i:i+6]];i+=6
            if cmd=='c': v=[v[0]+pos[0],v[1]+pos[1],v[2]+pos[0],v[3]+pos[1],v[4]+pos[0],v[5]+pos[1]]
            emit([pos,(v[0],v[1]),(v[2],v[3]),(v[4],v[5])]);pos=(v[4],v[5])
    if cur is not None and len(cur)>2: subs.append(cur)
    return subs
