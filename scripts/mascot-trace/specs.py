# All coordinates are in the 4x-upscaled crop space of each view (see common.BOXES / grid images).
# part fields: tags (semantic colour filter), poly(s) region, pivot, parent, z (order in list), backfill (zone to inpaint in body)
Y='yellow'  # any yellow-ish incl. outline shades
def P(*pts): return list(pts)
SPECS={}
SPECS['front']=dict(
 clear=[(0,0,40,40)],
 order=['wingLL','wingUL','wingLR','wingUR','legL','legR','body','armL','armR','bag','head','goggles','cheekL','cheekR','eyeL','eyeR','mouth','antL','antR'],
 parts=dict(
  goggles=dict(tags=['teal','brown','bagbrown'],poly=P((265,150),(1030,150),(1030,450),(265,450)),pivot=(0,0),parent='head',goggles=True),
  legL=dict(tags=['yellow','cream','other','white','brown'],poly=P((380, 1235), (645, 1235), (645, 1460), (380, 1460)),pivot=(500, 1260),ytop=1345,ovl=95,backfill=P((380,1345),(645,1345),(645,1405),(380,1405))),
  legR=dict(tags=['yellow','cream','other','white','brown'],poly=P((645, 1235), (880, 1235), (880, 1460), (645, 1460)),pivot=(770, 1260),ytop=1345,ovl=95,backfill=P((645,1345),(880,1345),(880,1405),(645,1405))),
  antL=dict(tags=['dark'],poly=P((250,0),(640,0),(640,235),(250,235)),pivot=(540,215),parent='head'),
  antR=dict(tags=['dark'],poly=P((640,0),(1000,0),(1000,235),(640,235)),pivot=(738,215),parent='head'),
  wingUL=dict(tags=['wing'],poly=P((0,0),(640,0),(640,960),(0,960)),pivot=(290,780)),
  wingLL=dict(tags=['wing'],poly=P((0,960),(640,960),(640,1460),(0,1460)),pivot=(320,1060)),
  wingUR=dict(tags=['wing'],poly=P((640,0),(1280,0),(1280,960),(640,960)),pivot=(980,780)),
  wingLR=dict(tags=['wing'],poly=P((640,960),(1280,960),(1280,1460),(640,1460)),pivot=(930,1060)),
  head=dict(tags=['*'],poly=P((265,150),(1030,150),(1030,640),(985,710),(920,765),(840,800),(740,822),(640,828),(540,822),(440,800),(350,760),(295,700),(268,620)),
        excl_dark_below=720,pivot=(640,700),parent=None,backfill=P((330,700),(960,700),(960,860),(330,860)),neck_fill='dark'),
  cheekL=dict(tags=['pink'],poly=P((380,560),(640,560),(640,720),(380,720)),pivot=(510,655),parent='head'),
  cheekR=dict(tags=['pink'],poly=P((780,540),(1020,540),(1020,700),(780,700)),pivot=(910,625),parent='head'),
  eyeL=dict(eye=P((455,440),(670,440),(670,650),(455,650)),pivot=(570,545),parent='head'),
  eyeR=dict(eye=P((750,430),(950,430),(950,630),(750,630)),pivot=(850,535),parent='head'),
  mouth=dict(tags=['dark','bagbrown','brown','mouth','white','pink','cream','other'],poly=P((640,595),(790,595),(790,700),(640,700)),pivot=(715,640),parent='head',mouth=True),
  armL=dict(autoroot=True,tags=['yellow'],poly=P((40,880),(300,820),(420,820),(420,940),(355,985),(340,1040),(240,1080),(80,1075),(40,1010)),pivot=(350,900),backfill=P((330,830),(430,830),(430,1010),(330,1010))),
  armR=dict(autoroot=True,tags=['yellow'],poly=P((880,830),(1010,800),(1250,880),(1250,1010),(1170,1070),(1000,1060),(950,1010),(905,945)),pivot=(920,900),backfill=P((870,830),(950,830),(950,1010),(870,1010))),
  bag=dict(tags=['bagbrown'],poly=P((755,1065),(1045,1065),(1045,1335),(755,1335)),pivot=(930,1075),backfill=P((755,1065),(1045,1065),(1045,1335),(755,1335))),
 ))
