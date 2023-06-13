import bpy
import os

def run_for_frame(obj, index):
    out = bpy.path.abspath(f"//vector-uvs/frame_{str(index).zfill(8)}.svg")
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
        bpy.ops.uv.project_from_view(orthographic=False, camera_bounds=False, correct_aspect=False, scale_to_bounds=False)

        # Export the UV coordinates as SVG
        bpy.ops.uv.export_layout(filepath=out, export_all=True, modified=True, mode="SVG")

    bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.delete()


def run():
    scn = bpy.context.scene

    out_folder = "//vector-uvs"
    os.makedirs(bpy.path.abspath(out_folder), exist_ok=True)
    obj = bpy.context.active_object

    # Set the camera view
    # bpy.ops.view3d.camera_to_view()

    for frame in range(scn.frame_start, scn.frame_end + 1):
        scn.frame_set(frame)
        run_for_frame(obj, frame)


class ToVectorUv(bpy.types.Operator):
    """Tooltip"""
    bl_idname = "view3d.to_vector_uv"
    bl_label = "To Vector UV"

    @classmethod
    def poll(cls, context):
        return context.area.type == "VIEW_3D"

    def execute(self, context):
        run()
        return {'FINISHED'}


def register():
    bpy.utils.register_class(ToVectorUv)


def unregister():
    bpy.utils.unregister_class(ToVectorUv)


if __name__ == "__main__":
    register()
