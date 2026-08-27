import { View } from '../App';
import { BASE_FEE, PER_STAND_FEE } from '../data';

export function Landing({ go }: { go: (v: View) => void }) {
  return (
    <>
      <header className="hero">
        <div className="hero__inner">
          <div className="hero__eyebrow">City of Null Island · Curb Management</div>
          <h1>
            Valet parking, <span className="hero__hl">made simple.</span>
          </h1>
          <p className="hero__lede">
            Apply online for a valet parking zone permit for your restaurant, hotel, or venue.
            Most applications are reviewed within 5 business days.
          </p>
          <div className="hero__actions">
            <button className="btn btn--primary btn--lg" onClick={() => go({ name: 'apply' })}>
              Start an application
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => go({ name: 'permits' })}>
              Track my permits
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="cardgrid">
          <div className="infocard">
            <div className="infocard__icon" aria-hidden>🚗</div>
            <h3>Who needs a permit?</h3>
            <p>
              Any business operating attended valet service on a public street or curb lane —
              restaurants, hotels, event venues, and theaters.
            </p>
          </div>
          <div className="infocard">
            <div className="infocard__icon" aria-hidden>📋</div>
            <h3>What you'll need</h3>
            <p>
              Your business details, the curb location and length you're requesting, an operating
              schedule, and your valet operator's company name.
            </p>
          </div>
          <div className="infocard">
            <div className="infocard__icon" aria-hidden>💳</div>
            <h3>Fees & timeline</h3>
            <p>
              ${BASE_FEE} base fee plus ${PER_STAND_FEE} per valet stand, adjusted by zone. Pay
              only after approval. Typical review: 3–5 business days.
            </p>
          </div>
        </section>

        <section className="steps">
          <h2>How it works</h2>
          <ol className="steps__list">
            <li>
              <span className="steps__num">1</span>
              <div>
                <strong>Tell us about your business</strong>
                <p>Contact details and business type — about two minutes.</p>
              </div>
            </li>
            <li>
              <span className="steps__num">2</span>
              <div>
                <strong>Pick your curb zone</strong>
                <p>Choose the street zone and the curb length you need.</p>
              </div>
            </li>
            <li>
              <span className="steps__num">3</span>
              <div>
                <strong>Set your schedule</strong>
                <p>Days and hours your valet stand will operate.</p>
              </div>
            </li>
            <li>
              <span className="steps__num">4</span>
              <div>
                <strong>Review & submit</strong>
                <p>Get a permit number instantly and track review status online.</p>
              </div>
            </li>
          </ol>
          <div className="steps__cta">
            <button className="btn btn--primary" onClick={() => go({ name: 'apply' })}>
              Begin — it takes about 5 minutes
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
