// src/components/Loader.tsx
import React, { useEffect } from "react";

// ✅ מגדירים ל-TypeScript שהאלמנט <l-hourglass> חוקי
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "l-hourglass": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string;
        "bg-opacity"?: string;
        speed?: string;
        color?: string;
      };
    }
  }
}

const Loader: React.FC = () => {
  // ✅ טוען את הספרייה של האנימציה מה-CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/ldrs/dist/auto/hourglass.js";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ✅ לוגיקת האנימציה של הטיפות
  useEffect(() => {
    const left1 = document.getElementById("left1");
    const right1 = document.getElementById("right1");
    const left2 = document.getElementById("left2");
    const right2 = document.getElementById("right2");

    function splash() {
      [left1, right1, left2, right2].forEach((el) => {
        if (!el) return;
        el.style.animation = "none";
        void el.offsetWidth;
      });

      if (left1) left1.style.animation = "splashLeft 0.6s ease-out";
      if (right1) right1.style.animation = "splashRight 0.6s ease-out";
      if (left2) left2.style.animation = "splashLeftSmall 0.7s ease-out";
      if (right2) right2.style.animation = "splashRightSmall 0.7s ease-out";
    }

    const timer = setTimeout(() => {
      splash();
      const interval = setInterval(() => splash(), 1750);
      return () => clearInterval(interval);
    }, 875);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.body}>
      <div style={styles.container as React.CSSProperties}>
        <div style={styles.glow}></div>

        <div style={styles.wrapper as React.CSSProperties}>
          {/* @ts-ignore */}
          <l-hourglass size="70" bg-opacity="0.1" speed="1.75" color="#a357ff" />
        </div>

        {/* 4 טיפות */}
        <span className="drop big" id="left1" style={styles.dropBig}></span>
        <span className="drop big" id="right1" style={styles.dropBig}></span>
        <span className="drop small" id="left2" style={styles.dropSmall}></span>
        <span className="drop small" id="right2" style={styles.dropSmall}></span>
      </div>

      <style>{css}</style>
    </div>
  );
};

export default Loader;

// === Inline styles (layout) ===
const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    height: "100vh",
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  container: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "doubleBounce 3.5s cubic-bezier(0.25, 1.25, 0.3, 1) infinite",
    zIndex: 2,
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    background:
      "radial-gradient(circle, rgba(163, 87, 255, 0.15), transparent 70%)",
    borderRadius: "50%",
    filter: "blur(35px)",
    animation: "pulse 4s ease-in-out infinite alternate",
    zIndex: 0,
  },
  dropBig: {
    position: "absolute",
    background: "#a357ff",
    borderRadius: "50%",
    opacity: 0,
    zIndex: 1,
    bottom: "calc(40% - 10px)",
    width: "8px",
    height: "8px",
  },
  dropSmall: {
    position: "absolute",
    background: "#a357ff",
    borderRadius: "50%",
    opacity: 0,
    zIndex: 1,
    bottom: "calc(30% - 10px)",
    width: "5px",
    height: "5px",
  },
};

// === CSS animations ===
const css = `
@keyframes doubleBounce {
  0%, 22%, 50%, 72%, 100% { transform: translateY(0); }
  25% { transform: translateY(-14px); }
  75% { transform: translateY(-14px); }
}

@keyframes pulse {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes splashLeft {
  0% { transform: translate(0, 0); opacity: 1; }
  60% { transform: translate(-55px, -25px); opacity: 1; }
  100% { transform: translate(-70px, -35px); opacity: 0; }
}

@keyframes splashRight {
  0% { transform: translate(0, 0); opacity: 1; }
  60% { transform: translate(55px, -25px); opacity: 1; }
  100% { transform: translate(70px, -35px); opacity: 0; }
}

@keyframes splashLeftSmall {
  0% { transform: translate(0, 0); opacity: 1; }
  60% { transform: translate(-75px, -30px) scale(0.8); opacity: 1; }
  100% { transform: translate(-90px, -40px) scale(0.6); opacity: 0; }
}

@keyframes splashRightSmall {
  0% { transform: translate(0, 0); opacity: 1; }
  60% { transform: translate(75px, -30px) scale(0.8); opacity: 1; }
  100% { transform: translate(90px, -40px) scale(0.6); opacity: 0; }
}
`;
