import bpy
import json

obj = bpy.data.objects["Cube.001"]
new_mesh = obj.data.copy()
new_obj = obj.copy()

new_obj.data = new_mesh
bpy.context.collection.objects.link(object=new_obj)
bpy.ops.object.select_all(action= "DESELECT")
new_obj.select_set(True)
bpy.context.view_layer.objects.active = new_obj

for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        area3D = area

with bpy.context.temp_override(area=area3D):
    bpy.ops.object.convert(target= "MESH")
    dg = bpy.context.evaluated_depsgraph_get()

    m = new_obj.to_mesh(depsgraph=dg)
    m.calc_normals()
    print(json.dumps(m))
    bpy.ops.object.delete()