SPECS['three']=dict(
 clear=[(0,0,70,130)],
 order=['wingL','wingU','legL','legR','body','arm','bag','head','goggles','cheekL','cheekR','eyeL','eyeR','mouth','antL','antR'],
 parts=dict(
  goggles=dict(tags=['teal','brown','bagbrown'],poly=P((160,140),(880,140),(880,420),(160,420)),pivot=(0,0),parent='head',goggles=True),
  legL=dict(tags=['yellow','cream','other','white','brown'],poly=P((330, 1075), (500, 1075), (500, 1200), (330, 1200)),pivot=(400, 1095),ytop=1130,ovl=95,backfill=P((330,1130),(500,1130),(500,1190),(330,1190))),
  legR=dict(tags=['yellow','cream','other','white','brown'],poly=P((500, 1075), (700, 1075), (700, 1200), (500, 1200)),pivot=(600, 1095),ytop=1130,ovl=95,backfill=P((500,1130),(700,1130),(700,1190),(500,1190))),
  antL=dict(tags=['dark'],poly=P((250,0),(500,0),(500,195),(250,195)),pivot=(455,175),parent='head'),
  antR=dict(tags=['dark'],poly=P((500,0),(850,0),(850,195),(500,195)),pivot=(630,175),parent='head'),
  wingU=dict(tags=['wing'],poly=P((0,0),(400,0),(400,830),(0,830)),pivot=(210,700)),
  wingL=dict(tags=['wing'],poly=P((0,830),(400,830),(400,1100),(0,1100)),pivot=(230,900)),
  head=dict(tags=['*'],poly=P((165,140),(870,140),(870,520),(840,600),(780,660),(700,705),(600,730),(500,735),(400,720),(300,690),(220,640),(180,560),(165,450)),
        excl_dark_below=650,pivot=(500,650),backfill=P((260,640),(780,640),(780,800),(260,800)),neck_fill='dark'),
  cheekL=dict(tags=['pink'],poly=P((350,540),(500,540),(500,630),(350,630)),pivot=(420,583),parent='head'),
  cheekR=dict(tags=['pink'],poly=P((700,510),(870,510),(870,610),(700,610)),pivot=(775,558),parent='head'),
  eyeL=dict(eye=P((385,405),(560,405),(560,545),(385,545)),pivot=(470,480),parent='head'),
  eyeR=dict(eye=P((635,390),(800,390),(800,540),(635,540)),pivot=(715,465),parent='head'),
  mouth=dict(tags=['dark','bagbrown','brown','cream','other','mouth'],poly=P((545,540),(670,540),(670,605),(545,605)),pivot=(605,565),parent='head',mouth=True),
  arm=dict(tags=['yellow'],poly=P((170,790),(330,790),(335,880),(305,935),(285,990),(190,990),(170,900)),pivot=(260,800),backfill=P((170,790),(335,790),(335,990),(170,990))),
  bag=dict(tags=['bagbrown','cream'],poly=P((630,780),(890,780),(890,1100),(630,1100)),pivot=(740,905),backfill=P((630,890),(830,890),(830,1100),(630,1100))),
 ))
