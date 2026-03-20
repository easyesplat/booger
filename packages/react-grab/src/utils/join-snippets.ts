export const joinSnippets = (
  snippets: (string | [string, string[]])[],
): string => {
  if (snippets.length === 0) return "";

  const formattedSnippets = snippets.map((snippet) => {
    if (Array.isArray(snippet)) {
      const [html, stack] = snippet;
      if (stack.length === 0) return html;
      return `${html}\n  in ${stack.join("\n  in ")}`;
    }
    return snippet;
  });

  if (formattedSnippets.length === 1) return formattedSnippets[0];

  return formattedSnippets
    .map((snippet, index) => `[${index + 1}]\n${snippet}`)
    .join("\n\n");
};
