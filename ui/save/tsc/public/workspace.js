"use strict";
// Copyright (C) 2024 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = exports.TrackNode = void 0;
const logging_1 = require("../base/logging");
let sessionUniqueIdCounter = 0;
/**
 * Creates a short ID which is unique to this instance of the UI.
 *
 * The advantage of using this over uuidv4() is that the ids produced are
 * significantly shorter, saving memory and making them more human
 * read/write-able which helps when debugging.
 *
 * Note: The ID range will reset every time the UI is restarted, so be careful
 * not rely on these IDs in any medium that can survive between UI instances.
 *
 * TODO(stevegolton): We could possibly move this into its own module and use it
 * everywhere where session-unique ids are required.
 */
function createSessionUniqueId() {
    // Return the counter in base36 (0-z) to keep the string as short as possible
    // but still human readable.
    return (sessionUniqueIdCounter++).toString(36);
}
/**
 * A base class for any node with children (i.e. a group or a workspace).
 */
class TrackNode {
    // Immutable unique (within the workspace) ID of this track node. Used for
    // efficiently retrieving this node object from a workspace. Note: This is
    // different to |uri| which is used to reference a track to render on the
    // track. If this means nothing to you, don't bother using it.
    id;
    // A human readable string for this track - displayed in the track shell.
    // TODO(stevegolton): Make this optional, so that if we implement a string for
    // this track then we can implement it here as well.
    title;
    // The URI of the track content to display here.
    uri;
    // Optional sort order, which workspaces may or may not take advantage of for
    // sorting when displaying the workspace.
    sortOrder;
    // Don't show the header at all for this track, just show its un-nested
    // children. This is helpful to group together tracks that logically belong to
    // the same group (e.g. all ftrace cpu tracks) and ease the job of
    // sorting/grouping plugins.
    headless;
    // If true, this track is to be used as a summary for its children. When the
    // group is expanded the track will become sticky to the top of the viewport
    // to provide context for the tracks within, and the content of this track
    // shall be omitted. It will also be squashed down to a smaller height to save
    // vertical space.
    isSummary;
    // If true, this node will be removable by the user. It will show a little
    // close button in the track shell which the user can press to remove the
    // track from the workspace.
    removable;
    _collapsed = true;
    _children = [];
    tracksById = new Map();
    tracksByUri = new Map();
    _parent;
    _workspace;
    get parent() {
        return this._parent;
    }
    constructor(args) {
        const { title = '', id = createSessionUniqueId(), uri, headless = false, sortOrder, collapsed = true, isSummary = false, removable = false, } = args ?? {};
        this.id = id;
        this.uri = uri;
        this.headless = headless;
        this.title = title;
        this.sortOrder = sortOrder;
        this.isSummary = isSummary;
        this._collapsed = collapsed;
        this.removable = removable;
    }
    /**
     * Remove this track from it's parent & unpin from the workspace if pinned.
     */
    remove() {
        this.workspace?.unpinTrack(this);
        this.parent?.removeChild(this);
    }
    /**
     * Add this track to the list of pinned tracks in its parent workspace.
     *
     * Has no effect if this track is not added to a workspace.
     */
    pin() {
        this.workspace?.pinTrack(this);
    }
    /**
     * Remove this track from the list of pinned tracks in its parent workspace.
     *
     * Has no effect if this track is not added to a workspace.
     */
    unpin() {
        this.workspace?.unpinTrack(this);
    }
    /**
     * Returns true if this node is added to a workspace as is in the pinned track
     * list of that workspace.
     */
    get isPinned() {
        return Boolean(this.workspace?.hasPinnedTrack(this));
    }
    /**
     * Find the closest visible ancestor TrackNode.
     *
     * Given the path from the root workspace to this node, find the fist one,
     * starting from the root, which is collapsed. This will be, from the user's
     * point of view, the closest ancestor of this node.
     *
     * Returns undefined if this node is actually visible.
     *
     * TODO(stevegolton): Should it return itself in this case?
     */
    findClosestVisibleAncestor() {
        // Build a path from the root workspace to this node
        const path = [];
        let node = this.parent;
        while (node) {
            path.unshift(node);
            node = node.parent;
        }
        // Find the first collapsed track in the path starting from the root. This
        // is effectively the closest we can get to this node without expanding any
        // groups.
        return path.find((node) => node.collapsed) ?? this;
    }
    /**
     * Expand all ancestor nodes.
     */
    reveal() {
        let parent = this.parent;
        while (parent) {
            parent.expand();
            parent = parent.parent;
        }
    }
    /**
     * Find this node's root node - this may be a workspace or another node.
     */
    get rootNode() {
        let node = this;
        while (node.parent) {
            node = node.parent;
        }
        return node;
    }
    /**
     * Find this node's workspace if it is attached to one.
     */
    get workspace() {
        return this.rootNode._workspace;
    }
    /**
     * Mark this node as un-collapsed, indicating its children should be rendered.
     */
    expand() {
        this._collapsed = false;
        this.fireOnChangeListener();
    }
    /**
     * Mark this node as collapsed, indicating its children should not be
     * rendered.
     */
    collapse() {
        this._collapsed = true;
        this.fireOnChangeListener();
    }
    /**
     * Toggle the collapsed state.
     */
    toggleCollapsed() {
        this._collapsed = !this._collapsed;
        this.fireOnChangeListener();
    }
    /**
     * Whether this node is collapsed, indicating its children should be rendered.
     */
    get collapsed() {
        return this._collapsed;
    }
    /**
     * Whether this node is expanded - i.e. not collapsed, indicating its children
     * should be rendered.
     */
    get expanded() {
        return !this._collapsed;
    }
    /**
     * Returns the list of titles representing the full path from the root node to
     * the current node. This path consists only of node titles, workspaces are
     * omitted.
     */
    get fullPath() {
        let fullPath = [this.title];
        let parent = this.parent;
        while (parent) {
            // Ignore headless containers as they don't appear in the tree...
            if (!parent.headless && parent.title !== '') {
                fullPath = [parent.title, ...fullPath];
            }
            parent = parent.parent;
        }
        return fullPath;
    }
    fireOnChangeListener() {
        this.workspace?.onchange(this.workspace);
    }
    /**
     * True if this node has children, false otherwise.
     */
    get hasChildren() {
        return this._children.length > 0;
    }
    /**
     * The ordered list of children belonging to this node.
     */
    get children() {
        return this._children;
    }
    /**
     * Inserts a new child node considering it's sortOrder.
     *
     * The child will be added before the first child whose |sortOrder| is greater
     * than the child node's sort order, or at the end if one does not exist. If
     * |sortOrder| is omitted on either node in the comparison it is assumed to be
     * 0.
     *
     * @param child - The child node to add.
     */
    addChildInOrder(child) {
        const insertPoint = this._children.find((n) => (n.sortOrder ?? 0) > (child.sortOrder ?? 0));
        if (insertPoint) {
            this.addChildBefore(child, insertPoint);
        }
        else {
            this.addChildLast(child);
        }
    }
    /**
     * Add a new child node at the start of the list of children.
     *
     * @param child The new child node to add.
     */
    addChildLast(child) {
        this.adopt(child);
        this._children.push(child);
        this.fireOnChangeListener();
    }
    /**
     * Add a new child node at the end of the list of children.
     *
     * @param child The child node to add.
     */
    addChildFirst(child) {
        this.adopt(child);
        this._children.unshift(child);
        this.fireOnChangeListener();
    }
    /**
     * Add a new child node before an existing child node.
     *
     * @param child The child node to add.
     * @param referenceNode An existing child node. The new node will be added
     * before this node.
     */
    addChildBefore(child, referenceNode) {
        if (child === referenceNode)
            return;
        (0, logging_1.assertTrue)(this.children.includes(referenceNode));
        this.adopt(child);
        const indexOfReference = this.children.indexOf(referenceNode);
        this._children.splice(indexOfReference, 0, child);
        this.fireOnChangeListener();
    }
    /**
     * Add a new child node after an existing child node.
     *
     * @param child The child node to add.
     * @param referenceNode An existing child node. The new node will be added
     * after this node.
     */
    addChildAfter(child, referenceNode) {
        if (child === referenceNode)
            return;
        (0, logging_1.assertTrue)(this.children.includes(referenceNode));
        this.adopt(child);
        const indexOfReference = this.children.indexOf(referenceNode);
        this._children.splice(indexOfReference + 1, 0, child);
        this.fireOnChangeListener();
    }
    /**
     * Remove a child node from this node.
     *
     * @param child The child node to remove.
     */
    removeChild(child) {
        this._children = this.children.filter((x) => child !== x);
        child._parent = undefined;
        this.removeFromIndex(child);
        this.propagateRemoval(child);
        this.fireOnChangeListener();
    }
    /**
     * The flattened list of all descendent nodes in depth first order.
     *
     * Use flatTracksUnordered if you don't care about track order, as it's more
     * efficient.
     */
    get flatTracksOrdered() {
        const tracks = [];
        this.collectFlatTracks(tracks);
        return tracks;
    }
    collectFlatTracks(tracks) {
        for (let i = 0; i < this.children.length; ++i) {
            tracks.push(this.children[i]); // Push the current node before its children
            this.children[i].collectFlatTracks(tracks); // Recurse to collect child tracks
        }
    }
    /**
     * The flattened list of all descendent nodes in no particular order.
     */
    get flatTracks() {
        return Array.from(this.tracksById.values());
    }
    /**
     * Remove all children from this node.
     */
    clear() {
        this._children = [];
        this.tracksById.clear();
        this.fireOnChangeListener();
    }
    /**
     * Find a track node by its id.
     *
     * Node: This is an O(1) operation.
     *
     * @param id The id of the node we want to find.
     * @returns The node or undefined if no such node exists.
     */
    getTrackById(id) {
        return this.tracksById.get(id);
    }
    /**
     * Find a track node via its URI.
     *
     * Node: This is an O(1) operation.
     *
     * @param uri The uri of the track to find.
     * @returns The node or undefined if no such node exists with this URI.
     */
    findTrackByUri(uri) {
        return this.tracksByUri.get(uri);
    }
    /**
     * Creates a copy of this node with a new ID.
     *
     * @param deep - If true, children are copied too.
     * @returns - A copy of this node.
     */
    clone(deep = false) {
        const cloned = new TrackNode({ ...this, id: undefined });
        if (deep) {
            this.children.forEach((c) => {
                cloned.addChildLast(c.clone(deep));
            });
        }
        return cloned;
    }
    adopt(child) {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child._parent = this;
        this.addToIndex(child);
        this.propagateAddition(child);
    }
    addToIndex(child) {
        this.tracksById.set(child.id, child);
        for (const [id, node] of child.tracksById) {
            this.tracksById.set(id, node);
        }
        child.uri && this.tracksByUri.set(child.uri, child);
        for (const [uri, node] of child.tracksByUri) {
            this.tracksByUri.set(uri, node);
        }
    }
    removeFromIndex(child) {
        this.tracksById.delete(child.id);
        for (const [id] of child.tracksById) {
            this.tracksById.delete(id);
        }
        child.uri && this.tracksByUri.delete(child.uri);
        for (const [uri] of child.tracksByUri) {
            this.tracksByUri.delete(uri);
        }
    }
    propagateAddition(node) {
        if (this.parent) {
            this.parent.addToIndex(node);
            this.parent.propagateAddition(node);
        }
    }
    propagateRemoval(node) {
        if (this.parent) {
            this.parent.removeFromIndex(node);
            this.parent.propagateRemoval(node);
        }
    }
}
exports.TrackNode = TrackNode;
/**
 * Defines a workspace containing a track tree and a pinned area.
 */
