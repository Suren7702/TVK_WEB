import PARTY_NETWORK from "../data/partyNetwork.js";
import HierarchyNode from "../components/HierarchyNode.jsx";

export default function PartyNetwork() {
  return (
    <section className="page-wrap">
      <header className="page-header">
        <h1 className="section-heading-ta">
          கட்சியின் மாவட்ட அமைப்பு – தொடர்பு வலையமைப்பு
        </h1>
        <p className="section-subheading-ta">
          யூனியன் – கிராமம் – வார்டு – பூத் என்ற அமைப்பில் அனைத்து
          கட்சி பொறுப்பாளர்களின் தொடர்பு விபரங்களையும் மக்கள் எளிதாக
          பார்க்கும் வகையில் இந்த மர அமைப்பில் காட்டப்படுகின்றது.
        </p>
      </header>

      <div className="tree-legend">
        <span className="tree-pill union-pill">யூனியன்</span>
        <span className="tree-pill village-pill">கிராமம்</span>
        <span className="tree-pill ward-pill">வார்டு</span>
        <span className="tree-pill booth-pill">பூத்</span>
      </div>

      <div className="tree-container">
        {PARTY_NETWORK.map((union) => (
          <HierarchyNode key={union.id} node={union} />
        ))}
      </div>

      <p className="tree-note">
        * இந்த விவரங்கள் பொதுமக்கள் பயன்பாட்டிற்காக. எப்போது வேண்டுமானாலும்
        நிர்வாகம் மாற்றம் / புதுப்பிப்பு செய்யப்படலாம்.
      </p>
    </section>
  );
}
