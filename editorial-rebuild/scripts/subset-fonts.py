"""Create smaller, renamed OFL subsets for this site's actual Korean copy.

Original source fonts and their licenses remain in creative-rebuild/public/fonts.
FontTools is only needed to regenerate these committed assets, not to build the site.
Unsupported visitor input uses the system fallback font.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root.parent / 'creative-rebuild/public/fonts'
text = ''.join(path.read_text() for path in (root / 'src').glob('*.js'))
text += ''.join(chr(code) for code in range(32, 127)) + '가나다라마바사아자차카타파하₩→↗↘↓↑×·–—“”‘’…'
for filename, output, family in [
    ('PretendardVariable.woff2', 'KottoText.woff2', 'Kotto Text'),
    ('NotoSerifKR.woff2', 'KottoDisplay.woff2', 'Kotto Display'),
]:
    font = TTFont(source / filename)
    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    # The original copyright/license entries remain unchanged. Rename derived
    # families, especially Pretendard's Reserved Font Name, under OFL section 3.
    for record in font['name'].names:
        if record.nameID in (1, 4, 6, 16, 21):
            value = family.replace(' ', '') if record.nameID == 6 else family
            record.string = value.encode(record.getEncoding())
        elif record.nameID == 3:
            record.string = (family + ' website subset 1.0').encode(record.getEncoding())
    font.flavor = 'woff2'
    destination = root / 'public/fonts' / output
    font.save(destination)
    print(f'{output}: {destination.stat().st_size:,} bytes')
