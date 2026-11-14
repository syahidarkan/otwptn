import json, sys, colorsys
from common import *
from specs import SPECS
OUT="/Users/acan/pemrograman/otwptn/src/components/mascot/otbee/data/"
S="/private/tmp/claude-501/-Users-acan-pemrograman-otwptn/9043d1fa-5161-4abf-8f10-cf110a7ba0d7/scratchpad/"
os.makedirs(OUT,exist_ok=True)

def tag_of(c):
    r,g,b=[x/255 for x in c]; h,s,v=colorsys.rgb_to_hsv(r,g,b); h*=360
    if v<0.14: return 'dark'
    if 185<=h<=225 and 0.06<=s<=0.6 and v>0.6: return 'wing'
    if 150<=h<185 and s>0.3: return 'teal'
    if (h<28 or h>335) and s>0.28 and v<0.52: return 'bagbrown'
    if v<0.24: return 'dark'
    if 14<=h<=38 and s>0.35 and v<0.62: return 'brown'
    if (h<18 or h>335) and s>0.22 and v>=0.52 and v<0.82: return 'mouth'
    if (h<18 or h>335) and s>0.22 and v>=0.82: return 'pink'
    if s<0.14 and v>0.78: return 'white'
    if 28<=h<=55 and s<0.42 and v>0.8: return 'cream'
    if 28<=h<=55 and s>=0.42: return 'yellow'
    return 'other'

