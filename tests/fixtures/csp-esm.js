/* csp-esm.html: the same fixture driven by the ES module build. Nothing from patchbay is global here. */
import pbInit, * as pb from '../../patchbay.mjs';
window.pb = pb;
pbFixtureSetup(pb);
pbInit();
window.pbReady = true;
