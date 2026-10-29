"""
Blender Automated Mascot Setup Script
====================================
Script ini dapat dijalankan langsung di Blender:
1. Buka Blender
2. Pergi ke tab "Scripting"
3. Buka file ini (build_mascot_blender.py) dan klik "Run Script"
Atau via terminal:
blender --python build_mascot_blender.py

Fungsi:
- Membersihkan scene default (cube, light bawaan)
- Membuat Empty Image Reference Planes (Front, Right, Back, Top) sesuai file di folder references/
- Membuat blokout geometri 3D awal maskot (Head, Body, Stripes, Goggles, Bandana, Wings)
- Menyiapkan material kartun (PBR Toon-style colors)
"""

import bpy
import os
import math

# Path ke folder references
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASCOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
REF_DIR = os.path.join(MASCOT_DIR, "references")

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Hapus material yang tidak terpakai
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

def setup_reference_image(name, image_path, location, rotation, size=3.0):
    if not os.path.exists(image_path):
        print(f"Warning: Reference image {image_path} not found.")
        return None
    
    img = bpy.data.images.load(image_path)
    empty = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(empty)
    empty.empty_display_type = 'IMAGE'
    empty.data = img
    empty.empty_image_side = 'DOUBLE'
    empty.empty_image_depth = 'BACK'
    empty.empty_image_offset = [-0.5, -0.5]
    empty.empty_draw_size = size
    empty.location = location
    empty.rotation_euler = rotation
    empty.show_in_front = True
    empty.color[3] = 0.5  # 50% opacity
    return empty

def create_toon_material(name, color_rgba, roughness=0.35):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color_rgba
        bsdf.inputs['Roughness'].default_value = roughness
    return mat

def build_mascot_blockout():
    # Materials
    mat_yellow = create_toon_material("Mascot_Yellow", (0.99, 0.72, 0.07, 1.0), roughness=0.3)
    mat_black = create_toon_material("Mascot_Black", (0.10, 0.10, 0.12, 1.0), roughness=0.5)
    mat_brown = create_toon_material("Mascot_Brown", (0.33, 0.20, 0.11, 1.0), roughness=0.4)
    mat_wing = create_toon_material("Mascot_Wing", (0.72, 0.88, 0.98, 1.0), roughness=0.1)
    mat_lens = create_toon_material("Mascot_Cyan_Lens", (0.08, 0.72, 0.65, 1.0), roughness=0.15)

    # 1. Body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1.0, location=(0, 0, 0.8))
    body = bpy.context.active_object
    body.name = "Body"
    body.scale = (1.0, 0.98, 1.05)
    body.data.materials.append(mat_yellow)
    bpy.ops.object.shade_smooth()

    # 2. Body Stripes (Black Bands)
    for i, z_pos in enumerate([0.7, 0.38]):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.98, minor_radius=0.09,
            major_segments=48, minor_segments=16,
            location=(0, 0, z_pos)
        )
        stripe = bpy.context.active_object
        stripe.name = f"Stripe_{i+1}"
        stripe.data.materials.append(mat_black)
        bpy.ops.object.shade_smooth()

    # 3. Head
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1.18, location=(0, 0, 1.85))
    head = bpy.context.active_object
    head.name = "Head"
    head.scale = (1.05, 1.05, 0.98)
    head.data.materials.append(mat_yellow)
    bpy.ops.object.shade_smooth()

    # 4. Goggles (Strap & Eyepieces)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.22, minor_radius=0.08,
        major_segments=48, minor_segments=16,
        location=(0, 0, 2.3),
        rotation=(math.radians(12), 0, 0)
    )
    strap = bpy.context.active_object
    strap.name = "Goggle_Strap"
    strap.data.materials.append(mat_brown)
    bpy.ops.object.shade_smooth()

    # Eyepieces (Left and Right)
    for side, x in [("L", -0.42), ("R", 0.42)]:
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.30, minor_radius=0.065,
            major_segments=36, minor_segments=16,
            location=(x, 1.05, 2.38),
            rotation=(math.radians(90), 0, 0)
        )
        rim = bpy.context.active_object
        rim.name = f"Goggle_Rim_{side}"
        rim.data.materials.append(mat_brown)
        bpy.ops.object.shade_smooth()

        # Lens
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.27, depth=0.03,
            location=(x, 1.06, 2.38),
            rotation=(math.radians(90), 0, 0)
        )
        lens = bpy.context.active_object
        lens.name = f"Goggle_Lens_{side}"
        lens.data.materials.append(mat_lens)
        bpy.ops.object.shade_smooth()

    # 5. Wings (Back)
    for side, x in [("L", -0.45), ("R", 0.45)]:
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.6,
            location=(x, -0.95, 1.25)
        )
        wing = bpy.context.active_object
        wing.name = f"Wing_Top_{side}"
        wing.scale = (0.7, 0.08, 0.45)
        wing.rotation_euler = (0, math.radians(-20 if x > 0 else 20), 0)
        wing.data.materials.append(mat_wing)
        bpy.ops.object.shade_smooth()

    # 6. Stinger
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.16, depth=0.4,
        location=(0, -1.02, 0.25),
        rotation=(math.radians(-85), 0, 0)
    )
    stinger = bpy.context.active_object
    stinger.name = "Stinger"
    stinger.data.materials.append(mat_black)
    bpy.ops.object.shade_smooth()

    print("✅ Blockout Maskot berhasil dibuat!")

def main():
    print("Memulai setup Maskot 3D di Blender...")
    clear_scene()

    # Setup Turnaround References
    front_ref = os.path.join(REF_DIR, "front.png")
    right_ref = os.path.join(REF_DIR, "right.png")
    back_ref = os.path.join(REF_DIR, "back.png")
    top_ref = os.path.join(REF_DIR, "top.png")

    setup_reference_image("REF_Front", front_ref, (0, -2.5, 1.4), (math.radians(90), 0, 0), size=3.2)
    setup_reference_image("REF_Right", right_ref, (2.5, 0, 1.4), (math.radians(90), 0, math.radians(-90)), size=3.2)
    setup_reference_image("REF_Back", back_ref, (0, 2.5, 1.4), (math.radians(90), 0, math.radians(180)), size=3.2)
    setup_reference_image("REF_Top", top_ref, (0, 0, -1.5), (0, 0, 0), size=3.2)

    # Buat geometri dasar maskot
    build_mascot_blockout()

    # Setup Lighting Studio
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 8))
    sun = bpy.context.active_object
    sun.data.energy = 4.0

    print("Selesai! Referensi Turnaround 2D & Model 3D siap di-sculpt/export.")

if __name__ == "__main__":
    main()
