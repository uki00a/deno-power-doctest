import type { SourceFile } from "../../deps.ts";
import { Project } from "../../deps.ts";

export function createProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
  });
}

export function withSourceFile<T>(
  proc: (sourceFile: SourceFile) => T,
  project: Project,
  filename: string,
  code: string,
): T {
  const sourceFile = project.createSourceFile(filename, code);
  try {
    return proc(sourceFile);
  } finally {
    project.removeSourceFile(sourceFile);
  }
}
