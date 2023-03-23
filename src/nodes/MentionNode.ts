import type { Spread } from "lexical";

import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode
} from "lexical";

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    type: "mention";
    version: 1;
  },
  SerializedTextNode
>;

function convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createMentionNode(textContent);
    return {
      node
    };
  }

  return null;
}

const mentionStyle = "background-color: rgba(24, 119, 232, 0.2)";
export class MentionNode extends TextNode {
  __mention: string;
  __isLink: boolean;
  __url: string;

  static getType(): string {
    return "mention";
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

  constructor(mentionName: string, text?: string, key?: NodeKey, isLink?: boolean, url?: string ) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__isLink = isLink;
    this.__url = url;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      type: "mention",
      version: 1
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    if (this.__isLink) {
      const linkElement = document.createElement('a');
      linkElement.style.cssText = mentionStyle;
      linkElement.href = this.__url;
      linkElement.text = this.__mention
      return linkElement;
    } else
    {
      const mentionElement = super.createDOM(config);
      mentionElement.style.cssText = mentionStyle;
      mentionElement.className = "mention";
      return mentionElement;
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.textContent = this.__text;
    return { element };
  }

  isSegmented(): false {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1
        };
      }
    };
  }

  isTextEntity(): true {
    return true;
  }

  isToken(): true {
    return true;
  }
}

export function $createMentionNode(mentionName: string, isLink?: boolean, url?: string): MentionNode {
  const mentionNode = new MentionNode(mentionName, undefined, undefined, isLink, url);
  mentionNode.setMode("segmented").toggleDirectionless();
  return mentionNode;
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
