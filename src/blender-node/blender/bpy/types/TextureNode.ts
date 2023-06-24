import * as util from 'util'
import { BlenderCollection, Indexable } from '../../collection'
import { BlenderInterop } from '../../../worker/interop'
import { PythonInterop } from '../../../python/interop'
import { bpy_struct } from './bpy_struct'
import { Node } from './Node'
import { NodeInternal } from './NodeInternal'

/**
 * TextureNode
 * 
 * https://docs.blender.org/api/current/bpy.types.TextureNode.html
 */
export class TextureNode {

    constructor(public interop: BlenderInterop, public accessor: string) { }

    [util.inspect.custom]() {
        return this.accessor
    }
}