class Workspace {
    title = '<untitled-workspace>';
    id;
    onchange = () => { };
    // Dummy node to contain the pinned tracks
    pinnedTracksNode = new TrackNode();
    tracks = new TrackNode();
    get pinnedTracks() {
        return this.pinnedTracksNode.children;
    }
    constructor() {
        this.id = createSessionUniqueId();
        this.pinnedTracksNode._workspace = this;
        this.tracks._workspace = this;
        // Expanding these nodes makes the logic work
        this.pinnedTracksNode.expand();
        this.tracks.expand();
    }
    /**
     * Reset the entire workspace including the pinned tracks.
     */
    clear() {
        this.pinnedTracksNode.clear();
        this.tracks.clear();
    }
    /**
     * Adds a track node to this workspace's pinned area.
     */
    pinTrack(track) {
        // Make a lightweight clone of this track - just the uri and the title.
        const cloned = new TrackNode({
            uri: track.uri,
            title: track.title,
            removable: track.removable,
        });
        this.pinnedTracksNode.addChildLast(cloned);
    }
    /**
     * Removes a track node from this workspace's pinned area.
     */
    unpinTrack(track) {
        const foundNode = this.pinnedTracksNode.children.find((t) => t.uri === track.uri);
        if (foundNode) {
            this.pinnedTracksNode.removeChild(foundNode);
        }
    }
    /**
     * Check if this workspace has a pinned track with the same URI as |track|.
     */
    hasPinnedTrack(track) {
        return this.pinnedTracksNode.flatTracks.some((p) => p.uri === track.uri);
    }
    /**
     * Find a track node via its URI.
     *
     * Note: This in an O(N) operation where N is the number of nodes in the
     * workspace.
     *
     * @param uri The uri of the track to find.
     * @returns A reference to the track node if it exists in this workspace,
     * otherwise undefined.
     */
    findTrackByUri(uri) {
        return this.tracks.flatTracks.find((t) => t.uri === uri);
    }
    /**
     * Find a track by ID, also searching pinned tracks.
     */
    getTrackById(id) {
        return (this.tracks.getTrackById(id) || this.pinnedTracksNode.getTrackById(id));
    }
    /**
     * The ordered list of children belonging to this node.
     */
    get children() {
        return this.tracks.children;
    }
    /**
     * Inserts a new child node considering it's sortOrder.
     *
     * The child will be added before the first child whose |sortOrder| is greater
     * than the child node's sort order, or at the end if one does not exist. If
     * |sortOrder| is omitted on either node in the comparison it is assumed to be
     * 0.
     *
     * @param child - The child node to add.
     */
    addChildInOrder(child) {
        this.tracks.addChildInOrder(child);
    }
    /**
     * Add a new child node at the start of the list of children.
     *
     * @param child The new child node to add.
     */
    addChildLast(child) {
        this.tracks.addChildLast(child);
    }
    /**
     * Add a new child node at the end of the list of children.
     *
     * @param child The child node to add.
     */
    addChildFirst(child) {
        this.tracks.addChildFirst(child);
    }
    /**
     * Add a new child node before an existing child node.
     *
     * @param child The child node to add.
     * @param referenceNode An existing child node. The new node will be added
     * before this node.
     */
    addChildBefore(child, referenceNode) {
        this.tracks.addChildBefore(child, referenceNode);
    }
    /**
     * Add a new child node after an existing child node.
     *
     * @param child The child node to add.
     * @param referenceNode An existing child node. The new node will be added
     * after this node.
     */
    addChildAfter(child, referenceNode) {
        this.tracks.addChildAfter(child, referenceNode);
    }
    /**
     * Remove a child node from this node.
     *
     * @param child The child node to remove.
     */
    removeChild(child) {
        this.tracks.removeChild(child);
    }
    /**
     * The flattened list of all descendent nodes in depth first order.
     *
     * Use flatTracksUnordered if you don't care about track order, as it's more
     * efficient.
     */
    get flatTracksOrdered() {
        return this.tracks.flatTracksOrdered;
    }
    /**
     * The flattened list of all descendent nodes in no particular order.
     */
    get flatTracks() {
        return this.tracks.flatTracks;
    }
}
exports.Workspace = Workspace;
//# sourceMappingURL=workspace.js.map