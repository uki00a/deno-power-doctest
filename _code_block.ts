export interface CodeBlock {
  code: string;
  // TODO: Support `jsx` & `tsx`
  mediaType: "typescript" | "javascript";
  range: CodeBlockRange;
}

interface CodeBlockRange {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  column: number;
}

export type MimeType =
  | "application/typescript"
  | "application/javascript";

export function toMimeType(type: CodeBlock["mediaType"]): MimeType {
  switch (type) {
    case "typescript":
      return "application/typescript";
    case "javascript":
      return "application/javascript";
  }
}

export function toExtname(language: CodeBlock["mediaType"]): `.${"ts" | "js"}` {
  switch (language) {
    case "typescript":
      return ".ts";
    case "javascript":
      return ".js";
  }
}
