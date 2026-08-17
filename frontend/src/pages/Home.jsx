import { Link, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

function Home() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <section className="landing-hero">
        <h1>Birgalikda yozing. Sirni birgalikda quring.</h1>
        <p>
          Writers Hub — detektiv va mystery janridagi asarlarni hamkorlikda yozish uchun platforma.
          Personajlar, dalillar, voqealar tarixi va syujet — barchasi bir joyda, siz va yozuvchi
          sherigingiz uchun.
        </p>
        <div className="landing-cta">
          <Link to="/register" className="cta-btn primary">Ro'yxatdan o'tish</Link>
          <Link to="/login" className="cta-btn secondary">Kirish</Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">📝</span>
          <h3>Boblar va tahrirlash</h3>
          <p>Rich-text muharrir orqali bob yozing, tartibini sudrab o'zgartiring, sherigingiz izoh qoldirsin.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">👤</span>
          <h3>Personajlar</h3>
          <p>Har bir personaj uchun to'liq profil: tashqi ko'rinishi, xarakteri, o'tmishi, motivatsiyasi.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3>Dalillar va Timeline</h3>
          <p>Dalillarni personajlarga bog'lang, voqealar tartibini kuzating, alibilarni tekshiring.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3>AI konsistentlik tekshiruvi</h3>
          <p>Yozgan matningizni AI orqali tekshiring — personaj va timeline bilan zid kelgan joylarni topadi.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">👥</span>
          <h3>Hamkorlik</h3>
          <p>Sherigingizni loyihaga taklif qiling, birga yozing, birga tahrirlang.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📄</span>
          <h3>Export</h3>
          <p>Tayyor asaringizni bitta bosishda DOCX formatida yuklab oling.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;