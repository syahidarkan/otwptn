import * as THREE from 'three';

export class MascotBee {
  [key: string]: any;
  constructor() {
    this.group = new THREE.Group();
    this.wings = [];
    this.antennae = [];
    this.clock = new THREE.Clock();

    // Exact color palette matching 2D turnaround art & user specifications
    this.colors = {
      yellow: 0xF5C242,      // Vibrant, warm bumblebee yellow
      black: 0x1E1F24,       // Soft matte black
      stripeBlack: 0x222222, // Solid charcoal/black stripes
      brownLeather: 0x543320,// Leather satchel & goggle strap
      bronzeRim: 0x7E492B,   // Goggle bezel
      cyanReticle: 0x14B8A6, // Reticle HUD lens
      wingBlue: 0x72CEF7,    // Vibrant, clear pastel sky-blue
      blushPink: 0xFF6B8B,   // Pink blush
      scrollPaper: 0xF5EBD8, // Rolled map
      scrollTie: 0x8C2D19    // Scroll ribbon tie
    };

    this.materials = this.initMaterials();
    this.buildCharacter();
  }

  initMaterials() {
    // Canvas texture for goggle reticle HUD
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, '#2DD4BF');
    grad.addColorStop(0.65, '#0D9488');
    grad.addColorStop(1, '#0F766E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#6EE7B7';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(256, 25);
    ctx.lineTo(256, 487);
    ctx.moveTo(25, 256);
    ctx.lineTo(487, 256);
    ctx.stroke();

    ctx.fillStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.arc(256, 256, 20, 0, Math.PI * 2);
    ctx.fill();

    const goggleTexture = new THREE.CanvasTexture(canvas);
    goggleTexture.colorSpace = THREE.SRGBColorSpace;

    // Procedural body texture with vibrant bumblebee yellow base (#F5C242) and two solid charcoal/black stripes (#222222)
    const bodyCanvas = document.createElement('canvas');
    bodyCanvas.width = 1024;
    bodyCanvas.height = 1024;
    const bCtx = bodyCanvas.getContext('2d') as CanvasRenderingContext2D;

    // Exact vibrant bumblebee yellow base matching head
    bCtx.fillStyle = '#F5C242';
    bCtx.fillRect(0, 0, 1024, 1024);

    // Two solid charcoal/black stripes wrapping cleanly around torso
    bCtx.fillStyle = '#222222';
    // Upper stripe (across mid-chest/upper belly)
    bCtx.fillRect(0, 360, 1024, 135);
    // Lower stripe (across mid-lower belly)
    bCtx.fillRect(0, 580, 1024, 135);

    const bodyTexture = new THREE.CanvasTexture(bodyCanvas);
    bodyTexture.colorSpace = THREE.SRGBColorSpace;
    bodyTexture.wrapS = THREE.RepeatWrapping;
    bodyTexture.wrapT = THREE.ClampToEdgeWrapping;

    return {
      yellow: new THREE.MeshStandardMaterial({
        color: this.colors.yellow,
        roughness: 0.35,
        metalness: 0.02
      }),
      body: new THREE.MeshStandardMaterial({
        map: bodyTexture,
        roughness: 0.35,
        metalness: 0.02
      }),
      black: new THREE.MeshStandardMaterial({
        color: this.colors.black,
        roughness: 0.60,
        metalness: 0.04,
        side: THREE.DoubleSide
      }),
      bandana: new THREE.MeshStandardMaterial({
        color: 0x1B1C22,
        roughness: 0.68,
        metalness: 0.03,
        side: THREE.DoubleSide
      }),
      brownLeather: new THREE.MeshStandardMaterial({
        color: this.colors.brownLeather,
        roughness: 0.42,
        metalness: 0.08,
        side: THREE.DoubleSide
      }),
      bronzeRim: new THREE.MeshStandardMaterial({
        color: this.colors.bronzeRim,
        roughness: 0.30,
        metalness: 0.40
      }),
      goggleLens: new THREE.MeshStandardMaterial({
        map: goggleTexture,
        roughness: 0.15,
        metalness: 0.1,
        emissive: 0x0D9488,
        emissiveIntensity: 0.35
      }),
      // Tiny, rounded, translucent baby-blue wings with soft glass/jelly-like quality
      wing: new THREE.MeshPhysicalMaterial ? new THREE.MeshStandardMaterial({
        color: 0xBAE6FD,
        roughness: 0.12,
        metalness: 0.04,
        transparent: true,
        opacity: 0.76,
        side: THREE.DoubleSide,
        depthWrite: false
      }) : new THREE.MeshStandardMaterial({
        color: 0xBAE6FD,
        roughness: 0.12,
        transparent: true,
        opacity: 0.76,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      eyeBlack: new THREE.MeshStandardMaterial({
        color: 0x111116,
        roughness: 0.12,
        metalness: 0.08,
        side: THREE.DoubleSide
      }),
      mouthInside: new THREE.MeshBasicMaterial({
        color: 0x881337, // Deep dark rose open mouth interior
        side: THREE.DoubleSide
      }),
      tongue: new THREE.MeshBasicMaterial({
        color: 0xFB7185, // Cheerful bright pink tongue
        side: THREE.DoubleSide
      }),
      blush: new THREE.MeshBasicMaterial({
        color: this.colors.blushPink,
        transparent: true,
        opacity: 0.90
      }),
      scroll: new THREE.MeshStandardMaterial({
        color: this.colors.scrollPaper,
        roughness: 0.8
      })
    };
  }

  buildCharacter() {
    this.charRoot = new THREE.Group();
    this.charRoot.position.y = 0.0;
    this.group.add(this.charRoot);

    // Assembly in clean vertical hierarchy:
    // 1. Limbs & feet (short chubby little legs, small stinger)
    this.createLimbs();
    this.createStinger();

    // 2. Body torso: Chubby, fat, round, pot-bellied sphere (Duolingo / Fall Guys style)
    this.createBody();
    this.createStripes();

    // 3. Neck Bandana (snug collar bridging body & head, knot at back)
    this.createNeckScarf();

    // 4. Head: Soft horizontally squashed round sphere, smoothly rounded top
    this.createHead();
    this.createFace();
    this.createGoggles();

    // 5. Wings: Small rounded translucent baby-blue wings on back
    this.createWings();

    // 6. Messenger Bag: Explorer satchel slung on bee's left hip
    this.createMessengerBag();
  }

  createLimbs() {
    // 1. Cute stubby legs detached from the bottom belly, clearly visible standing on the grid (y = 0.0)
    [-0.17, 0.17].forEach(sideX => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sideX, 0.0, 0.02);
      legGroup.rotation.z = -Math.sign(sideX) * 0.08; // Slightly splayed outward
      legGroup.rotation.x = 0.04;

      // Leg pillar extending from under belly (y ~ 0.36) down to feet (y ~ 0.08)
      const legLimbGeo = new THREE.CylinderGeometry(0.105, 0.095, 0.28, 24);
      const legLimb = new THREE.Mesh(legLimbGeo, this.materials.yellow);
      legLimb.position.y = 0.17;
      legLimb.castShadow = true;
      legGroup.add(legLimb);

      // Cute rounded foot standing firmly on the grid
      const footGeo = new THREE.SphereGeometry(0.112, 24, 20);
      footGeo.scale(1.08, 0.65, 1.40); // Cartoon foot elongated forward
      const foot = new THREE.Mesh(footGeo, this.materials.yellow);
      foot.position.set(0, 0.050, 0.040);
      foot.castShadow = true;
      legGroup.add(foot);

      this.charRoot.add(legGroup);
    });

    // 2. Elongated tubular arms extending outward from sides of torso with visible mitten hands & thumb nubs
    [-1, 1].forEach(side => {
      const armGroup = new THREE.Group();
      // Attach to side of narrower torso (x ~ 0.42, y ~ 0.98)
      armGroup.position.set(side * 0.42, 0.98, 0.08);
      armGroup.rotation.z = -side * 0.16; // Angled outward proudly
      armGroup.rotation.y = side * 0.35;  // Angled forward
      armGroup.rotation.x = 0.08;

      // Elongated rounded tubular arm limb
      const armGeo = new THREE.CapsuleGeometry(0.082, 0.42, 16, 24);
      armGeo.rotateZ(Math.PI / 2);
      const arm = new THREE.Mesh(armGeo, this.materials.yellow);
      arm.position.set(side * 0.22, 0, 0);
      arm.castShadow = true;
      armGroup.add(arm);

      // Distinct Mitten Hand Palm
      const handGeo = new THREE.SphereGeometry(0.096, 20, 20);
      handGeo.scale(1.20, 1.0, 0.88);
      const hand = new THREE.Mesh(handGeo, this.materials.yellow);
      hand.position.set(side * 0.44, 0, 0);
      hand.castShadow = true;
      armGroup.add(hand);

      // Distinct Mitten Thumb Nub pointing upward & forward
      const thumbGeo = new THREE.CapsuleGeometry(0.038, 0.095, 12, 16);
      thumbGeo.rotateZ(-side * 0.45);
      thumbGeo.rotateX(0.24);
      const thumb = new THREE.Mesh(thumbGeo, this.materials.yellow);
      thumb.position.set(side * 0.42, 0.085, 0.040);
      thumb.castShadow = true;
      armGroup.add(thumb);

      this.charRoot.add(armGroup);
    });
  }

