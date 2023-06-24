import * as util from 'util'
import { BlenderCollection, Indexable } from '../../collection'
import { BlenderInterop } from '../../../worker/interop'
import { PythonInterop } from '../../../python/interop'
import { bpy_struct } from './bpy_struct'
import { Node } from './Node'
import { NodeInternal } from './NodeInternal'
import { TextureNode } from './TextureNode'

/**
 * TextureNodeRotate
 * 
 * https://docs.blender.org/api/current/bpy.types.TextureNodeRotate.html
 */
export class TextureNodeRotate {

    constructor(public interop: BlenderInterop, public accessor: string) { }

    [util.inspect.custom]() {
        return this.accessor
    }
}