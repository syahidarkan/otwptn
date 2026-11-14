import json,sys,base64
S="/private/tmp/claude-501/-Users-acan-pemrograman-otwptn/9043d1fa-5161-4abf-8f10-cf110a7ba0d7/scratchpad/"
views=sys.argv[1:]
html=['<body style="margin:0;background:#fff">']
for v in views:
    d=json.load(open(S+f"parts_{v}.json"))
    def lay(L): return ''.join(f'<path fill-rule="evenodd" fill="{l["f"]}" d="{l["d"]}"/>' for l in L)
    g=[]
    for n in d['order']:
        p=d['parts'][n]
        if 'eye' in p:
            e=p['eye']; g.append(f'<g id="{n}">'+lay(e['shape'])+lay(e['pupil'])+''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff"/>' for x,y,r in e['hl'])+lay(e['lash'])+'</g>')
        else: g.append(f'<g id="{n}">'+lay(p['layers'])+'</g>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {d["w"]} {d["h"]}" width="{d["w"]*1.15}" height="{d["h"]*1.15}">'+''.join(g)+'</svg>'
    html.append(f'<div style="display:inline-block;vertical-align:top"><img src="{v}.png" width="{d["w"]*1.15}" style="display:none">{svg}</div>')
open(S+"pv.html","w").write(''.join(html))
