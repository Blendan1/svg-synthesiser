import * as util from 'util'
import { BlenderCollection, Indexable } from '../../collection'
import { BlenderInterop } from '../../../worker/interop'
import { PythonInterop } from '../../../python/interop'
import { BlenderObject } from './BlenderObject'
import { ParticleSystem } from './ParticleSystem'

/**
 * DepsgraphObjectInstance
 * 
 * https://docs.blender.org/api/current/bpy.types.DepsgraphObjectInstance.html
 */
export class DepsgraphObjectInstance {

    constructor(public interop: BlenderInterop, public accessor: string) { }

    /**
     * Evaluated object which is being instanced by this iterator
     * @desc Object, (readonly)
     */
    public get instance_object(): BlenderObject {
        return PythonInterop.getClass(this.interop, `${this.accessor}.instance_object`, BlenderObject)
    }

    /**
     * Denotes if the object is generated by another object
     * @desc boolean, default False, (readonly)
     */
    public get is_instance(): boolean {
        return PythonInterop.getBoolean(this.interop, `${this.accessor}.is_instance`)
    }

    /**
     * Generated transform matrix in world space
     * @desc float multi-dimensional array of 4 * 4 items in [-inf, inf], default ((0.0, 0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0)), (readonly)
     */
    public get matrix_world(): [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] {
        return PythonInterop.getMultiDimensionalArray(this.interop, `${this.accessor}.matrix_world`, 'number', 4, 4)
    }

    /**
     * Evaluated object the iterator points to
     * @desc Object, (readonly)
     */
    public get object(): BlenderObject {
        return PythonInterop.getClass(this.interop, `${this.accessor}.object`, BlenderObject)
    }

    /**
     * Generated coordinates in parent object space
     * @desc float array of 3 items in [-inf, inf], default (0.0, 0.0, 0.0), (readonly)
     */
    public get orco(): [number, number, number] {
        return PythonInterop.getArray(this.interop, `${this.accessor}.orco`, 'number', 3)
    }

    /**
     * If the object is an instance, the parent object that generated it
     * @desc Object, (readonly)
     */
    public get parent(): BlenderObject {
        return PythonInterop.getClass(this.interop, `${this.accessor}.parent`, BlenderObject)
    }

    /**
     * Evaluated particle system that this object was instanced from
     * @desc ParticleSystem, (readonly)
     */
    public get particle_system(): ParticleSystem {
        return PythonInterop.getClass(this.interop, `${this.accessor}.particle_system`, ParticleSystem)
    }

    /**
     * Persistent identifier for inter-frame matching of objects with motion blur
     * @desc int array of 16 items in [-inf, inf], default (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), (readonly)
     */
    public get persistent_id(): [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] {
        return PythonInterop.getArray(this.interop, `${this.accessor}.persistent_id`, 'number', 16)
    }

    /**
     * Random id for this instance, typically for randomized shading
     * @desc int in [0, inf], default 0, (readonly)
     */
    public get random_id(): number {
        return PythonInterop.getInteger(this.interop, `${this.accessor}.random_id`)
    }

    /**
     * Particles part of the object should be visible in the render
     * @desc boolean, default False, (readonly)
     */
    public get show_particles(): boolean {
        return PythonInterop.getBoolean(this.interop, `${this.accessor}.show_particles`)
    }

    /**
     * The object geometry itself should be visible in the render
     * @desc boolean, default False, (readonly)
     */
    public get show_self(): boolean {
        return PythonInterop.getBoolean(this.interop, `${this.accessor}.show_self`)
    }

    /**
     * UV coordinates in parent object space
     * @desc float array of 2 items in [-inf, inf], default (0.0, 0.0), (readonly)
     */
    public get uv(): [number, number] {
        return PythonInterop.getArray(this.interop, `${this.accessor}.uv`, 'number', 2)
    }

    [util.inspect.custom]() {
        return this.accessor
    }
}