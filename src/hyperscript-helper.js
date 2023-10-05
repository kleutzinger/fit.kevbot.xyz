import h from "hyperscript";
import hh from "hyperscript-helpers";
const d = hh(h);

function isElement(o){
  return o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
}

// export d and isElement
export {d, isElement}