  createStinger() {
    // Cute conical stinger peeking out at rear bottom of belly
    const stingerGeo = new THREE.ConeGeometry(0.085, 0.22, 24);
    stingerGeo.rotateX(-Math.PI / 2.15);
    const stinger = new THREE.Mesh(stingerGeo, this.materials.black);
    stinger.position.set(0, 0.54, -0.54);
    this.charRoot.add(stinger);
  }

  createBody() {
    // Plump bee body with width scaled down by 30% so head is significantly wider
    this.bodyGroup = new THREE.Group();
    this.charRoot.add(this.bodyGroup);

    // Parametric Plump Round Bean Body (radius 0.55, width ~ 1.06 vs head 1.59)
    const bodyGeo = new THREE.SphereGeometry(0.55, 64, 48);
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Cute rounded pot belly in front (z > 0)
      if (z > 0.0) {
        const bellyFactor = Math.exp(-Math.pow((y + 0.02) / 0.28, 2));
        z *= (1.0 + 0.16 * bellyFactor);
        x *= (1.0 + 0.05 * bellyFactor);
      }

      // Slightly flatten bottom so legs emerge cleanly
      if (y < -0.36) {
        y = -0.36 + (y + 0.36) * 0.72;
      }

      pos.setXYZ(i, x, y, z);
    }
    bodyGeo.computeVertexNormals();

