"use strict";
// Copyright (C) 2018 The Android Open Source Project
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
exports.TrackPanel = exports.DEFAULT_TRACK_HEIGHT_PX = void 0;
const tslib_1 = require("tslib");
const mithril_1 = tslib_1.__importDefault(require("mithril"));
const canvas_utils_1 = require("../../base/canvas_utils");
const classnames_1 = require("../../base/classnames");
const semantic_icons_1 = require("../../base/semantic_icons");
const time_scale_1 = require("../../base/time_scale");
const feature_flags_1 = require("../../core/feature_flags");
const raf_scheduler_1 = require("../../core/raf_scheduler");
const workspace_1 = require("../../public/workspace");
const button_1 = require("../../widgets/button");
const common_1 = require("../../widgets/common");
const popup_1 = require("../../widgets/popup");
const track_widget_1 = require("../../widgets/track_widget");
const tree_1 = require("../../widgets/tree");
const css_constants_1 = require("../css_constants");
const resolution_1 = require("./resolution");
const SHOW_TRACK_DETAILS_BUTTON = feature_flags_1.featureFlags.register({
    id: 'showTrackDetailsButton',
    name: 'Show track details button',
    description: 'Show track details button in track shells.',
    defaultValue: false,
});
// Default height of a track element that has no track, or is collapsed.
// Note: This is designed to roughly match the height of a cpu slice track.
exports.DEFAULT_TRACK_HEIGHT_PX = 30;
class TrackPanel {
    kind = 'panel';
    selectable = true;
    trackNode;
    attrs;
    constructor(attrs) {
        this.attrs = attrs;
        this.trackNode = attrs.node;
    }
    get heightPx() {
        const { trackRenderer, node } = this.attrs;
        // If the node is a summary track and is expanded, shrink it to save
        // vertical real estate).
        if (node.isSummary && node.expanded)
            return exports.DEFAULT_TRACK_HEIGHT_PX;
        // Otherwise return the height of the track, if we have one.
        return trackRenderer?.track.getHeight() ?? exports.DEFAULT_TRACK_HEIGHT_PX;
    }
    render() {
        const { node, indentationLevel, trackRenderer, revealOnCreate, topOffsetPx, reorderable = false, } = this.attrs;
        const error = trackRenderer?.getError();
        const buttons = [
            SHOW_TRACK_DETAILS_BUTTON.get() &&
                renderTrackDetailsButton(node, trackRenderer?.desc),
            trackRenderer?.track.getTrackShellButtons?.(),
            node.removable && renderCloseButton(node),
            // We don't want summary tracks to be pinned as they rarely have
            // useful information.
            !node.isSummary && renderPinButton(node),
            this.renderAreaSelectionCheckbox(node),
            error && renderCrashButton(error, trackRenderer?.desc.pluginId),
        ];
        let scrollIntoView = false;
        const tracks = this.attrs.trace.tracks;
        if (tracks.scrollToTrackNodeId === node.id) {
            tracks.scrollToTrackNodeId = undefined;
            scrollIntoView = true;
        }
        return (0, mithril_1.default)(track_widget_1.TrackWidget, {
            id: node.id,
            title: node.title,
            path: node.fullPath.join('/'),
            heightPx: this.heightPx,
            error: Boolean(trackRenderer?.getError()),
            chips: trackRenderer?.desc.chips,
            indentationLevel,
            topOffsetPx,
            buttons,
            revealOnCreate: revealOnCreate || scrollIntoView,
            collapsible: node.hasChildren,
            collapsed: node.collapsed,
            highlight: this.isHighlighted(node),
            isSummary: node.isSummary,
            reorderable,
            onToggleCollapsed: () => {
                node.hasChildren && node.toggleCollapsed();
            },
            onTrackContentMouseMove: (pos, bounds) => {
                const timescale = this.getTimescaleForBounds(bounds);
                trackRenderer?.track.onMouseMove?.({
                    ...pos,
                    timescale,
                });
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            onTrackContentMouseOut: () => {
                trackRenderer?.track.onMouseOut?.();
                raf_scheduler_1.raf.scheduleCanvasRedraw();
            },
            onTrackContentClick: (pos, bounds) => {
                const timescale = this.getTimescaleForBounds(bounds);
                raf_scheduler_1.raf.scheduleCanvasRedraw();
                return (trackRenderer?.track.onMouseClick?.({
                    ...pos,
                    timescale,
                }) ?? false);
            },
            onupdate: () => {
                trackRenderer?.track.onFullRedraw?.();
            },
            onMoveBefore: (nodeId) => {
                const targetNode = node.workspace?.getTrackById(nodeId);
                if (targetNode !== undefined) {
                    // Insert the target node before this one
                    targetNode.parent?.addChildBefore(targetNode, node);
                }
            },
            onMoveAfter: (nodeId) => {
                const targetNode = node.workspace?.getTrackById(nodeId);
                if (targetNode !== undefined) {
                    // Insert the target node after this one
                    targetNode.parent?.addChildAfter(targetNode, node);
                }
            },
        });
    }
    renderCanvas(ctx, size) {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const { trackRenderer: tr, node } = this.attrs;
            // Don't render if expanded and isSummary
            if (node.isSummary && node.expanded) {
                return;
            }
            const trackSize = {
                width: size.width - css_constants_1.TRACK_SHELL_WIDTH,
                height: size.height,
            };
            const _ = tslib_1.__addDisposableResource(env_1, (0, canvas_utils_1.canvasSave)(ctx), false);
            ctx.translate(css_constants_1.TRACK_SHELL_WIDTH, 0);
            (0, canvas_utils_1.canvasClip)(ctx, 0, 0, trackSize.width, trackSize.height);
            const visibleWindow = this.attrs.trace.timeline.visibleWindow;
            const timescale = new time_scale_1.TimeScale(visibleWindow, {
                left: 0,
                right: trackSize.width,
            });
            if (tr) {
                if (!tr.getError()) {
                    const trackRenderCtx = {
                        trackUri: tr.desc.uri,
                        visibleWindow,
                        size: trackSize,
                        resolution: (0, resolution_1.calculateResolution)(visibleWindow, trackSize.width),
                        ctx,
                        timescale,
                    };
                    tr.render(trackRenderCtx);
                }
            }
            this.highlightIfTrackInAreaSelection(ctx, timescale, node, trackSize);
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            tslib_1.__disposeResources(env_1);
        }
    }
    getSliceVerticalBounds(depth) {
        if (this.attrs.trackRenderer === undefined) {
            return undefined;
        }
        return this.attrs.trackRenderer.track.getSliceVerticalBounds?.(depth);
    }
    getTimescaleForBounds(bounds) {
        const timeWindow = this.attrs.trace.timeline.visibleWindow;
        return new time_scale_1.TimeScale(timeWindow, {
            left: 0,
            right: bounds.right - bounds.left,
        });
    }
    isHighlighted(node) {
        // The track should be highlighted if the current search result matches this
        // track or one of its children.
        const searchIndex = this.attrs.trace.search.resultIndex;
        const searchResults = this.attrs.trace.search.searchResults;
        if (searchIndex !== -1 && searchResults !== undefined) {
            const uri = searchResults.trackUris[searchIndex];
            // Highlight if this or any children match the search results
            if (uri === node.uri ||
                node.flatTracksOrdered.find((t) => t.uri === uri)) {
                return true;
            }
        }
        const curSelection = this.attrs.trace.selection;
        if (curSelection.selection.kind === 'track' &&
            curSelection.selection.trackUri === node.uri) {
            return true;
        }
        return false;
    }
    highlightIfTrackInAreaSelection(ctx, timescale, node, size) {
        const selection = this.attrs.trace.selection.selection;
        if (selection.kind !== 'area') {
            return;
        }
        const tracksWithUris = node.flatTracks.filter((t) => t.uri !== undefined);
        let selected = false;
        if (node.isSummary) {
            selected = tracksWithUris.some((track) => selection.trackUris.includes(track.uri));
        }
        else {
            if (node.uri) {
                selected = selection.trackUris.includes(node.uri);
            }
        }
        if (selected) {
            const selectedAreaDuration = selection.end - selection.start;
            ctx.fillStyle = css_constants_1.SELECTION_FILL_COLOR;
            ctx.fillRect(timescale.timeToPx(selection.start), 0, timescale.durationToPx(selectedAreaDuration), size.height);
        }
    }
    renderAreaSelectionCheckbox(node) {
        const selectionManager = this.attrs.trace.selection;
        const selection = selectionManager.selection;
        if (selection.kind === 'area') {
            if (node.isSummary) {
                const tracksWithUris = node.flatTracks.filter((t) => t.uri !== undefined);
                // Check if any nodes within are selected
                const childTracksInSelection = tracksWithUris.map((t) => selection.trackUris.includes(t.uri));
                if (childTracksInSelection.every((b) => b)) {
                    return (0, mithril_1.default)(button_1.Button, {
                        onclick: (e) => {
                            const uris = tracksWithUris.map((t) => t.uri);
                            selectionManager.toggleGroupAreaSelection(uris);
                            e.stopPropagation();
                        },
                        compact: true,
                        icon: semantic_icons_1.Icons.Checkbox,
                        title: 'Remove child tracks from selection',
                    });
                }
                else if (childTracksInSelection.some((b) => b)) {
                    return (0, mithril_1.default)(button_1.Button, {
                        onclick: (e) => {
                            const uris = tracksWithUris.map((t) => t.uri);
                            selectionManager.toggleGroupAreaSelection(uris);
                            e.stopPropagation();
                        },
                        compact: true,
                        icon: semantic_icons_1.Icons.IndeterminateCheckbox,
                        title: 'Add remaining child tracks to selection',
                    });
                }
                else {
                    return (0, mithril_1.default)(button_1.Button, {
                        onclick: (e) => {
                            const uris = tracksWithUris.map((t) => t.uri);
                            selectionManager.toggleGroupAreaSelection(uris);
                            e.stopPropagation();
                        },
                        compact: true,
                        icon: semantic_icons_1.Icons.BlankCheckbox,
                        title: 'Add child tracks to selection',
                    });
                }
            }
            else {
                const nodeUri = node.uri;
                if (nodeUri) {
                    return (selection.kind === 'area' &&
                        (0, mithril_1.default)(button_1.Button, {
                            onclick: (e) => {
                                selectionManager.toggleTrackAreaSelection(nodeUri);
                                e.stopPropagation();
                            },
                            compact: true,
                            ...(selection.trackUris.includes(nodeUri)
                                ? { icon: semantic_icons_1.Icons.Checkbox, title: 'Remove track' }
                                : { icon: semantic_icons_1.Icons.BlankCheckbox, title: 'Add track to selection' }),
                        }));
                }
            }
        }
        return undefined;
    }
}
exports.TrackPanel = TrackPanel;
function renderCrashButton(error, pluginId) {
    return (0, mithril_1.default)(popup_1.Popup, {
        trigger: (0, mithril_1.default)(button_1.Button, {
            icon: semantic_icons_1.Icons.Crashed,
            compact: true,
        }),
    }, (0, mithril_1.default)('.pf-track-crash-popup', (0, mithril_1.default)('span', 'This track has crashed.'), pluginId && (0, mithril_1.default)('span', `Owning plugin: ${pluginId}`), (0, mithril_1.default)(button_1.Button, {
        label: 'View & Report Crash',
        intent: common_1.Intent.Primary,
        className: popup_1.Popup.DISMISS_POPUP_GROUP_CLASS,
        onclick: () => {
            throw error;
        },
    })));
}
function renderCloseButton(node) {
    return (0, mithril_1.default)(button_1.Button, {
        onclick: (e) => {
            node.remove();
            e.stopPropagation();
        },
        icon: semantic_icons_1.Icons.Close,
        title: 'Close track',
        compact: true,
    });
}
function renderPinButton(node) {
    const isPinned = node.isPinned;
    return (0, mithril_1.default)(button_1.Button, {
        className: (0, classnames_1.classNames)(!isPinned && 'pf-visible-on-hover'),
        onclick: (e) => {
            isPinned ? node.unpin() : node.pin();
            e.stopPropagation();
        },
        icon: semantic_icons_1.Icons.Pin,
        iconFilled: isPinned,
        title: isPinned ? 'Unpin' : 'Pin to top',
        compact: true,
    });
}
function renderTrackDetailsButton(node, td) {
    let parent = node.parent;
    let fullPath = [node.title];
    while (parent && parent instanceof workspace_1.TrackNode) {
        fullPath = [parent.title, ' \u2023 ', ...fullPath];
        parent = parent.parent;
    }
    return (0, mithril_1.default)(popup_1.Popup, {
        trigger: (0, mithril_1.default)(button_1.Button, {
            className: 'pf-visible-on-hover',
            icon: 'info',
            title: 'Show track details',
            compact: true,
        }),
        position: popup_1.PopupPosition.Bottom,
    }, (0, mithril_1.default)('.pf-track-details-dropdown', (0, mithril_1.default)(tree_1.Tree, (0, mithril_1.default)(tree_1.TreeNode, { left: 'Track Node ID', right: node.id }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'Collapsed', right: `${node.collapsed}` }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'URI', right: node.uri }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'Is Summary Track', right: `${node.isSummary}` }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'SortOrder',
        right: node.sortOrder ?? '0 (undefined)',
    }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'Path', right: fullPath }), (0, mithril_1.default)(tree_1.TreeNode, { left: 'Title', right: node.title }), (0, mithril_1.default)(tree_1.TreeNode, {
        left: 'Workspace',
        right: node.workspace?.title ?? '[no workspace]',
    }), td && (0, mithril_1.default)(tree_1.TreeNode, { left: 'Plugin ID', right: td.pluginId }), td &&
        (0, mithril_1.default)(tree_1.TreeNode, { left: 'Tags' }, td.tags &&
            Object.entries(td.tags).map(([key, value]) => {
                return (0, mithril_1.default)(tree_1.TreeNode, { left: key, right: value?.toString() });
            })))));
}
//# sourceMappingURL=track_panel.js.map