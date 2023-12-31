import bpy
import os
import sys

argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"


def run_for_frame(obj, index):
    out = bpy.path.abspath(f"{argv[0]}/frame_{str(index).zfill(8)}.svg")
    # Set the active object

    new_mesh = obj.data.copy()
    new_obj = obj.copy()
    new_obj.data = new_mesh
    bpy.context.collection.objects.link(new_obj)

    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = new_obj
    new_obj.select_set(True)
    bpy.ops.object.convert(target='MESH')

    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action='SELECT')
    if len(new_obj.data.uv_layers) == 0:
        new_obj.data.uv_layers.new()

    if bpy.ops.uv.project_from_view.poll():
        # Unwrap the object using Project from View
        # bpy.ops.uv.cube_project()
        bpy.ops.uv.project_from_view(orthographic=False, camera_bounds=False, correct_aspect=False,
                                     scale_to_bounds=False)

        # Export the UV coordinates as SVG
        bpy.ops.uv.export_layout(filepath=out, export_all=True, modified=True, mode="SVG")

    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.delete()


def run():
    scn = bpy.context.scene

    out_folder = argv[0]
    os.makedirs(bpy.path.abspath(out_folder), exist_ok=True)
    obj = bpy.context.active_object

    # Set the camera view
    # bpy.ops.view3d.camera_to_view()

    print("Frames: " + str(scn.frame_start) + "; " + str(scn.frame_end))
    print("Fps: " + str(scn.render.fps))

    for frame in range(scn.frame_start, scn.frame_end + 1):
        scn.frame_set(frame)
        run_for_frame(obj, frame)


for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        area3D = area

for region in area3D.regions:
    if region.type == 'WINDOW':
        regionWindow = region

with bpy.context.temp_override(area=area3D, region=regionWindow):
    bpy.ops.object.select_all(action='DESELECT')

    area3D.spaces[0].region_3d.view_perspective = 'CAMERA'
    bpy.ops.view3d.view_center_camera()

    obj = bpy.data.objects[argv[1]]
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    run()
    print("RESULT GOOD")
