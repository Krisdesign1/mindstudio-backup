from pathlib import Path
import re,json
root=Path(__file__).resolve().parent.parent
p=root/'.mindstudio/studio'/json.loads((root/'.mindstudio/axel-work/project.json').read_text())['id']
for f in (p/'compositions').glob('*.html'):
 s=f.read_text();cid=f.stem
 main=re.search(r'<main[^>]*class="([^"]*)"',s).group(1)
 def rule(m):
  selectors,body=m.group(1),m.group(2)
  if '.big' in selectors:
   if 'big' not in main:return ''
   selectors=selectors.replace('#'+cid+'.big ', '').replace('.big ','')
  if '.paper' in selectors:
   if 'paper' not in main:return ''
   selectors=selectors.replace('#'+cid+'.paper ', '').replace('.paper ','').replace('#'+cid+'.paper','#'+cid).replace('.paper','#'+cid)
  return selectors+'{'+body+'}'
 style=re.search(r'<style>(.*?)</style>',s,re.S)
 css=re.sub(r'([^{}]+)\{([^{}]*)\}',rule,style.group(1))
 s=s[:style.start(1)]+css+s[style.end(1):]
 s=re.sub(r'(<main[^>]*class=")[^"]*',r'\1frame',s)
 f.write_text(s)
