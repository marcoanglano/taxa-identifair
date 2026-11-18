// ##### IMPORTS #####
// ASSETS
import Home_1 from "../assets/Home_1.png";
import Home_2 from "../assets/Home_2.png";
import Home_3 from "../assets/Home_3.png";
// LIB
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
// VERSION
import { version } from "/package.json";

export default function Home() {


  // ##### CONTENT #####
  const content = [
    { title: "What's Taxa IdentiFAIR?", credits: "", image: Home_1,
      text: "<b>Taxa IdentiFAIR</b> is an interactive tool for identifying adult <b>Calanoida (Copepoda)</b>, a key component of the zooplankton, at the species level. It's real-time connection with the traits dataset hosted on <i>Supabase</i> allows an identification by exclusion, with the support of drawings and contextual filters. <b><i>The website and the Calanoida dataset are still a work in progress, please contact us to report errors or to provide suggestions! (Email in the footer)</i></b>"
    },
    { title: "What's the Roadmap?", credits: "© Dr. D. P. Wilson/Science", image: Home_2,
      text: "The main goal of <b>Taxa IdentiFAIR</b> is to assist in the identification of any planktonic organism (and maybe far beyond in the future!). The website <b>dinamically adapts</b> to the chosen dataset, updating details of the species and criteria to identify them. Calanoida Copepoda is just a starting taxon; if you are an expert of any other group of organisms in the planktonic environment, please, contact us! (Email in the footer)"
    },
    { title: `What's new? (v${version})`, credits: "", image: Home_3,
      text: "The v1.0.2 patch is characterized by minor style changes both in the website and in the Calanoida dataset (v1.0.2, as well). The visualization of <b>species occurrences</b> was improved, and <b>drawings</b> are now displayed with a lighter background to support the new style (arrows and lines added by us are now thicker and red). Additionally, the <b>Prosome front shape</b> trait now supports a new state ('Subtriangular'). <i>More details in the full Changelog</i>."
    },
  ]

  
  // ##### RENDERING #####
  return (
    <section>
      {/* WELCOME */}
      <h3>Welcome to Taxa IdentiFAIR!</h3>

      <div className="block-container">
        {content.map((c, i) => (
          <article className="block" key={i}>

            {/* Text + Footer */}
            <div className="block-content">
              <div className="block-main">
                <h4>{c.title}</h4>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{c.text}</ReactMarkdown>
              </div>
              {c.credits && <div className="block-footer">{c.credits}</div>}
            </div>

            {/* Image */}
            {c.image && (
              <div className="block-image-wrapper">
                <img src={c.image} alt={c.title} className="block-image" />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
