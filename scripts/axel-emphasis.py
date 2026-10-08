"""Final typography pass: strong chapter/question cards and explicit metadata widths."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
p=root/'.mindstudio/studio'/json.loads((root/'.mindstudio/axel-work/project.json').read_text())['id']
for b in json.loads((p/'storyboard.json').read_text()):
 f=p/'compositions'/(b['id']+'.html');s=f.read_text()
 if 'font-size:220px' in s:continue
 extra='.meta{width:850px;white-space:nowrap}.footer{width:260px;text-align:right}'
 if b['visual'] in ['number','date','question','rewind','words','quote','statement']:
  extra+='.copy{width:1135px;top:210px}.copy h1{font-size:88px;line-height:1.05}.copy h2{font-size:46px;line-height:1.18}'
 if b['visual']=='number':extra+='.copy{top:130px}.copy h1{font-size:220px;letter-spacing:-10px}.copy h2{font-size:52px}'
 if extra not in s:f.write_text(s.replace('</style>',extra+'</style>'))
