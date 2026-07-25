import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import SEO from '../components/SEO';

const fadeUp = (delay = 0) => ({
  initial: { y: 20, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay },
});

const zelligeStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23b4a180' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
};

export default function AboutPage() {
  const { setCurrentPage } = useApp();
  const { t } = useTranslation();
  return (
    <div className="bg-[#131313] text-[#e4e2e1] font-serif selection:bg-[#b4a180] selection:text-[#45381e]">
      <SEO title={t('seo.aboutTitle')} description={t('seo.aboutDescription')} />
      {/* 1. Hero Section */}
      <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-[2000ms] hover:scale-105"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDshtdgRImQ_6Ft1-oXKzDqw21Si2XiFl9WDs9hvPzjHqSx-4TDEOTYR8NvSBTrSVVfg_W5FXdoiHE1EX8xmxSqfo0rYartMtrP8_4armV_cOozwj3zKDsKAzBbFi3_WgxakxAz0nYi2QMJqtV2ViKX60-jbuWAc55sUmBH10LzEw2vly9U6HLEsUIEiaD9stQU9BURztYBYzzOTZ9MdLEbhrneDWdlwHjhi0t_V4kFBqg-pPh4_WETHg9CxjK7lgTMCTrBD-6UWEs')" }}
          ></div>
          <div className="absolute inset-0 bg-[#0e0e0e]/60 mix-blend-multiply"></div>
        </div>
        <motion.div {...fadeUp(0)} className="relative z-10 text-center px-5">
          <h1 className="font-serif text-[40px] md:text-[64px] text-[#d8c4a1] mb-2 tracking-[0.3em]" style={{ fontFamily: "'Cinzel', serif" }}>
            MAISON TISLIT
          </h1>
          <p className="font-serif text-[20px] italic text-[#e4e2e1]/90 tracking-widest">
            Woven in Tradition, Worn with Elegance
          </p>
          <div className="mt-16">
            <div className="w-[1px] h-24 bg-[#d8c4a1]/50 mx-auto"></div>
          </div>
        </motion.div>
      </header>

      {/* 2. Heritage Story */}
      <section className="max-w-7xl mx-auto px-5 md:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div {...fadeUp(0)}>
            <div
              className="aspect-[4/5] bg-cover bg-center shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCy5GB1M30gUjSc662Vdkq8F8WeprQLoRnN6tN5UUnge1GUF95ancV_pRDpclYw5ki3TBD6hIpovj_MT6xrR5IDH1nHStoJv60_nZs2q01i1H4_sLh2AJgyA_8s74x05EbHySBD8BrJt9pvUw7LAlJREMTEyirAvlP9KjGFctZFtnEBwytiHo20-Y70YGaY79Nmjd36y_de-H7g-LGwejG984TY-Tp6iIwKkaPq4hwCSGPaUm_WuGBEcYELH1mYAeOVAsQXfLVPSqk')" }}
            ></div>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="md:pl-16">
            <h2 className="font-serif text-[32px] text-[#d8c4a1] mb-8" style={{ fontFamily: "'Cinzel', serif" }}>Our Heritage</h2>
            <p className="font-serif text-[20px] text-[#cfc5b9] mb-4 leading-relaxed">
              Maison Tislit was born from the silent valleys of the Atlas Mountains, where the rhythm of the loom has echoed for generations. Our story is not merely about fashion; it is a sacred preservation of the Berber soul and the Andalusian artistry that has defined Moroccan luxury for centuries.
            </p>
            <p className="font-serif text-[20px] text-[#cfc5b9] leading-relaxed">
              Every thread we pull is a link to an ancestor; every pattern we stitch is a map of our shared history. We work exclusively with master artisans who have inherited their secrets from their mothers and fathers, ensuring that the 'Slow Luxury' of the Maghreb continues to flourish in a modern world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Craftsmanship Process */}
      <section className="bg-[#1b1c1c] py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="text-center mb-16">
            <h3 className="font-serif text-[24px] text-[#d8c4a1] tracking-widest uppercase mb-2" style={{ fontFamily: "'Cinzel', serif" }}>The Art of the Craft</h3>
            <div className="flex justify-center items-center gap-2">
              <div className="h-[1px] w-12 bg-[#4c463c]"></div>
              <span className="material-symbols-outlined text-[#d8c4a1]" style={{ fontVariationSettings: "'opsz' 20" }}>diamond</span>
              <div className="h-[1px] w-12 bg-[#4c463c]"></div>
            </div>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 px-8">
            <div className="hidden md:block absolute top-[85px] left-20 right-20 h-[1px] bg-[#4c463c]/30 z-0"></div>

            {[
              { title: "Hand Embroidery", subtitle: "The soul of the piece.", delay: 0.1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-VIVN5Lz1HiM3A0CFuePgxmRFRUruu3pIuJVTMGGey1C8Ka8nuduZ99DrFxY8ueKAnZUoRxr87V66vsku14BB4zvLef8-PjPqTwtbeXvVh0pJeI78qB9JiUh3VnpMac7c8DI1cpS4TjemrKQ0s-cxCS6uj08F6C5adPrQa5nqrM-gvryEqB8678p2vlgM4BcLpR3oanA8DbW9b40wnJ9z6SICGmzAEpJ_n4EqRCShpfYlsB_12MEXZnanc6ljtxd1vArS4d2FXxk" },
              { title: "Fabric Selection", subtitle: "Ethically sourced excellence.", delay: 0.2, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVMdxTKY5DShmarB0UQpaSxXNAeIqsFjyB8OJliBjTClrC-5dp9gQW4DmjDSdWRCL1rA5GzXZt4K-JzprIdBNX7UcNQ3kQS71pr1P81fkdZRgoy4_h2IqxmhU1GQUcvEo4zVfJNk8sKQH-si0QRuljlMu3QbNAXVZxqzru5ILINMg2MffFmtrt8xCWQxgBz7iegabscGP6JdRjkpll29ge72vTSUIKX-ZX90rf2r_Ef_TfPbNMzVJBens2RCvN_F-yQqkSxcw2FBw" },
              { title: "Master Tailoring", subtitle: "Structural perfection.", delay: 0.3, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyCjkYDw8QRGzEZtsWvdIXowQF7dnnWtaTT7oP6qaZG2lcOg-HBrVLn3XjBrMopLBNsnw0-iFt0xrMHbQb9y9AV8b_oR5uc9g2kEh_ED6zb3-fqBQYKAAkWTURSlRsKEJ2JwWyA66Rw3lhI5TjbG0_YY_0oQy32tsIdzPnlhOFbAj7ZpwVKrx43P3Yy_k-ZXIFMWLHOlabt6qbb6xq-A4LPGeXQJB2Bg9A0aUluOk1_BTNLnbNcD2ar0bVtTleTnYM8KBGC8M4Cqo" },
              { title: "Final Piece", subtitle: "A legacy reborn.", delay: 0.4, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA8UXs9lRebIQu8jDp8Owk8OvHFt6D7bjQZzRw0s8HRcMNKRgxYw1Gfri6V4KxbYgGcD173BVQgm6aTyS0DwjpqAuU4RaOvWeoFqDazyV64LJJBd3OsjyRQyWLm4i93YMQznsdq9_oekazaH-YXxBojMvN1GK_DoAJCfBHyKT06JdtYBeLdIM9IVDqTQ30HgmCsTs1-MD_MI8VkfjHOSbFQcwG2SXQ30lUekoJqafSGu7vcghw_V9uhNfrJCbKJhOL4_YUx9zkCTc" }
            ].map((step, i) => (
              <motion.div key={i} {...fadeUp(step.delay)} className="relative z-10 flex flex-col items-center text-center group">
                <div
                  className="w-40 h-40 bg-cover bg-center border-[6px] border-[#1f2020] mb-4 transition-transform duration-500 group-hover:-translate-y-2"
                  style={{ backgroundImage: `url('${step.img}')` }}
                ></div>
                <h4 className="font-serif text-[20px] text-[#d8c4a1] mb-1">{step.title}</h4>
                <p className="font-serif text-[16px] italic text-[#cfc5b9]">{step.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tradition Reimagined */}
      <section className="w-full flex flex-col md:flex-row min-h-[819px]">
        <div className="flex-1 relative group overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQBK6hTuQk9R018BgtVOkRSIv-h48c60hWzHoK7-0xBEbBM2mgXsI0biTmpLCF7dxcuxuVEZmTiQMaeWLfI_WhvYMg7_Oq_fdNjWs6v64weyT3MtaJdIAn2IzMQgUKYiLIbW-UTJBSp4DpAzu7L3HBouCrRsiAISA3p69Xzq8sHZ4Q1VT9FG-Z_g20EJclIqg_Tg53atUc_0uSa3LZozVTWCo8J9ZXQ4vLR1ivPVSYxrsn6XvIGEdWvgx8hvL5jSfvxHUlkebbqh8')" }}
          ></div>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#e4e2e1]">The Root</span>
          </div>
        </div>

        <div className="w-[1px] bg-[#4c463c]/30 h-auto hidden md:block"></div>

        <div className="flex-1 flex flex-col items-center justify-center bg-[#1b1c1c] px-16 py-16 relative">
          <motion.div {...fadeUp(0)} className="text-center">
            <h2 className="font-serif text-[40px] md:text-[64px] text-[#d8c4a1] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Tradition Reimagined</h2>
            <div className="w-20 h-[1px] bg-[#989084] mx-auto mb-4"></div>
            <p className="font-serif text-[20px] text-[#cfc5b9] max-w-md mx-auto">
              We do not look back to live in the past, but to find the vocabulary for the future. Our designs distill ancestral motifs into contemporary silhouettes for the global woman.
            </p>
          </motion.div>
        </div>

        <div className="w-[1px] bg-[#4c463c]/30 h-auto hidden md:block"></div>

        <div className="flex-1 relative group overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwzkV9iRdhpWqI6bZoIn0XFFYv3fLwmYfsSzEjc3Tjvyvj3wX5H64cGYon2sINEZEnJQ4XS2xmncBa7llw_JYKPIxyVLn8boJHKpWg7HHF-r6smTAPTZ6QeAL3YthisObYok1TepqWdmCf4xK3sl2KcL56atUr83qqsmPGUU-YJFQASJCFmnDz0RpOE3azTk4RG_GPOfnVLjnRxYbC4fXV_ZjwJeL0jOWhqJJrcF89fmTr9fL9_Q_Y2S3CLoD6QDOqWlsSmO8GbkI')" }}
          ></div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div className="absolute bottom-8 right-8 text-white text-right">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#e4e2e1]">The Evolution</span>
          </div>
        </div>
      </section>

      {/* 5. Artisan Spotlight */}
      <section className="bg-[#b4a180] text-[#45381e] py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div {...fadeUp(0)} className="flex-1">
              <span className="material-symbols-outlined text-[#d8c4a1] text-5xl mb-4 opacity-50">format_quote</span>
              <blockquote className="font-serif italic text-3xl md:text-4xl leading-snug text-[#45381e] mb-8">
                The artisan's hand is the ultimate rebel in an age of machines. At Maison Tislit, we protect the poetry of the human touch, ensuring that our heritage doesn't just survive, but speaks to the world.
              </blockquote>
              <cite className="font-serif text-[24px] text-[#45381e] font-bold block not-italic">— Fatema ezzahra El Ghazi, Founder & Creative Director</cite>
            </motion.div>
            <motion.div {...fadeUp(0.2)} className="flex-none">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-[#45381e]/30 p-2">
                <div
                  className="w-full h-full rounded-full bg-cover bg-center grayscale"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbyADXEJAUzETha5j23EwxFzDpt3XJ285YUTJmctIjmZmpGufc69jooZUuXaS75X50d2xPJ4dBxxhGt7rrpXBaYHUVAzPdKDBykeNfbbBRF_2es1sWxwhOqS9Kgu5QQfn9XNblKF199iyq42WZQ4aXslnUu-Vf-1YJfJmO7svy9hYJdWXshLPJVaQZXuK_JpCPL-e4OIrMUQx-LiT6YaWX7bJwMo0Cs7wQq864CgFHPXVLCfC8wv8UdlCr6nDhX3-ZUi2N-tUXQ94')" }}
                ></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Materials & Techniques */}
      <section className="py-16 bg-[#131313] relative" style={zelligeStyle}>
        <div className="max-w-7xl mx-auto px-5 md:px-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <motion.div {...fadeUp(0.1)}>
              <span className="material-symbols-outlined text-[#d8c4a1] text-4xl mb-2">auto_fix_high</span>
              <h3 className="font-serif text-[24px] text-[#e4e2e1] mb-4 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>Hand Embroidery</h3>
              <p className="font-serif text-[16px] text-[#cfc5b9]">Each garment features 'R'anda' or 'Terz' embroidery, meticulously hand-stitched by women's collectives in the Fes region, taking up to 40 hours per piece.</p>
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <span className="material-symbols-outlined text-[#d8c4a1] text-4xl mb-2">palette</span>
              <h3 className="font-serif text-[24px] text-[#e4e2e1] mb-4 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>Natural Dyes</h3>
              <p className="font-serif text-[16px] text-[#cfc5b9]">We utilize botanical pigments derived from pomegranate skins, indigo leaves, and saffron crocus, creating a living palette that ages beautifully with time.</p>
            </motion.div>
            <motion.div {...fadeUp(0.3)}>
              <span className="material-symbols-outlined text-[#d8c4a1] text-4xl mb-2">texture</span>
              <h3 className="font-serif text-[24px] text-[#e4e2e1] mb-4 uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>Handwoven Fabric</h3>
              <p className="font-serif text-[16px] text-[#cfc5b9]">Our silk and cotton blends are woven on traditional pit looms, preserving a texture and drape that industrial machines simply cannot replicate.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Closing CTA */}
      <section className="py-16 bg-[#1b1c1c] text-center">
        <motion.div {...fadeUp(0)} className="max-w-md mx-auto px-5">
          <div className="mb-4 flex justify-center">
            <span className="material-symbols-outlined text-[#d8c4a1] text-3xl">filter_vintage</span>
          </div>
          <h2 className="font-serif text-[32px] text-[#e4e2e1] mb-8" style={{ fontFamily: "'Cinzel', serif" }}>The collection awaits your discovery.</h2>
          <button onClick={() => setCurrentPage('shop')} className="bg-[#b4a180] text-[#45381e] px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] transition-all hover:bg-[#f6e0bb] hover:text-[#251a04] hover:tracking-[0.3em]">
            Discover the Collection
          </button>
        </motion.div>
      </section>
    </div>
  );
}
