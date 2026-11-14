from common import *
S="/private/tmp/claude-501/-Users-acan-pemrograman-otwptn/9043d1fa-5161-4abf-8f10-cf110a7ba0d7/scratchpad/"
html=['<body style="background:#fff;margin:0">']
for v in BOXES:
    rgb=load(v); m=fg_mask(rgb)
    pal=kmeans_palette(rgb,m,16)
    cl=classify(rgb,pal); cl[m==0]=-1
    areas=[(int((cl==i).sum()),i) for i in range(len(pal))]
    order=[i for a,i in sorted(areas,reverse=True) if a>800]
    H,W=m.shape
    layers=[]
    for n,i in enumerate(order):
        later=np.isin(cl,order[n:]).astype(np.uint8)   # stacked
        d=potrace_mask(later,scale=1/K)
        c=pal[i].astype(int)
        layers.append(f'<path fill="#{c[0]:02x}{c[1]:02x}{c[2]:02x}" d="{d}"/>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W/K} {H/K}" width="{W/K*1.6}" height="{H/K*1.6}">'+''.join(layers)+'</svg>'
    open(S+f"trace_{v}.svg","w").write(svg)
    print(v,len(order),len(svg))
    html.append(f'<div style="display:inline-block"><img src="data:image/png;base64,{__import__("base64").b64encode(open(S+v+".png","rb").read()).decode()}" width="{W/K*1.6}"><br>{svg}</div>')
open(S+"compare.html","w").write(''.join(html))