def hull_mask(m):
    m8=m.astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m8)
    out=np.zeros_like(m8)
    for j in range(1,n):
        if st[j,cv2.CC_STAT_AREA]<3000: continue
        cs,_=cv2.findContours((lab==j).astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
        for c in cs: cv2.fillPoly(out,[cv2.convexHull(c)],1)
    return out>0
def row_fill(rgb,zone,valid):
    out=rgb.copy()
    for y in np.where(zone.any(1))[0]:
        xs=np.where(valid[y])[0]; zx=np.where(zone[y])[0]
        if len(xs)==0: continue
        idx=np.searchsorted(xs,zx)
        left=xs[np.clip(idx-1,0,len(xs)-1)]; right=xs[np.clip(idx,0,len(xs)-1)]
        pick=np.where(np.abs(zx-left)<=np.abs(right-zx),left,right)
        out[y,zx]=rgb[y,pick]
    return out
def poly_mask(shape,poly):
    m=np.zeros(shape,np.uint8); cv2.fillPoly(m,[np.array(poly,np.int32)],1); return m
def hexc(c): return '#%02x%02x%02x'%tuple(int(round(x)) for x in c)

def trace_stack(mask,cl,pal_hex,minarea=300,scale=1/K,turd=30,alpha=1.33,opt=2.4):
    classes=[(int(((cl==i)&(mask>0)).sum()),i) for i in range(len(pal_hex))]
    order=[i for a,i in sorted(classes,reverse=True) if a>=minarea]
    layers=[]
    for n,i in enumerate(order):
        m=(np.isin(cl,order[n:])&(mask>0)).astype(np.uint8)
        bl=5.2 if n<max(2,len(order)*0.45) else 2.6
        d=potrace_mask(m,scale=scale,turd=turd,alpha=alpha,opt=opt,blur=bl)
        if d: layers.append(dict(f=pal_hex[i],d=d))
    return layers

def build(view):
    spec=SPECS[view]; rgb=load(view); H,W=rgb.shape[:2]
    _od=[n for n in spec['order'] if not n.startswith('leg')]; _i=_od.index('body')+1
    _od[_i:_i]=[n for n in spec['order'] if n.startswith('leg')]; spec['order']=_od
    for (x0,y0,x1,y1) in spec['clear']: rgb[y0:y1,x0:x1]=255
    fg=fg_mask(rgb)
    fg=cv2.erode(fg,np.ones((7,7),np.uint8))
    pal=kmeans_palette(rgb,fg,16)
    for it in range(3):
        cl=classify(rgb,pal,smooth=0); cl[fg==0]=-1
        newp=[]
        for i in range(len(pal)):
            mk=(cl==i).astype(np.uint8)
            core=cv2.erode(mk,np.ones((7,7),np.uint8))>0
            px=rgb[core] if core.sum()>80 else rgb[cl==i]
            newp.append(np.median(px,axis=0) if len(px)>30 else pal[i])
        pal=np.array(newp,np.float32)
        # merge near duplicates
        keep=[]
        for c in pal:
            if all(np.linalg.norm(c-k)>22 for k in keep): keep.append(c)
        pal=np.array(keep,np.float32)
    cl=classify(rgb,pal); cl[fg==0]=-1
    pal_rgb=[p for p in pal]
    pal_hex=[hexc(c) for c in pal_rgb]; tags=[tag_of(c) for c in pal_rgb]
    # --- silhouette fringe cleanup: JPEG halo / cream / grey slivers on the outline become the neighbouring colour
    from scipy import ndimage as ndi
    bad_ids=[i for i,t in enumerate(tags) if t in ('cream','other','white')]
    fring=(fg>0)&~(cv2.erode(fg,np.ones((25,25),np.uint8))>0)
    keep_poly=np.zeros(fg.shape,bool)
    for _n,_p in spec['parts'].items():
        if _n.startswith('bag'): keep_poly|=poly_mask(fg.shape,_p['poly']).astype(bool)
    badm=fring&np.isin(cl,bad_ids)&~keep_poly
    goodm=(cl>=0)&~np.isin(cl,bad_ids)
    ii=ndi.distance_transform_edt(~goodm,return_distances=False,return_indices=True)
    cl[badm]=cl[ii[0][badm],ii[1][badm]]
    tagmap=np.full((H,W),-1,np.int16)
    tagnames=sorted(set(tags)); 
    def tagmask(names):
        ids=[i for i,t in enumerate(tags) if ('*' in names or t in names)]
        return np.isin(cl,ids)
    parts=spec['parts']; claimed=np.zeros((H,W),bool); masks={}; ext_masks={}
    claim_order=[n for n in spec['order'] if n!='body']
    pri=lambda n:(0 if n.startswith('ant') else 1 if n.startswith('wing') else 2 if n.startswith(('eye','mouth','cheek')) else 2.5 if n=='goggles' else 3 if n=='bag' else 4 if n.startswith(('arm','leg')) else 5)
    for n in sorted(claim_order,key=pri):
        p=parts[n]; pm=poly_mask((H,W),p['poly'] if 'poly' in p else p['eye']).astype(bool)
        if 'ytop' in p: pm[:p['ytop']]=False
        if 'eye' in p:
            m=pm&(tagmask(['white','dark','cream']))&~claimed
        else:
            m=pm&tagmask(p['tags'])&~claimed
            if n=='head':
                m&=~tagmask(['wing'])
                if p.get('excl_dark_below'):
                    yy=np.arange(H)[:,None]; m&=~(tagmask(['dark'])&(yy>p['excl_dark_below']))
                m&=~(masks.get('antL',np.zeros_like(m))|masks.get('antR',np.zeros_like(m)))
        # clean specks
        m=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8)).astype(bool)
        if n.startswith(('arm','leg')) and m.any():
            m8=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))
            inv=(1-m8).astype(np.uint8); ffm=inv.copy(); cv2.floodFill(ffm,np.zeros((H+2,W+2),np.uint8),(0,0),2)
            m=((ffm!=2)&poly_mask((H,W),p['poly']).astype(bool)&~claimed)
        if not n.startswith(('eye','mouth','cheek')):
            nn,lab,st,_=cv2.connectedComponentsWithStats(m.astype(np.uint8))
            for j in range(1,nn):
                if st[j,cv2.CC_STAT_AREA]<1200: m[lab==j]=False
        if n.startswith('leg') and m.any():
            _ys,_xs=np.nonzero(pm|poly_mask((H,W),p['poly']).astype(bool)); yt=p['ytop']; ov=p.get('ovl',90)
            ext=np.zeros((H,W),bool); ext[yt-ov:yt,_xs.min():_xs.max()+1]=True
            ext_masks[n]=ext&fg.astype(bool)&~claimed&~m
        masks[n]=m; claimed|=m
    # --- limbs: ONE piece each (no cutting!). We only measure the skeleton the runtime bend-deformer needs.
    skins={}
    for n in [k for k in list(masks) if k.startswith(('arm','leg')) and masks[k].any()]:
        p=parts[n]; m=masks[n]
        ys,xs=np.nonzero(m|ext_masks.get(n,np.zeros_like(m))); pts=np.stack([xs,ys],1).astype(np.float32)
        if n.startswith('leg'):
            yt=p['ytop']; sel=(np.nonzero(m)[0]<yt+30); mx=np.nonzero(m)[1]
            root=np.array([mx[sel].mean() if sel.any() else mx.mean(), yt-25],np.float32)
            u=np.array([0,1],np.float32); Ln=float(((np.stack(np.nonzero(m)[::-1],1)-root)@u).max())
            frac=0.55; rb=0.30; ew=0.30
        else:
            root=np.array(p['pivot'],np.float32)
            if p.get('autoroot'):
                touch=(cv2.dilate(m.astype(np.uint8),np.ones((15,15),np.uint8))>0)&~m&(fg.astype(bool)&~claimed)
                ty,tx=np.nonzero(touch)
                if len(tx)>40: root=np.array([tx.mean(),ty.mean()],np.float32)
            mp=np.stack(np.nonzero(m)[::-1],1).astype(np.float32)
            tip=mp[np.linalg.norm(mp-root,axis=1).argmax()]
            u=tip-root; Ln=float(np.linalg.norm(u)); u=u/Ln
            frac=0.60; rb=0.25; ew=0.20
        mp=np.stack(np.nonzero(m)[::-1],1).astype(np.float32)
        t=(mp-root)@u; T=Ln*frac; perp=np.array([-u[1],u[0]],np.float32); s_=(mp-root)@perp
        near=np.abs(t-T)<10
        ec=root+u*T+perp*(s_[near].mean() if near.any() else 0)
        skins[n]=dict(root=root,ec=ec,u=u,Ln=Ln,T=T,rb=rb,ew=ew)
        p['pivot']=(float(root[0]),float(root[1]))
    # --- face-feature cleaning for head raster
    feat=np.zeros((H,W),np.uint8)
    for n in masks:
        if n.startswith(('eye','mouth','cheek','goggles')): feat|=masks[n].astype(np.uint8)
    feat=cv2.dilate(feat,np.ones((15,15),np.uint8))
    head_rgb=rgb.copy()
    ycls=[(int((cl==i).sum()),i) for i in range(len(pal_rgb)) if tags[i]=='yellow']
    ymain=pal_rgb[max(ycls)[1]]
    head_rgb[feat>0]=ymain
    # --- body raster with backfills
    body_rgb=rgb.copy(); fill=np.zeros((H,W),np.uint8)
    def full_mask(n):
        # limb_split() replaced masks[n] with just its upper half and put the lower half in
        # masks[n+'2'] -- backfill (patching the body where the whole original limb sat) needs
        # the union of both, not just the half that happens to still be called n
        return masks[n]|masks.get(n+'2',np.zeros_like(masks[n]))
    for n,p in parts.items():
        if 'backfill' not in p or n.startswith('leg'): continue   # legs ARE body art: keep their real pixels, no recolouring
        zone=poly_mask((H,W),p['backfill']).astype(bool)&full_mask(n)
        if p.get('neck_fill')=='dark':
            body_rgb[zone&hull_mask(fg.astype(bool)&~claimed)]=(32,32,34)
        else:
            fill|=(zone&hull_mask(fg.astype(bool)&~claimed)).astype(np.uint8)
    body_mask=fg.astype(bool)&~claimed
    for n,p in parts.items():
        if 'band' in p:
            ys=np.where(poly_mask((H,W),p['poly']).any(1))[0]; ytop=ys.min()
            rows=np.zeros((H,W),bool); rows[ytop:ytop+p['band']]=True
            body_mask|=masks[n]&rows
    sil=cv2.dilate(hull_mask(body_mask).astype(np.uint8),np.ones((25,25),np.uint8)).astype(bool)  # loosen: a backfill zone (e.g. an armpit) can poke just outside the hull measured before it's merged in
    for n,p in parts.items():
        if 'backfill' in p:
            zone=poly_mask((H,W),p['backfill']).astype(bool)&full_mask(n)
            zone&=sil
            body_mask|=zone
    if view=='back':   # tan/blue blends left under translucent wings -> treat as holes too
        bad=tagmask(['cream','other','wing','white'])&fg.astype(bool)&~claimed&hull_mask(fg.astype(bool)&~claimed)
        fill|=cv2.dilate(bad.astype(np.uint8),np.ones((5,5),np.uint8))
    if fill.any():
        fill_d=(cv2.dilate(fill,np.ones((9,9),np.uint8))>0)
        valid=(fg.astype(bool)&~cv2.dilate(claimed.astype(np.uint8),np.ones((15,15),np.uint8)).astype(bool)&tagmask(['yellow','dark']))
        body_rgb=row_fill(body_rgb,fill_d,valid)
        # row_fill can fail (no valid neighbour in that row -> e.g. an arm swung away exposing
        # background that was never part of the body art): anywhere still unpainted inside the
        # backfill zone, fall back to the flat dominant body colour instead of leaving a visible
        # white/background hole once traced.
        leftover=fill_d&(~fg.astype(bool))
        body_rgb[leftover]=ymain
        body_mask|=fill_d&hull_mask(fg.astype(bool)&~claimed)
    nb,labb,stb,_=cv2.connectedComponentsWithStats(body_mask.astype(np.uint8))
    for j in range(1,nb):
        if stb[j,cv2.CC_STAT_AREA]<3000: body_mask[labb==j]=False
    body_cl=classify(body_rgb,np.array(pal_rgb,np.float32)); 
    head_cl=classify(head_rgb,np.array(pal_rgb,np.float32))
    _ys,_xs=np.nonzero(fg)
    out=dict(view=view,w=W/K,h=H/K,order=spec['order'],parts={},box=[round(_xs.min()/K,1),round(_ys.min()/K,1),round(_xs.max()/K,1),round(_ys.max()/K,1)])
    def piv(p): return [round(float(p[0])/K,1),round(float(p[1])/K,1)]
    for n in spec['order']:
        if n=='body':
            m=body_mask.astype(np.uint8)
            m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
            out['parts'][n]=dict(parent=None,pivot=[W/K/2,H/K/2],layers=trace_stack(m,body_cl,pal_hex,minarea=600))
            continue
        p=parts[n]; m=(masks[n]|ext_masks.get(n,np.zeros_like(masks[n]))).astype(np.uint8)
        e=dict(parent=p.get('parent'),pivot=piv(p['pivot']))
        if 'eye' in p:
            dark=(m>0)&tagmask(['dark']); white=(m>0)&tagmask(['white','cream'])
            dk=dark.astype(np.uint8)
            for ks in (25,17,11,5):
                pupil=cv2.morphologyEx(dk,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(ks,ks)))
                if pupil.sum()>400: break
            print('  eye',view,n,'dark px',int(dk.sum()),'pupil',int(pupil.sum()))
            nL,lab,st,_=cv2.connectedComponentsWithStats(pupil)
            if nL>1:
                big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); pupil=(lab==big).astype(np.uint8)
            lash=(dk&~cv2.dilate(pupil,np.ones((5,5),np.uint8))).astype(np.uint8)
            lash=cv2.morphologyEx(lash,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
            shape=cv2.morphologyEx(((white|pupil.astype(bool)|lash.astype(bool))).astype(np.uint8),cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(21,21)))
            wc=np.median(rgb[white],axis=0) if white.sum()>50 else np.array([250,246,236])
            # fill holes
            ff=shape.copy(); pad=np.zeros((H+2,W+2),np.uint8); 
            inv=(1-shape).astype(np.uint8)
            ffm=inv.copy(); cv2.floodFill(ffm,pad,(0,0),2) if inv[0,0] else None
            shape=(ffm!=2).astype(np.uint8)
            wc=np.median(rgb[white],axis=0) if white.sum()>50 else np.array([250,246,236])
            inv=(1-pupil).astype(np.uint8); pf=inv.copy(); cv2.floodFill(pf,np.zeros((H+2,W+2),np.uint8),(0,0),2)
            pupil_f=(pf!=2).astype(np.uint8)
            cnts,_=cv2.findContours(pupil_f,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
            cnt=max(cnts,key=cv2.contourArea)
            (ex,ey),(ea,eb),eang=cv2.fitEllipse(cnt)
            ell=np.zeros((H,W),np.uint8); cv2.ellipse(ell,((ex,ey),(ea*0.97,eb*0.97),eang),1,-1)
            hl=(ell>0)&tagmask(['white','cream'])
            hl=cv2.morphologyEx(hl.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
            nH,labH,stH,cenH=cv2.connectedComponentsWithStats(hl)
            hls=[]
            for j in range(1,nH):
                a=stH[j,cv2.CC_STAT_AREA]
                if a>=50: hls.append([round(cenH[j][0]/K,1),round(cenH[j][1]/K,1),round(float(np.sqrt(a/np.pi))/K,1)])
            e['eye']=dict(shape=[dict(f=hexc(wc),d=potrace_mask(shape,1/K,8,1.1,0.8))],
                          pupilE=[round(ex/K,1),round(ey/K,1),round(ea/2/K,1),round(eb/2/K,1),round(eang,1)],
                          lash=[dict(f='#0c0b10',d=potrace_mask(lash,1/K,6,1.1,0.8))],hl=hls)
            pupil=pupil_f
            ys,xs=np.nonzero(pupil); 
            if len(xs): e['pupilC']=[round(xs.mean()/K,1),round(ys.mean()/K,1)]; e['pupilR']=round(float(np.sqrt(pupil.sum()/np.pi))/K,1)
            ys,xs=np.nonzero(shape); e['center']=[round(xs.mean()/K,1),round(ys.mean()/K,1)]
            e['pivot']=e['center']
        else:
            cls=head_cl if n=='head' else cl
            if n=='head':
                mm=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
                mm=(mm|feat).astype(np.uint8)          # eyes/mouth/cheeks were cut out -> keep silhouette solid
                inv=(1-mm).astype(np.uint8); ffm=inv.copy(); cv2.floodFill(ffm,np.zeros((H+2,W+2),np.uint8),(0,0),2)
                m=(ffm!=2).astype(np.uint8)            # fill any remaining interior holes
            e['layers']=trace_stack(m,cls,pal_hex,minarea=60 if n.startswith(('mouth','cheek')) else 70 if n.startswith(('arm','leg')) else 400)
            if n in skins:
                sk=skins[n]
                e['layers']=[dict(f=l['f'],s=d_to_cubics(l['d'])) for l in e['layers']]
                e['skin']=dict(root=piv(sk['root']),ec=piv(sk['ec']),u=[round(float(sk['u'][0]),4),round(float(sk['u'][1]),4)],
                               Ln=round(float(sk['Ln'])/K,1),T=round(float(sk['T'])/K,1),rb=sk['rb'],ew=sk['ew'],mode='shear' if n.startswith('leg') else 'swirl')
                if n in ext_masks: e['skin']['fade']=[round((p['ytop']-p.get('ovl',90))/K,1),round((p['ytop']+8)/K,1)]
            ys,xs=np.nonzero(m)
            if len(xs): e['center']=[round(xs.mean()/K,1),round(ys.mean()/K,1)]
        _m=(shape if 'eye' in p else masks[n]); _ys,_xs=np.nonzero(_m)
        if len(_xs): e['bbox']=[round(_xs.min()/K,1),round(_ys.min()/K,1),round(_xs.max()/K,1),round(_ys.max()/K,1)]
        out['parts'][n]=e
    json.dump(out,open(S+f"parts_{view}.json","w"),separators=(',',':'))
    sz=len(json.dumps(out,separators=(',',':')))
    print(view,'bytes',sz,{n:len(json.dumps(v)) for n,v in out['parts'].items()})
    return out
if __name__=='__main__':
    for v in (sys.argv[1:] or SPECS): build(v)
