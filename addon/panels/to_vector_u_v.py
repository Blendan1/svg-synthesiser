import bpy
import os

bl_info = {
    "name": "UV to SVG",
    "version": (0, 1, 0, 0),
    "blender": (3, 4, 0),
    "location": "View3D > Sidebar",
    "description": "Generate an SVG file from an objects UV",
    "category": "Import-Export"}

class ExportSVG(bpy.types.Operator):
    bl_idname = 'export.svg'
    bl_label = 'Export SVG'
    bl_description = 'Generate SVG file from active view'
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        self.run()
        return {'FINISHED'}

    def get_frame_path(self):
        wm = bpy.context.window_manager

        parte_izq = os.path.splitext(wm.svg_out_path)[0]
        parte_der = os.path.splitext(wm.svg_out_path)[1]
        parte_num = str(int(bpy.context.scene.frame_current)).zfill(4)
        return bpy.path.abspath('%s_%s%s' % (parte_izq, parte_num, parte_der))

    def run_for_frame(self, obj, index):
        out = bpy.path.abspath(f"{bpy.context.window_manager.svg_out_path}/frame_{str(index).zfill(8)}.svg")
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

    def run(self):
        scn = bpy.context.scene

        out_folder = bpy.context.window_manager.svg_out_path
        os.makedirs(bpy.path.abspath(out_folder), exist_ok=True)
        obj = bpy.context.active_object

        # Set the camera view
        # bpy.ops.view3d.camera_to_view()

        for frame in range(scn.frame_start, scn.frame_end + 1):
            scn.frame_set(frame)
            self.run_for_frame(obj, frame)

class ToVectorUVPanel(bpy.types.Panel):
    bl_idname = "view3d.to_vector_uv"
    bl_label = "To Vector UV"
    bl_category = "SVG"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    #bl_options = {'REGISTER', 'UNDO'}

    def draw(self, context):
        wm = bpy.context.window_manager
        layout = self.layout
        column = layout.column()
        column.prop(wm, 'svg_out_path')
        column.operator('export.svg', text='Export SVG')
        column.separator()
        pass


bpy.types.WindowManager.svg_out_path = bpy.props.StringProperty(name='', subtype='FILE_PATH',
                                                                default='//vector-uvs',
                                                                description='Save the SVG file - use absolute path')


classes = (
    ExportSVG,
    ToVectorUVPanel,
)
register, unregister = bpy.utils.register_classes_factory(classes)


if __name__ == "__main__":
    register()
