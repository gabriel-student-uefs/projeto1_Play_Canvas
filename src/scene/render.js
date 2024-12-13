import { EventHandler } from '../core/event-handler.js';

/**
 * A render contains an array of meshes that are referenced by a single hierarchy node in a GLB
 * model, and are accessible using {@link ContainerResource#renders} property. The render is the
 * resource of a Render Asset.
 *
 * @ignore
 */
class Render extends EventHandler {
    /**
     * Fired when the meshes are set on the render. The handler is passed the an array of
     * {@link Mesh} objects.
     *
     * @event
     * @example
     * render.on('set:meshes', (meshes) => {
     *     console.log(`Render has ${meshes.length} meshes`);
     * });
     * @ignore
     */
    static EVENT_SETMESHES = 'set:meshes';

    /**
     * Create a new Render instance. These are usually created by the GLB loader and not created
     * by hand.
     */
    constructor() {
        super();

        /**
         * Meshes are reference counted, and this class owns the references and is responsible for
         * releasing the meshes when they are no longer referenced.
         *
         * @type {import('./mesh.js').Mesh[]}
         * @private
         */
        this._meshes = null;
    }

    /**
     * The meshes that the render contains.
     *
     * @type {import('./mesh.js').Mesh[]}
     */
    set meshes(value) {
        // decrement references on the existing meshes
        this.decRefMeshes();

        // assign new meshes
        this._meshes = value;
        this.incRefMeshes();

        this.fire('set:meshes', value);
    }

    get meshes() {
        return this._meshes;
    }

    destroy() {
        this.meshes = null;
    }

    // decrement references to meshes, destroy the ones with zero references
    decRefMeshes() {
        if (this._meshes) {
            const count = this._meshes.length;
            for (let i = 0; i < count; i++) {
                const mesh = this._meshes[i];
                if (mesh) {
                    mesh.decRefCount();
                    if (mesh.refCount < 1) {
                        mesh.destroy();
                        this._meshes[i] = null;
                    }
                }
            }
        }
    }

    // increments ref count on all meshes
    incRefMeshes() {
        if (this._meshes) {
            const count = this._meshes.length;
            for (let i = 0; i < count; i++) {
                if (this._meshes[i]) {
                    this._meshes[i].incRefCount();
                }
            }
        }
    }
}

export { Render };
