import React, { useState, useEffect, useCallback } from "react";

// ── Just drop your images into public/images/ads/ ──
// Name them ad1.jpg, ad2.jpg, ad3.jpg, etc.
const ads = [
  "/images/ads/ad1.jfif",
  "/images/ads/ad2.jfif",
  "/images/ads/ad3.jfif",
  "/images/ads/ad4.jfif",
  "/images/ads/ad5.png",
];

export default function PolicyCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % ads.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + ads.length) % ads.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div
      style={styles.wrapper}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {ads.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Ad ${i + 1}`}
          style={{
            ...styles.img,
            opacity:    i === current ? 1 : 0,
            zIndex:     i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Prev */}
      <button style={{ ...styles.btn, left: 16 }} onClick={prev}>‹</button>

      {/* Next */}
      <button style={{ ...styles.btn, right: 16 }} onClick={next}>›</button>

      {/* Dots */}
      <div style={styles.dots}>
        {ads.map((_, i) => (
          <span
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              ...styles.dot,
              backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.4)",
              transform:        i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position:        "relative",
    width:           "100%",
    height:          "520px",
    overflow:        "hidden",
    backgroundColor: "#111",
  },
  img: {
    position:   "absolute",
    top:        0,
    left:       0,
    width:      "100%",
    height:     "100%",
    objectFit:  "cover",
    transition: "opacity 0.7s ease-in-out",
  },
  btn: {
    position:       "absolute",
    top:            "50%",
    transform:      "translateY(-50%)",
    zIndex:         10,
    background:     "rgba(0,0,0,0.4)",
    color:          "#fff",
    border:         "none",
    borderRadius:   "50%",
    width:          48,
    height:         48,
    fontSize:       34,
    cursor:         "pointer",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    lineHeight:     1,
  },
  dots: {
    position:  "absolute",
    bottom:    14,
    left:      "50%",
    transform: "translateX(-50%)",
    display:   "flex",
    gap:       8,
    zIndex:    10,
  },
  dot: {
    width:        11,
    height:       11,
    borderRadius: "50%",
    cursor:       "pointer",
    transition:   "all 0.3s",
    display:      "inline-block",
  },
};