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
      text: "The v1.0.0 was published a few days ago (2026-11-09). In v1.0.1 the basic <b>homepage</b> was replaced by the one you see now, hosting a website description, the roadmap and the latest update (with images). <b>Short descriptions</b> were added to 'Species' and 'Identify' pages, to help new users. The <b>footer</b> was expanded to give several new details about licences, versioning and contacts. Frontend/Backend were revised to improve <b>readability</b> and <b>efficiency</b>."
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
