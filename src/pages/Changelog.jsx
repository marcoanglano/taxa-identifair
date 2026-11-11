// ##### IMPORTS #####
// COMPONENTS
import Accordion from "../components/Accordion";
// LIB
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
// CHANGELOG
import changelogText from "/CHANGELOG.md?raw";


// ##### CREATING ACCORDIONS #####
function parseChangelogToAccordionItems(rawText) {
    const sections = rawText.split(/(?=\n## )/g);
    const items = [];
    let headerContent = "";

    sections.forEach((sectionText, index) => {
        const lines = sectionText.trim().split("\n");
        const firstLine = lines[0] || "";

        if (firstLine.startsWith("## ")) {
            const title = firstLine.replace("## ", "").trim();
            const markdownBody = lines.slice(1).join("\n");
            items.push({
                id: `v-${index}`,
                title: title,
                content: <ReactMarkdown>{markdownBody}</ReactMarkdown>,
            });
        } else { headerContent = sectionText; }
  });

  return { headerContent, items };
}

export default function Changelog() {
    // Parsing & isolating latest version
    const { headerContent, items } = useMemo( () => parseChangelogToAccordionItems(changelogText), [] );
    const latestItem = useMemo(() => items.slice(0, 1), [items]);
    const olderItems = useMemo(() => items.slice(1), [items]);


    // ##### RENDERING #####
    return (
        <section id="changelog-page">
                {/* Title */}
                {headerContent && <ReactMarkdown>{headerContent}</ReactMarkdown>}

                {/* 1. LATEST VERSION */}
                {latestItem.length > 0 && (
                <div className="changelog-latest-group">
                    <Accordion items={latestItem} defaultAllOpen={true} />
                </div>
                )}

                {/* 2. PREVIOUS VERSIONS */}
                {olderItems.length > 0 && (
                <div className="changelog-history-group">
                    <Accordion items={olderItems} singleOpen={true} />
                </div>
                )}
        </section>
    );
}
