import {Blender} from "./src/blender-node"
import {BlenderObject, CollectionObjects} from "./src/blender-node/blender/bpy/types";

const bpy = new Blender();

console.log("#HERE")
bpy.ops.wm.open_mainfile({filepath: "./test/test.blend"});
console.log("#OPEND")
bpy.ops.object.select_all({action: "DESELECT"});

const obj = bpy.data.objects["Cube.001"] as BlenderObject;

console.log("#GOT OBJ")

const new_mesh = obj.data.copy()
const new_obj = obj.copy()
new_obj.data = new_mesh;
(bpy.context.collection.objects as CollectionObjects).link({object: new_obj});
new_obj.select_set({state: true});

console.log(bpy.context.screen.areas.values());

for(let i = 0; i < bpy.context.screen.areas.length; i++) {
    console.log(bpy.context.screen.areas[i].type);
}

bpy.context.area.type = "VIEW_3D";
bpy.ops.object.convert({target: "MESH"})
const m = new_obj.to_mesh({});
m.calc_normals();
console.log(m.vertices)

bpy.dispose();