SPECS['right']=dict(
 clear=[],
 order=['wingL','wingU','legL','legR','body','arm','bag','head','goggles','cheek','eye','mouth','antL','antR'],
 parts=dict(
  goggles=dict(tags=['teal','brown','bagbrown'],poly=P((235,150),(940,150),(940,500),(235,500)),pivot=(0,0),parent='head',goggles=True),
  legL=dict(tags=['yellow','cream','other','white','brown'],poly=P((400, 1255), (585, 1255), (585, 1460), (400, 1460)),pivot=(500, 1280),ytop=1345,ovl=95,backfill=P((400,1345),(585,1345),(585,1405),(400,1405))),
  legR=dict(tags=['yellow','cream','other','white','brown'],poly=P((585, 1255), (730, 1255), (730, 1460), (585, 1460)),pivot=(640, 1280),ytop=1345,ovl=95,backfill=P((585,1345),(730,1345),(730,1405),(585,1405))),
  antL=dict(tags=['dark'],poly=P((500,0),(650,0),(650,232),(500,232)),pivot=(615,215),parent='head'),
  antR=dict(tags=['dark'],poly=P((650,0),(1000,0),(1000,232),(650,232)),pivot=(725,195),parent='head'),
  wingU=dict(tags=['wing'],poly=P((0,0),(420,0),(420,905),(0,905)),pivot=(300,760)),
  wingL=dict(tags=['wing'],poly=P((0,905),(420,905),(420,1300),(0,1300)),pivot=(280,1000)),
  head=dict(tags=['*'],poly=P((235,170),(560,150),(800,205),(895,215),(920,270),(922,400),(935,450),(945,590),(920,680),(840,770),(700,815),(550,820),(400,790),(300,740),(250,640),(240,500)),
        excl_dark_below=690,pivot=(580,720),backfill=P((300,700),(850,700),(850,850),(300,850)),neck_fill='dark'),
  cheek=dict(tags=['pink'],poly=P((620,580),(780,580),(780,690),(620,690)),pivot=(710,640),parent='head'),
  eye=dict(eye=P((690,455),(860,455),(860,620),(690,620)),pivot=(780,545),parent='head'),
  mouth=dict(tags=['dark','bagbrown','brown','cream','other','mouth'],poly=P((845,605),(950,605),(950,670),(845,670)),pivot=(895,640),parent='head',mouth=True),
  arm=dict(tags=['*'],poly=P((345,850),(525,850),(528,1000),(520,1130),(430,1160),(350,1130),(340,1000)),pivot=(430,870),backfill=P((330,850),(530,850),(530,1160),(330,1160))),
  bag=dict(tags=['bagbrown','cream'],poly=P((740,950),(965,950),(965,1315),(740,1315)),pivot=(870,1085),backfill=P((740,1085),(950,1085),(950,1315),(740,1315))),
 ))
SPECS['left']=dict(
 clear=[],
 order=['wingL','wingU','legL','legR','body','arm','bag','head','goggles','cheek','eye','mouth','antL','antR'],
 parts=dict(
  goggles=dict(tags=['teal','brown','bagbrown'],poly=P((40,150),(760,150),(760,520),(40,520)),pivot=(0,0),parent='head',goggles=True),
  legL=dict(tags=['yellow','cream','other','white','brown'],poly=P((280, 1280), (430, 1280), (430, 1460), (280, 1460)),pivot=(360, 1305),ytop=1355,ovl=95,backfill=P((280,1355),(430,1355),(430,1415),(280,1415))),
  legR=dict(tags=['yellow','cream','other','white','brown'],poly=P((430, 1280), (580, 1280), (580, 1460), (430, 1460)),pivot=(500, 1305),ytop=1355,ovl=95,backfill=P((430,1355),(580,1355),(580,1415),(430,1415))),
  antL=dict(tags=['dark'],poly=P((60,0),(320,0),(320,232),(60,232)),pivot=(270,195),parent='head'),
  antR=dict(tags=['dark'],poly=P((320,0),(600,0),(600,232),(320,232)),pivot=(370,215),parent='head'),
  wingU=dict(tags=['wing'],poly=P((640,0),(1000,0),(1000,925),(640,925)),pivot=(720,780)),
  wingL=dict(tags=['wing'],poly=P((640,925),(1000,925),(1000,1300),(640,1300)),pivot=(740,1000)),
  head=dict(tags=['*'],poly=P((70,235),(120,212),(280,175),(500,150),(700,250),(755,440),(755,520),(745,640),(655,745),(520,805),(380,825),(250,805),(120,745),(50,655),(45,560),(70,470),(70,420)),
        excl_dark_below=690,pivot=(420,720),backfill=P((150,700),(700,700),(700,850),(150,850)),neck_fill='dark'),
  cheek=dict(tags=['pink'],poly=P((200,590),(340,590),(340,690),(200,690)),pivot=(265,640),parent='head'),
  eye=dict(eye=P((125,470),(300,470),(300,620),(125,620)),pivot=(210,545),parent='head'),
  mouth=dict(tags=['dark','bagbrown','brown','cream','other','mouth'],poly=P((45,605),(150,605),(150,670),(45,670)),pivot=(100,640),parent='head',mouth=True),
  arm=dict(tags=['*'],poly=P((410,860),(590,860),(590,1010),(580,1100),(540,1160),(450,1160),(420,1100),(410,1000)),pivot=(500,870),backfill=P((400,860),(600,860),(600,1160),(400,1160))),
  bag=dict(tags=['bagbrown','cream'],poly=P((320,985),(735,985),(735,1310),(320,1310)),pivot=(470,1090),backfill=P((320,1085),(640,1085),(640,1310),(320,1310))),
 ))
