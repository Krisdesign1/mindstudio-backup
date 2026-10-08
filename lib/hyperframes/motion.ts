import { findMotionTemplate } from "./templates";
// All selectors and animation expressions are authored here; user text is escaped by the caller.
export function motionDesign(
  id: string,
  accent: string,
  unit: number,
  portrait: boolean,
) {
  const t = findMotionTemplate(id);
  const logo = t.category === "Logo";
  const graphic = id !== "cinematic";
  const textTemplate = t.category === "Texte animé";
  const css = `.motion-artwork{position:absolute;inset:0;pointer-events:none}.motion-ring{position:absolute;width:52%;aspect-ratio:1;border:2px solid ${accent};border-radius:50%;left:24%;top:50%;transform:translateY(-50%);opacity:.35}.motion-ring.second{width:38%;left:31%;border-style:dashed}.logo-symbol{display:none}.motion-${id} .title{font-size:${(portrait ? 76 : 100) * unit}px}.motion-${id} .intro-note{font-size:${22 * unit}px}
 ${graphic ? `.motion-${id} #intro{background:radial-gradient(ellipse at 80% 20%,${accent}28,transparent 60%),#101219}.motion-${id} #intro>.visual,.motion-${id} #intro>.shade{display:none}.motion-${id} .scene .shade{background:linear-gradient(0deg,#080b18ee,transparent 90%)}.motion-${id} .intro-copy{top:30%}` : ""}
 ${logo ? `.motion-${id} .intro-copy{text-align:center;top:22%}.motion-${id} .logo-symbol{display:flex;align-items:center;justify-content:center;margin:0 auto ${25 * unit}px;width:${180 * unit}px;height:${180 * unit}px;color:${accent};font-size:${70 * unit}px;letter-spacing:-3px;font-weight:800;border:2px solid ${accent};border-radius:${id === "logo-stamp" ? "50%" : "24px"};background:#101219}.motion-${id} .title{font-size:${40 * unit}px;letter-spacing:1px}.motion-${id} .eyebrow,.motion-${id} .line{display:none}.motion-${id} .intro-note{margin-top:${18 * unit}px}` : ""}
 ${id === "outline" ? `.motion-outline .title{-webkit-text-stroke:2px ${accent};color:transparent;text-transform:uppercase;letter-spacing:2px}` : ""}
 ${id === "neon" ? `.motion-neon .title{color:${accent};text-shadow:0 0 25px ${accent}88}.motion-neon #intro:after{content:'';position:absolute;inset:10%;border:2px solid ${accent};box-shadow:0 0 35px ${accent}44}` : ""}
 ${id === "lower-third" ? `.motion-lower-third .intro-copy{top:auto;bottom:22%;border-left:${8 * unit}px solid ${accent};padding-left:${35 * unit}px}.motion-lower-third .caption{text-align:left;border-left:5px solid ${accent};padding-left:20px}.motion-lower-third .title{font-size:${65 * unit}px}` : ""}
 ${id === "call-to-action" ? `.motion-call-to-action .title{background:${accent};color:#101219;border-radius:${30 * unit}px;padding:${25 * unit}px;display:inline-block;font-size:${65 * unit}px}.motion-call-to-action .intro-copy{text-align:center}.motion-call-to-action .line{margin-left:auto;margin-right:auto}` : ""}
 ${textTemplate ? `.motion-${id} .scene{background:radial-gradient(ellipse at 20% 80%,${accent}22,transparent 70%),#101219}.motion-${id} .scene>.visual{display:none}.motion-${id} .caption{bottom:auto;top:38%;font-size:${(portrait ? 65 : 78) * unit}px;line-height:1.2;text-shadow:none;font-weight:800}.motion-${id} .caption span{background:transparent;padding:0;color:${accent};overflow-wrap:anywhere}.motion-${id} .caption-word{display:inline-block;margin-right:.2em}` : ""}
 .title-word{display:inline-block;margin-right:.22em}
 `;
  const entrance: Record<string, string> = {
    cinematic:
      "tl.fromTo('.title',{opacity:0,y:55},{opacity:1,y:0,duration:.8,ease:'power3.out'},.25);",
    kinetic:
      "tl.fromTo('.title-word',{y:90,rotation:8,opacity:0},{y:0,rotation:0,opacity:1,duration:.5,stagger:.08,ease:'power3.out'},.2);",
    typewriter:
      "tl.fromTo('.title',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1.7,ease:'steps(24)'},.25);",
    split:
      "tl.fromTo('.title',{clipPath:'inset(50% 0 50% 0)',y:20},{clipPath:'inset(0% 0 0% 0)',y:0,duration:1.1,ease:'power4.inOut'},.2);",
    bounce:
      "tl.fromTo('.title-word',{scale:0,rotation:-15},{scale:1,rotation:0,duration:.8,stagger:.07,ease:'back.out(2.2)'},.3);",
    outline:
      "tl.fromTo('.title',{scale:1.7,opacity:0,letterSpacing:30},{scale:1,opacity:1,letterSpacing:2,duration:1.2,ease:'power3.out'},.2);",
    "logo-orbit":
      "tl.fromTo('.logo-symbol',{scale:.3,rotation:-90,opacity:0},{scale:1,rotation:0,opacity:1,duration:1,ease:'back.out(1.7)'},.2);tl.to('.motion-ring',{rotation:180,duration:3,ease:'none'},0);tl.fromTo('.title',{y:20,opacity:0},{y:0,opacity:1,duration:.6},1);",
    "logo-stamp":
      "tl.fromTo('.logo-symbol',{scale:3,rotation:25,opacity:0},{scale:1,rotation:-5,opacity:1,duration:.6,ease:'power4.in'},.2);tl.to('.logo-symbol',{rotation:0,duration:.4,ease:'elastic.out(1,.3)'},.8);tl.fromTo('.title',{opacity:0},{opacity:1,duration:.5},1);",
    "logo-minimal":
      "tl.fromTo('.logo-symbol',{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:1,ease:'power3.inOut'},.2);tl.fromTo('.title',{y:15,opacity:0},{y:0,opacity:1,duration:.8},.7);",
    neon: "tl.fromTo('.title',{opacity:0,scale:.94},{opacity:1,scale:1,duration:.15,repeat:4,yoyo:true},.25);tl.to('.title',{opacity:1,duration:.4},1);",
    "lower-third":
      "tl.fromTo('.intro-copy',{x:-200,opacity:0},{x:0,opacity:1,duration:.9,ease:'power4.out'},.2);",
    "call-to-action":
      "tl.fromTo('.title',{scale:.4,opacity:0},{scale:1,opacity:1,duration:1,ease:'elastic.out(1,.5)'},.2);tl.to('.title',{scale:1.04,duration:.4,yoyo:true,repeat:1},1.7);",
  };
  return {
    css,
    animation: entrance[t.id],
    logo,
    artwork:
      id === "logo-orbit"
        ? '<div class="motion-artwork"><div class="motion-ring"></div><div class="motion-ring second"></div></div>'
        : "",
    wordTitle: id === "kinetic" || id === "bounce",
  };
}
