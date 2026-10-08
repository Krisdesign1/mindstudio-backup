from pathlib import Path
import importlib.util,json
root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('art',root/'scripts/nourrir-art.py');art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
p=root/'.mindstudio/studio/free-nourrir-thumbnail';p.mkdir(parents=True,exist_ok=True)
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">{art.DEFS}<defs><radialGradient id="halo"><stop stop-color="#47736a"/><stop offset="1" stop-color="#102d2b"/></radialGradient></defs>
<rect width="1920" height="1080" fill="#102d2b"/><ellipse cx="380" cy="580" rx="650" ry="720" fill="url(#halo)"/>
{art.person('host',380,455,1.8,'f','rest','sad')}
<g id="thumbnail-headline" font-family="Arial, sans-serif" font-weight="900"><text x="755" y="205" font-size="148" fill="#fff3d9">TU NOURRIS</text><text x="755" y="350" font-size="112" fill="#f4c768">CE QUI TE PIÈGE</text></g>
<ellipse cx="1440" cy="730" rx="425" ry="275" fill="#28534b"/>
<g id="floating-video" transform="translate(960 525) rotate(-14)"><rect width="320" height="205" rx="25" fill="#b4775d" stroke="#e2a17b" stroke-width="7"/><path d="M125 48L125 152L215 100Z" fill="#fff3d9"/></g>
<g id="floating-chat" transform="translate(1570 475) rotate(12)"><rect width="230" height="145" rx="25" fill="#e2c58d"/><path d="M38 48H182M38 80H135" stroke="#375e52" stroke-width="13" stroke-linecap="round"/><path d="M45 135V177L100 135" fill="#e2c58d"/></g>
<g transform="rotate(9 1410 735)">{art.phone(1410,425,.92,'feed')}</g>
<path d="M1175 465C975 720 1125 990 1420 982C1675 975 1770 785 1710 665" fill="none" stroke="#f4c768" stroke-width="25" stroke-linecap="round"/>
<path d="M1660 698L1705 625L1756 691" fill="none" stroke="#f4c768" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M875 785L915 762M967 921L1000 945M1790 840L1823 847" stroke="#c38969" stroke-width="10" stroke-linecap="round"/>

</svg>'''
(p/'index.html').write_text('''<!doctype html><html><head><meta charset="utf-8"><title>Miniature — Ce que tu nourris</title><style>html,body{margin:0;background:#102d2b}#main{width:1280px;height:720px;overflow:hidden}svg{display:block;width:1280px;height:720px}</style></head><body><main id="main" data-composition-id="main" data-no-timeline data-start="0" data-duration="1" data-width="1280" data-height="720">'''+svg+'</main></body></html>')
(p/'mindstudio-project.json').write_text(json.dumps({'id':p.name,'name':'Miniature · Ce que tu nourris','createdAt':'2026-10-05T00:00:00+00:00'},ensure_ascii=False))
print(p)
