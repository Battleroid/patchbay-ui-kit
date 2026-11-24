"""Shared by every generator: ROOT is the tree they build in (the folder holding gen/, ds/, kit/ ...).
It comes from PB_WORK, or from this file's own location, so nothing is hard-coded.
Importing this also makes text files read and write without newline translation, so a build on Windows gives the same bytes as on Linux."""
import builtins, os

ROOT = (os.environ.get('PB_WORK') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/')

_open = builtins.open
def _open_lf(file, mode='r', *a, **kw):
    if 'b' not in mode and len(a) < 3: kw.setdefault('newline', '')
    return _open(file, mode, *a, **kw)
builtins.open = _open_lf
