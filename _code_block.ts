export interface CodeBlock {
  code: string;
  mediaType: "typescript" | "javascript" | "tsx" | "jsx";
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

export function toExtname(
  language: CodeBlock["mediaType"],
): `.${"ts" | "js" | "tsx" | "jsx"}` {
  switch (language) {
    case "typescript":
      return ".ts";
    case "javascript":
      return ".js";
    case "tsx":
      return ".tsx";
    case "jsx":
      return ".jsx";
  }
}
