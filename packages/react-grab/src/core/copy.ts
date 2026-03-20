import { copyContent, type ReactGrabEntry } from "../utils/copy-content.js";
import { generateSnippet } from "../utils/generate-snippet.js";
import { joinSnippets } from "../utils/join-snippets.js";

interface CopyOptions {
  maxContextLines?: number;
  getContent?: (elements: Element[]) => Promise<string> | string;
  componentName?: string;
}

interface CopyHooks {
  onBeforeCopy: (elements: Element[]) => Promise<void>;
  transformSnippet: (
    snippet: [string, string[]],
    element: Element,
  ) => Promise<[string, string[]]>;
  transformCopyContent: (
    content: string | [string, string[]][],
    elements: Element[],
  ) => Promise<string | [string, string[]][]>;
  onAfterCopy: (elements: Element[], success: boolean) => void;
  onCopySuccess: (elements: Element[], content: string) => void;
  onCopyError: (error: Error) => void;
}

export const tryCopyWithFallback = async (
  options: CopyOptions,
  hooks: CopyHooks,
  elements: Element[],
  extraPrompt?: string,
): Promise<boolean> => {
  let didCopy = false;
  let copiedContent = "";

  await hooks.onBeforeCopy(elements);

  try {
    let generatedContent: string | [string, string[]][];
    let entries: ReactGrabEntry[] | undefined;

    if (options.getContent) {
      generatedContent = await options.getContent(elements);
    } else {
      const rawSnippets = await generateSnippet(elements, {
        maxLines: 100, //options.maxContextLines,
      });
      const transformedSnippets = await Promise.all(
        rawSnippets.map((snippet, index) =>
          snippet[0].trim() || snippet[1].length > 0
            ? hooks.transformSnippet(snippet, elements[index])
            : Promise.resolve(["", []] as [string, string[]]),
        ),
      );
      const snippetElementPairs = transformedSnippets
        .map((snippet, index) => ({ snippet, element: elements[index] }))
        .filter(({ snippet }) => snippet[0].trim() || snippet[1].length > 0);

      generatedContent = snippetElementPairs.map(({ snippet }) => snippet);
      entries = snippetElementPairs.map(({ snippet, element }) => ({
        tagName: element.localName,
        content: snippet[0] + "\n  in " + snippet[1].join("\n  in "),
        commentText: extraPrompt,
      }));
    }

    if (
      (Array.isArray(generatedContent) && generatedContent.length > 0) ||
      (typeof generatedContent === "string" && generatedContent.trim())
    ) {
      const transformedContent = await hooks.transformCopyContent(
        generatedContent,
        elements,
      );

      didCopy = copyContent(transformedContent, {
        componentName: options.componentName,
        entries,
        extraPrompt,
      });

      copiedContent = Array.isArray(transformedContent)
        ? joinSnippets(transformedContent)
        : transformedContent;
    }
  } catch (error) {
    const resolvedError =
      error instanceof Error ? error : new Error(String(error));
    hooks.onCopyError(resolvedError);
  }

  if (didCopy) {
    hooks.onCopySuccess(elements, copiedContent);
  }
  hooks.onAfterCopy(elements, didCopy);

  return didCopy;
};