SPECS['back']=dict(
 clear=[],
 order=['legL','legR','body','armL','armR','head','bag','wingL','wingR','antL','antR'],
 parts=dict(
  legL=dict(tags=['yellow','cream','other','white','brown'],poly=P((320, 1250), (560, 1250), (560, 1460), (320, 1460)),pivot=(440, 1270),ytop=1345,ovl=95,backfill=P((320,1345),(560,1345),(560,1405),(320,1405))),
  legR=dict(tags=['yellow','cream','other','white','brown'],poly=P((560, 1250), (780, 1250), (780, 1460), (560, 1460)),pivot=(680, 1270),ytop=1345,ovl=95,backfill=P((560,1345),(780,1345),(780,1405),(560,1405))),
  antL=dict(tags=['dark'],poly=P((200,0),(560,0),(560,195),(200,195)),pivot=(440,180),parent='head'),
  antR=dict(tags=['dark'],poly=P((560,0),(950,0),(950,195),(560,195)),pivot=(650,180),parent='head'),
  head=dict(tags=['*'],poly=P((170,150),(920,150),(920,700),(700,725),(560,730),(420,725),(170,700)),pivot=(540,650),excl_wing=True),
  wingL=dict(tags=['wing'],poly=P((0,500),(560,500),(560,1300),(0,1300)),pivot=(540,900),backfill=P((150,650),(560,650),(560,1180),(150,1180))),
  wingR=dict(tags=['wing'],poly=P((560,500),(1120,500),(1120,1300),(560,1300)),pivot=(580,900),backfill=P((560,650),(950,650),(950,1180),(560,1180))),
  armL=dict(autoroot=True,tags=['yellow'],poly=P((20,860),(280,860),(300,1010),(150,1070),(30,1060)),pivot=(260,890)),
  armR=dict(autoroot=True,tags=['yellow'],poly=P((830,860),(1090,860),(1090,1050),(950,1070),(820,1010)),pivot=(840,890)),
  bag=dict(tags=['bagbrown','cream'],poly=P((140,960),(350,960),(350,1330),(140,1330)),pivot=(250,1070)),
 ))
SPECS['top']=dict(
 clear=[],
 order=['body','bag','head','wingL','wingR'],
 parts=dict(
  wingL=dict(tags=['wing'],poly=P((0,0),(640,0),(640,500),(0,500)),pivot=(470,330)),
  wingR=dict(tags=['wing'],poly=P((640,0),(1280,0),(1280,500),(640,500)),pivot=(810,330)),
  head=dict(tags=['*'],poly=P((290,300),(450,270),(640,260),(840,275),(960,340),(1010,460),(1005,640),(960,800),(880,900),(760,960),(640,985),(520,960),(400,900),(320,800),(285,640),(285,460)),pivot=(650,630),excl_wing=True),
  bag=dict(tags=['bagbrown','cream'],poly=P((880,430),(1130,430),(1130,890),(880,890)),pivot=(1000,560)),
 ))
SPECS['bottom']=dict(
 clear=[],
 order=['wingL','wingR','body','armL','armR','bag'],
 parts=dict(
  wingL=dict(tags=['wing'],poly=P((0,550),(420,550),(420,960),(0,960)),pivot=(330,700)),
  wingR=dict(tags=['wing'],poly=P((700,550),(1120,550),(1120,960),(700,960)),pivot=(800,740)),
  armL=dict(autoroot=True,tags=['yellow'],poly=P((10,290),(300,290),(300,500),(10,500)),pivot=(290,360)),
  armR=dict(autoroot=True,tags=['yellow'],poly=P((830,280),(1100,280),(1100,500),(830,500)),pivot=(840,360)),
  bag=dict(tags=['bagbrown','cream'],poly=P((850,400),(1000,400),(1000,780),(850,780)),pivot=(900,580)),
 ))
