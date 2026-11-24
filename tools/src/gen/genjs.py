from pbroot import ROOT
# Writes patchbay.js (classic script) and patchbay.mjs (ES module): pv/_core.js, the shared behaviors and the pbHook list
# from pv/_hooks.js, in scripts.json order. Same body; the classic file adds the data-pb-auto runner, the module adds exports.
import sys; sys.path.insert(0,ROOT+'/gen')
import pbscripts as S
HEAD='''/* Patchbay behaviors. Load after the markup and call pbInit() (or pbInit(el) for markup added later; it binds each element once),
   or add data-pb-auto to this script tag to run pbInit() on DOMContentLoaded. pbInit(root, {only, skip}) limits it by hook name (pbInit.hooks).
   Also exposes pbConfirm(), pbToast(), pbInbox(), pbCalendar(), pbClock(), pbTheme(), pbQRSvg(), pbQRCode(), pbPlace(), pbVirtual(), pbAnsi(),
   pbCronParse(), pbSection(), pbHook(), pbEsc() and pbStyled() for app code. Needs no inline script or style: CSP script-src 'self'; style-src 'self'. */
'''
MHEAD=HEAD.replace('Load after the markup and call pbInit()','ES module: import pbInit (default export) and call it after the markup loads').replace(
  'or add data-pb-auto to this script tag to run pbInit() on DOMContentLoaded. ','').replace('Also exposes','Also exports')
AUTO='''(function(s){if(!s||!s.hasAttribute('data-pb-auto'))return;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){pbInit();});else pbInit();})(document.currentScript);
'''
EXPORTS=['pbInit','pbConfirm','pbToast','pbInbox','pbTheme','pbPlace','pbCalendar','pbClock','pbQRSvg','pbQRCode','pbVirtual','pbAnsi','pbCronParse','pbSection','pbHook','pbEsc','pbStyled','pbStrings','pbId',
  # Documented functions apps call directly (A13), and the shared helpers.
  'pbChartHover','pbCronHuman','pbCronNext','pbMarkdown','pbScrollRegion','pbRelTime','pbPopovers','pbCodeHL','pbCodeArea','pbQR','pbPlayer','pbVars',
  'pbListKeys','pbAnnounce','pbKey','pbMark','pbEmit','pbFocusNear','pbStrength','pbTip']
body=S.bundle(); S.check('patchbay.js',body)
miss=[e for e in EXPORTS if e not in S.defined(body)]
if miss: S.ERR.append('patchbay.mjs exports undefined '+', '.join(miss))
open(ROOT+'/gen/patchbay.js','w').write(HEAD+body+AUTO)
open(ROOT+'/gen/patchbay.mjs','w').write(MHEAD+body+'export { '+', '.join(EXPORTS)+' };\nexport default pbInit;\n')
if S.ERR: raise SystemExit('\n'.join(S.ERR))
