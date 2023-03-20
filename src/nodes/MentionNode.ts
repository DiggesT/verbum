/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorConfig, LexicalNode, NodeKey } from 'lexical';

import SerializedTextNode from 'lexical';

import { Spread } from 'globals';
import { TextNode } from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    type: 'mention';
    version: 1;
  },
  typeof SerializedTextNode
>;

const mentionStyle = 'background-color: rgba(24, 119, 232, 0.2)';
export class MentionNode extends TextNode {
  __mention: string;
  __url:string;
  __isLink: boolean;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mentionName);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(mentionName: string, text?: string, key?: NodeKey, isLink?: boolean, url?: string) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__url = url;
    this.__isLink = isLink;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    if (this.__isLink) {
      const linkElement = document.createElement('a');
      linkElement.style.cssText = mentionStyle;
      linkElement.href = this.__url;
      linkElement.text = `@${this.__mention}`
      return linkElement;
    } else
    {
      const mentionElement = super.createDOM(config);
      mentionElement.style.cssText = mentionStyle;
      mentionElement.className = 'mention';
      return mentionElement;
    }
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createMentionNode(mentionName: string, isLink?: boolean, url?: string): MentionNode {
  const mentionNode = new MentionNode(mentionName, undefined, undefined, isLink, url);
  mentionNode.setMode('segmented').toggleDirectionless();
  return mentionNode;
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
