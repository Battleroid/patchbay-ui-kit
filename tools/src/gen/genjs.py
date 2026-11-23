# Writes patchbay.js: pv/_core.js, the shared behaviors and the pbHook list from pv/_hooks.js, in scripts.json order.
import sys; sys.path.insert(0,'/home/claude/gen')
import pbscripts as S
HEAD='''/* Patchbay behaviors. Load after the markup and call pbInit() (or pbInit(el) for markup added later; it binds each element once),
   or add data-pb-auto to this script tag to run pbInit() on DOMContentLoaded. pbInit(root, {only, skip}) limits it by hook name (pbInit.hooks).
   Also exposes pbConfirm(), pbToast(), pbInbox(), pbCalendar(), pbClock(), pbTheme(), pbQRSvg(), pbQRCode(), pbPlace(), pbVirtual(), pbAnsi(), pbCronParse(), pbEsc() and pbStyled() for app code. */
'''
AUTO='''(function(s){if(!s||!s.hasAttribute('data-pb-auto'))return;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){pbInit();});else pbInit();})(document.currentScript);
'''
body=S.bundle(); S.check('patchbay.js',body)
open('/home/claude/gen/patchbay.js','w').write(HEAD+body+AUTO)
if S.ERR: raise SystemExit('\n'.join(S.ERR))