    // Scale: width ~1.06, height ~1.14, depth ~1.08
    bodyGeo.scale(0.96, 1.04, 0.98);

    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.body);
    bodyMesh.position.set(0, 0.85, 0.0);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.bodyGroup.add(bodyMesh);
  }

  createStripes() {
    // Seamlessly integrated directly on body material texture
  }

  createNeckScarf() {
    // Folded fabric neckerchief/bandana tied snugly around the neck junction
    this.scarfGroup = new THREE.Group();
    this.scarfGroup.position.set(0, 1.38, 0.0);
    this.charRoot.add(this.scarfGroup);

    // 1. Snug folded fabric neck band (not a floating donut!)
    // Tapered cylinder collar hugging the base of the head and top of torso
    const collarGeo = new THREE.CylinderGeometry(0.44, 0.49, 0.16, 36, 4, true);
    // Perturb vertices slightly to create organic cloth folds and ripples
    const cPos = collarGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      let x = cPos.getX(i);
      let y = cPos.getY(i);
      let z = cPos.getZ(i);
      const angle = Math.atan2(z, x);
      // Soft fabric ripple / crease
      const fold = Math.sin(angle * 6.0) * 0.016 + Math.cos(angle * 4.0 + y * 12.0) * 0.012;
      x += Math.cos(angle) * fold;
      z += Math.sin(angle) * fold;
      cPos.setXYZ(i, x, y, z);
    }
    collarGeo.computeVertexNormals();
    const collar = new THREE.Mesh(collarGeo, this.materials.bandana);
    this.scarfGroup.add(collar);

    // Upper folded fabric rim (rolled cloth hem at top of bandana)
    const topRollGeo = new THREE.TorusGeometry(0.44, 0.038, 16, 36);
    topRollGeo.rotateX(Math.PI / 2);
    topRollGeo.scale(1.0, 1.0, 0.85);
    const topRoll = new THREE.Mesh(topRollGeo, this.materials.bandana);
    topRoll.position.y = 0.07;
    this.scarfGroup.add(topRoll);

    // Lower folded fabric rim (creased fold overlapping chest)
    const btmRollGeo = new THREE.TorusGeometry(0.49, 0.034, 16, 36);
    btmRollGeo.rotateX(Math.PI / 2);
    btmRollGeo.scale(1.0, 1.0, 0.88);
    const btmRoll = new THREE.Mesh(btmRollGeo, this.materials.bandana);
    btmRoll.position.y = -0.07;
    this.scarfGroup.add(btmRoll);

    // 2. Folded triangular fabric bib / drape hanging over the upper chest
    const bibShape = new THREE.Shape();
    bibShape.moveTo(-0.18, 0.05);
    bibShape.bezierCurveTo(-0.16, 0.02, -0.12, -0.14, 0.0, -0.25);
    bibShape.bezierCurveTo(0.12, -0.14, 0.16, 0.02, 0.18, 0.05);
    bibShape.closePath();

    const bibGeo = new THREE.ExtrudeGeometry(bibShape, {
      depth: 0.032,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012
    });
    const bib = new THREE.Mesh(bibGeo, this.materials.bandana);
    bib.position.set(0.04, -0.02, 0.47);
    bib.rotation.x = -0.32; // Follows chest curve
    bib.rotation.z = -0.06;
    bib.castShadow = true;
    this.scarfGroup.add(bib);

    // Secondary soft cloth fold across front
    const foldCreaseGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.24, 12);
    foldCreaseGeo.rotateZ(Math.PI / 2.2);
    const foldCrease = new THREE.Mesh(foldCreaseGeo, this.materials.bandana);
    foldCrease.position.set(0.04, 0.02, 0.49);
    foldCrease.rotation.x = -0.35;
    this.scarfGroup.add(foldCrease);

    // 3. Small cloth knot tied at the side (front-right side)
    const knotGroup = new THREE.Group();
    knotGroup.position.set(0.32, 0.02, 0.34);
    knotGroup.rotation.y = 0.45;
    knotGroup.rotation.z = -0.15;

    // Knot core bundle
    const knotCoreGeo = new THREE.SphereGeometry(0.058, 16, 16);
    knotCoreGeo.scale(0.9, 0.75, 1.1);
    const knotCore = new THREE.Mesh(knotCoreGeo, this.materials.bandana);
    knotGroup.add(knotCore);

    // Knot wrap tie around the bundle
    const knotWrapGeo = new THREE.TorusGeometry(0.052, 0.020, 12, 24);
    knotWrapGeo.rotateY(Math.PI / 2.3);
    const knotWrap = new THREE.Mesh(knotWrapGeo, this.materials.bandana);
    knotGroup.add(knotWrap);

    // 4. Two trailing ends pointing gracefully to the side
    // Long tail
    const tail1Shape = new THREE.Shape();
    tail1Shape.moveTo(-0.038, 0.0);
    tail1Shape.lineTo(0.038, 0.0);
    tail1Shape.lineTo(0.022, -0.22);
    tail1Shape.lineTo(0.0, -0.26); // Swallow-tail point
    tail1Shape.lineTo(-0.022, -0.22);
    tail1Shape.closePath();
    const tail1Geo = new THREE.ExtrudeGeometry(tail1Shape, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006 });
    const tail1 = new THREE.Mesh(tail1Geo, this.materials.bandana);
    tail1.position.set(0.01, -0.02, 0.02);
    tail1.rotation.z = -0.35; // Pointing to the side
    tail1.rotation.y = 0.25;
    tail1.rotation.x = -0.18;
    tail1.castShadow = true;
    knotGroup.add(tail1);

    // Short tail
    const tail2Shape = new THREE.Shape();
    tail2Shape.moveTo(-0.032, 0.0);
    tail2Shape.lineTo(0.032, 0.0);
    tail2Shape.lineTo(0.020, -0.16);
    tail2Shape.lineTo(0.0, -0.19);
    tail2Shape.lineTo(-0.020, -0.16);
    tail2Shape.closePath();
    const tail2Geo = new THREE.ExtrudeGeometry(tail2Shape, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006 });
    const tail2 = new THREE.Mesh(tail2Geo, this.materials.bandana);
    tail2.position.set(-0.02, -0.01, 0.04);
    tail2.rotation.z = -0.10;
    tail2.rotation.y = 0.40;
    tail2.rotation.x = -0.25;
    tail2.castShadow = true;
    knotGroup.add(tail2);

    this.scarfGroup.add(knotGroup);
  }

  createWings() {
    // Translucent baby-blue rounded wings on the upper back of narrower torso
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 1.08, -0.48);
    this.charRoot.add(this.wingsGroup);

    // Cute rounded mounting joint on back
    const mountGeo = new THREE.SphereGeometry(0.060, 16, 16);
    mountGeo.scale(1.2, 0.8, 0.8);
    const mount = new THREE.Mesh(mountGeo, this.materials.yellow);
    mount.position.set(0, 0.0, 0.02);
    this.wingsGroup.add(mount);

    // Upper Wings (Rounded, blunt petal)
    [-1, 1].forEach(side => {
      const upperPivot = new THREE.Group();
      upperPivot.position.set(side * 0.12, 0.04, 0.0);

      // Blunt rounded oval
      const wingGeo = new THREE.SphereGeometry(1.0, 32, 24);
      wingGeo.scale(0.40, 0.62, 0.055);

      const wingMesh = new THREE.Mesh(wingGeo, this.materials.wing);
      wingMesh.position.set(0, 0.48, 0);
      wingMesh.castShadow = true;

      // Angled diagonally up & out to peek past the shoulders in front view
      upperPivot.rotation.z = -side * 0.90;
      upperPivot.rotation.y = side * 0.22;
      upperPivot.rotation.x = -0.28;

      upperPivot.add(wingMesh);
      this.wingsGroup.add(upperPivot);

      this.wings.push({
        pivot: upperPivot,
        baseRotY: upperPivot.rotation.y,
        baseRotX: upperPivot.rotation.x,
        side: side,
        isTop: true
      });
    });

    // Lower Wings (Smaller rounded droplet wings)
    [-1, 1].forEach(side => {
      const lowerPivot = new THREE.Group();
      lowerPivot.position.set(side * 0.10, -0.04, 0.0);

      // Small rounded droplet
      const wingGeo = new THREE.SphereGeometry(1.0, 32, 24);
      wingGeo.scale(0.28, 0.40, 0.048);

      const wingMesh = new THREE.Mesh(wingGeo, this.materials.wing);
      wingMesh.position.set(0, 0.30, 0);
      wingMesh.castShadow = true;

      lowerPivot.rotation.z = -side * 1.45;
      lowerPivot.rotation.y = side * 0.12;
      lowerPivot.rotation.x = -0.20;

      lowerPivot.add(wingMesh);
      this.wingsGroup.add(lowerPivot);

      this.wings.push({
        pivot: lowerPivot,
        baseRotY: lowerPivot.rotation.y,
        baseRotX: lowerPivot.rotation.x,
        side: side,
        isTop: false
      });
    });
  }

  createHead() {
    // Synchronized head: soft, rounded chubby pear dome matching the plump body
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 2.05, 0.0);
    this.charRoot.add(this.headGroup);

    // Balanced chubby-pear head sphere (radius 0.78)
    const headGeo = new THREE.SphereGeometry(0.78, 64, 48);
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // 1. Gently narrow upper forehead crown
      if (y > 0.15) {
        const t = (y - 0.15) / 0.63;
        const taper = Math.pow(t, 1.2) * 0.08;
        x *= (1.0 - taper);
        z *= (1.0 - taper * 0.5);
      }

      // 2. Soft, cute chubby cheeks in lower-mid face (gentle curve, not a wide flat saucer)
      if (y < 0.20 && y > -0.55) {
        const cheek = Math.sin((0.20 - y) / 0.75 * Math.PI);
        x *= (1.0 + 0.045 * Math.pow(cheek, 0.9));
        z *= (1.0 + 0.02 * Math.pow(cheek, 0.9));
      }

      // 3. Gentle snout volume in front (z > 0)
      if (z > 0.0) {
        const snoutFactor = Math.exp(-Math.pow((y + 0.02) / 0.32, 2));
        z *= (1.0 + 0.04 * snoutFactor);
      }

      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    // Balanced proportion: width ~1.56, height ~1.50, depth ~1.53
    headGeo.scale(1.02, 0.96, 0.98);

    const headMesh = new THREE.Mesh(headGeo, this.materials.yellow);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Two small curved black bee antennae on top
    [-1, 1].forEach(side => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * 0.06, 0.22, -0.03),
        new THREE.Vector3(side * 0.16, 0.36, 0.03),
        new THREE.Vector3(side * 0.24, 0.42, 0.02)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.032, 12, false);
      const antMesh = new THREE.Mesh(tubeGeo, this.materials.black);
      antMesh.position.set(side * 0.15, 0.70, -0.05);
      this.headGroup.add(antMesh);

      // Bulbous tips
      const tipGeo = new THREE.SphereGeometry(0.058, 16, 16);
      const tipMesh = new THREE.Mesh(tipGeo, this.materials.black);
      tipMesh.position.copy(antMesh.position).add(new THREE.Vector3(side * 0.24, 0.42, 0.02));
      this.headGroup.add(tipMesh);
    });
  }

  createFace() {
    const faceGroup = new THREE.Group();
    this.headGroup.add(faceGroup);

    // Softly Arched Thick Eyebrows
    [-1, 1].forEach(side => {
      const browGroup = new THREE.Group();
      browGroup.position.set(side * 0.26, 0.22, 0.78);
      browGroup.rotation.y = side * 0.24;
      browGroup.rotation.x = -0.08;

      const browCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-side * 0.07, -0.020, 0.01),
        new THREE.Vector3(-side * 0.015, 0.032, 0.012),
        new THREE.Vector3(side * 0.04, 0.020, 0.012),
        new THREE.Vector3(side * 0.07, -0.020, 0.01)
      );
      const browGeo = new THREE.TubeGeometry(browCurve, 16, 0.024, 8, false);
      const brow = new THREE.Mesh(browGeo, this.materials.black);
      browGroup.add(brow);
      faceGroup.add(browGroup);
    });

    // Giant Glossy Anime Eyes
    [-1, 1].forEach(side => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.26, 0.04, 0.80);
      eyeGroup.rotation.y = side * 0.24;
      eyeGroup.rotation.x = -0.04;

      // Glossy black convex eye disc
      const eyeGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.030, 48);
      eyeGeo.rotateX(Math.PI / 2);
      eyeGeo.scale(0.88, 1.08, 1.0);
      const eyeMesh = new THREE.Mesh(eyeGeo, this.materials.eyeBlack);
      eyeMesh.position.z = 0.02;
      eyeGroup.add(eyeMesh);

      // Upper-left large catchlight reflection sparkle (consistent light direction)
      const high1Geo = new THREE.CircleGeometry(0.068, 32);
      const high1 = new THREE.Mesh(high1Geo, new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
      }));
      high1.position.set(-0.045, 0.060, 0.036);
      eyeGroup.add(high1);

      // Lower-left small catchlight reflection sparkle
      const high2Geo = new THREE.CircleGeometry(0.036, 32);
      const high2 = new THREE.Mesh(high2Geo, new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
      }));
      high2.position.set(-0.045, -0.055, 0.036);
      eyeGroup.add(high2);

      faceGroup.add(eyeGroup);
    });

    // Small cute bright pink blush ovals horizontally stretched on chubby lower cheeks
    [-1, 1].forEach(side => {
      const blushGroup = new THREE.Group();
      blushGroup.position.set(side * 0.42, -0.07, 0.70);
      blushGroup.rotation.y = side * 0.38;
      blushGroup.rotation.x = -0.08;

      const blushGeo = new THREE.CircleGeometry(0.12, 32);
      blushGeo.scale(1.35, 0.65, 1.0);
      const blush = new THREE.Mesh(blushGeo, new THREE.MeshBasicMaterial({
        color: this.colors.blushPink,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3
      }));
      blushGroup.add(blush);
      faceGroup.add(blushGroup);
    });

    // Tiny happy open smile with pink tongue
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.13, 0.83);
    mouthGroup.rotation.x = -0.12;

    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.09, 0.015);
    mouthShape.quadraticCurveTo(-0.065, -0.11, 0.0, -0.115);
    mouthShape.quadraticCurveTo(0.065, -0.11, 0.09, 0.015);
    mouthShape.quadraticCurveTo(0, 0.032, -0.09, 0.015);
    mouthShape.closePath();

    const mouthGeo = new THREE.ExtrudeGeometry(mouthShape, {
      depth: 0.030,
      bevelEnabled: false
    });
    const mouthMesh = new THREE.Mesh(mouthGeo, this.materials.mouthInside);
    mouthGroup.add(mouthMesh);

    // Sweet pink tongue inside bottom of mouth
    const tongueShape = new THREE.Shape();
    tongueShape.moveTo(-0.055, -0.035);
    tongueShape.quadraticCurveTo(-0.035, -0.105, 0.0, -0.110);
    tongueShape.quadraticCurveTo(0.035, -0.105, 0.055, -0.035);
    tongueShape.quadraticCurveTo(0, -0.012, -0.055, -0.035);
    tongueShape.closePath();

    const tongueGeo = new THREE.ExtrudeGeometry(tongueShape, {
      depth: 0.032,
      bevelEnabled: false
    });
    const tongueMesh = new THREE.Mesh(tongueGeo, this.materials.tongue);
    mouthGroup.add(tongueMesh);

    // Black curved upper smile lip outline
    const lipCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.10, 0.015, 0.032),
      new THREE.Vector3(-0.04, 0.035, 0.034),
      new THREE.Vector3(0.04, 0.035, 0.034),
      new THREE.Vector3(0.10, 0.015, 0.032)
    );
    const lipGeo = new THREE.TubeGeometry(lipCurve, 16, 0.016, 8, false);
    const lip = new THREE.Mesh(lipGeo, this.materials.black);
    mouthGroup.add(lip);

    faceGroup.add(mouthGroup);
  }

  createGoggles() {
    // Steampunk aviator goggles with exactly TWO round eyepieces across the forehead
    this.goggleGroup = new THREE.Group();
    this.goggleGroup.position.set(0, 0.40, 0.02);
    this.goggleGroup.rotation.x = -0.14;
    this.headGroup.add(this.goggleGroup);

    // Leather strap wrapping neatly around forehead
    const strapGeo = new THREE.CylinderGeometry(0.72, 0.76, 0.12, 48, 1, true);
    const strap = new THREE.Mesh(strapGeo, this.materials.brownLeather);
    this.goggleGroup.add(strap);

    // Exactly TWO Eyepieces across forehead: Left (-0.24) and Right (+0.24)
    [
      { x: -0.24, y: 0.04, rotY: -0.22, rotX: -0.10, z: 0.74 },
      { x:  0.24, y: 0.04, rotY:  0.22, rotX: -0.10, z: 0.74 }
    ].forEach(spec => {
      const eyepiece = new THREE.Group();
      eyepiece.position.set(spec.x, spec.y, spec.z);
      eyepiece.rotation.y = spec.rotY;
      eyepiece.rotation.x = spec.rotX;

      // Bronze Outer Bezel
      const rimGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.070, 36);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.materials.bronzeRim);
      rim.castShadow = true;
      eyepiece.add(rim);

      // Inner Leather Cushion
      const innerRimGeo = new THREE.CylinderGeometry(0.170, 0.170, 0.055, 36);
      innerRimGeo.rotateX(Math.PI / 2);
      const innerRim = new THREE.Mesh(innerRimGeo, this.materials.brownLeather);
      eyepiece.add(innerRim);

      // Planar Circle HUD Target Reticle Lens
      const lensGeo = new THREE.CircleGeometry(0.165, 36);
      const lens = new THREE.Mesh(lensGeo, this.materials.goggleLens);
      lens.position.z = 0.038;
      eyepiece.add(lens);

      this.goggleGroup.add(eyepiece);
    });

    // Single Center Bridge connecting Left and Right eyepieces across the forehead
    const bridgeGeo = new THREE.BoxGeometry(0.14, 0.065, 0.040);
    const bridge = new THREE.Mesh(bridgeGeo, this.materials.brownLeather);
    bridge.position.set(0.0, 0.04, 0.76);
    this.goggleGroup.add(bridge);
  }

  createMessengerBag() {
    // Brown leather explorer courier bag slung across chest to bee's left hip
    this.bagGroup = new THREE.Group();
    this.charRoot.add(this.bagGroup);

    // Crossbody strap: PROMINENTLY visible across the front chest from right shoulder to left hip
    // Points carefully placed OUTSIDE the belly surface in front, and snugly hugging the back
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, 1.30, 0.38),
      new THREE.Vector3(-0.10, 1.08, 0.62),
      new THREE.Vector3(0.14, 0.88, 0.65),
      new THREE.Vector3(0.36, 0.70, 0.54),
      new THREE.Vector3(0.46, 0.58, 0.30),
      new THREE.Vector3(0.32, 0.70, -0.28),
      new THREE.Vector3(0.08, 0.96, -0.44),
      new THREE.Vector3(-0.12, 1.18, -0.36),
      new THREE.Vector3(-0.26, 1.30, 0.05)
    ], true);
    // Bold, thick leather strap that stands out clearly over yellow torso & dark stripes
    const strapGeo = new THREE.TubeGeometry(strapCurve, 64, 0.032, 12, true);
    const strapMesh = new THREE.Mesh(strapGeo, this.materials.brownLeather);
    strapMesh.castShadow = true;
    this.bagGroup.add(strapMesh);

    // Satchel container hanging prominently at the bee's left hip - FULLY VISIBLE IN FRONT VIEW
    const bagContainer = new THREE.Group();
    bagContainer.position.set(0.46, 0.58, 0.32);
    bagContainer.rotation.y = -0.22;
    bagContainer.rotation.z = -0.10;
    bagContainer.rotation.x = 0.08;

    // Balok persegi panjang: Width 0.34, Height 0.26, Depth 0.16
    const bagGeo = new THREE.BoxGeometry(0.34, 0.26, 0.16);
    const bagMesh = new THREE.Mesh(bagGeo, this.materials.brownLeather);
    bagMesh.castShadow = true;
    bagContainer.add(bagMesh);

    // Flap
    const flapGeo = new THREE.BoxGeometry(0.36, 0.13, 0.17);
    const flapMesh = new THREE.Mesh(flapGeo, this.materials.brownLeather);
    flapMesh.position.set(0.0, 0.065, 0.015);
    bagContainer.add(flapMesh);

    // Bronze Clasp
    const studGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.022, 16);
    studGeo.rotateX(Math.PI / 2);
    const stud = new THREE.Mesh(studGeo, this.materials.bronzeRim);
    stud.position.set(0.0, -0.015, 0.085);
    bagContainer.add(stud);

    // Rolled Map / Parchment Scroll peeking out of bag, facing forward & up
    const scrollGroup = new THREE.Group();
    scrollGroup.position.set(0.08, 0.16, 0.02);
    scrollGroup.rotation.z = Math.PI / 4.0;
    scrollGroup.rotation.y = 0.25;

    const scrollGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.26, 16);
    const scrollMesh = new THREE.Mesh(scrollGeo, this.materials.scroll);
    scrollMesh.castShadow = true;
    scrollGroup.add(scrollMesh);

    // Scroll Tie Ribbon
    const ribbonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: this.colors.scrollTie, roughness: 0.5 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    scrollGroup.add(ribbon);

    bagContainer.add(scrollGroup);
    this.bagGroup.add(bagContainer);
  }

  update(time: number) {
    // Gentle Hover Bobbing
    const bob = Math.sin(time * 3) * 0.035;
    this.charRoot.position.y = 0.0 + bob;

    // Subtle breathing tilt
    this.charRoot.rotation.z = Math.sin(time * 1.5) * 0.012;
    this.charRoot.rotation.x = Math.sin(time * 2) * 0.010;

    // Fast Wing Flutter Animation (tiny bee flutter)
    const flutter = Math.sin(time * 32) * 0.22;
    this.wings.forEach((w: any) => {
      w.pivot.rotation.y = w.baseRotY + (w.side * flutter);
      w.pivot.rotation.x = w.baseRotX + Math.cos(time * 32) * 0.03;
    });
  }
}
