"""Verify the actual HyperFrames delivery; never render or modify video/audio.

Usage: python3 scripts/athoms-short-verify-audio.py [optional-delivery-path]
Run only once the MP4 renderer has completed. Verification decodes in memory.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math
import re
import subprocess
import sys
import numpy as np
from scipy.signal import correlate, correlation_lags

ROOT=Path(__file__).resolve().parent.parent
PROJECT=ROOT/'.mindstudio/studio/free-4977ba0f-5a3c-4cd9-897d-473fe135d3f9'
DELIVERY=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else PROJECT/'delivery.mp4'
SOURCE=Path('/Users/user/Downloads/Tu_connais_Athom_s_Mbuma__53b76ed49f.wav')
SR=24000
DURATION=1582717/SR

def sha256(path):
    digest=hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b''):digest.update(chunk)
    return digest.hexdigest()

def probe(path):
    result=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)],capture_output=True,text=True,check=True)
    return json.loads(result.stdout)

def decode(path,return_channels=False):
    streams=probe(path)['streams']
    channels=next(s['channels'] for s in streams if s['codec_type']=='audio')
    # Do not use ffmpeg -ac 1 here: its automatic stereo downmix can add
    # sqrt(2) for dual-mono. An arithmetic L/R mean is the unity reference.
    result=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-ar',str(SR),'-c:a','pcm_f32le','-f','f32le','pipe:1'],capture_output=True,check=True)
    discrete=np.frombuffer(result.stdout,dtype='<f4').copy().reshape(-1,channels)
    averaged=discrete.mean(axis=1)
    return (averaged,discrete) if return_channels else averaged

def db(value):
    return float(20*np.log10(max(float(value),1e-12)))

def correlation(a,b):
    n=min(len(a),len(b))
    if n<3:return None
    a=a[:n].astype(np.float64); b=b[:n].astype(np.float64)
    a-=np.mean(a); b-=np.mean(b)
    divisor=math.sqrt(float(np.dot(a,a)*np.dot(b,b)))
    return float(np.dot(a,b)/divisor) if divisor>1e-18 else None

def find_lag(actual,expected):
    # Estimate over speech-rich first 12 s. Fourfold decimation limits memory.
    n=min(len(actual),len(expected),SR*12)
    a=actual[:n:4].astype(np.float64); b=expected[:n:4].astype(np.float64)
    a-=a.mean(); b-=b.mean()
    c=correlate(a,b,method='fft',mode='full')
    lags=correlation_lags(len(a),len(b),mode='full')
    allowed=np.abs(lags)<=round(.08*SR/4)
    coarse=int(lags[allowed][np.argmax(c[allowed])])*4
    # Refine the actual sample offset without trusting only the coarse grid.
    possibilities=[]
    for lag in range(coarse-5,coarse+6):
        aa,bb=aligned_arrays(actual[:n],expected[:n],lag)
        possibilities.append((correlation(aa,bb),lag))
    return max(possibilities)[1]

def aligned_arrays(actual,expected,lag):
    if lag>=0:
        n=min(len(actual)-lag,len(expected))
        return actual[lag:lag+n],expected[:n]
    n=min(len(actual),len(expected)+lag)
    return actual[:n],expected[-lag:-lag+n]

def loudness(path):
    result=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-map','0:a:0','-af','loudnorm=I=-16:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    match=re.search(r'\{\s*"input_i".*?\}',result.stderr,re.S)
    if not match:return {'error':'FFmpeg did not return loudness summary.'}
    raw=json.loads(match.group(0))
    return {key:float(raw[key]) for key in ['input_i','input_tp','input_lra','input_thresh']}

def main():
    if not DELIVERY.is_file():
        raise SystemExit('MP4 unavailable; no final verification has been claimed or written.')
    metadata=probe(DELIVERY)
    audio_streams=[s for s in metadata['streams'] if s['codec_type']=='audio']
    video_streams=[s for s in metadata['streams'] if s['codec_type']=='video']
    if not audio_streams:raise RuntimeError('Delivered MP4 has no audio stream.')
    originals={name:decode(PROJECT/path) for name,path in [('narration','narration-original.wav'),('music','music.wav'),('effects','effects.wav')]}
    n=max(map(len,originals.values()))
    tracks={name:np.pad(track,(0,n-len(track))) for name,track in originals.items()}
    expected=sum(tracks.values())
    actual,actual_channels=decode(DELIVERY,return_channels=True)
    lag=find_lag(actual,expected)
    aligned_actual,aligned_expected=aligned_arrays(actual,expected,lag)
    span=len(aligned_actual)
    aligned_tracks={name:aligned_arrays(actual,track,lag)[1] for name,track in tracks.items()}
    # Recover each component's gain from the real exported audio, not its metadata.
    order=['narration','music','effects']
    matrix=np.array([[float(np.dot(aligned_tracks[a].astype(np.float64),aligned_tracks[b].astype(np.float64))) for b in order] for a in order])
    rhs=np.array([float(np.dot(aligned_tracks[a].astype(np.float64),aligned_actual.astype(np.float64))) for a in order])
    coefficients=np.linalg.solve(matrix,rhs)
    unity_gain=float(np.dot(aligned_actual.astype(np.float64),aligned_expected.astype(np.float64))/np.dot(aligned_expected.astype(np.float64),aligned_expected.astype(np.float64)))
    residual=aligned_actual-unity_gain*aligned_expected
    windows=[('opening',0,8),('middle',29,37),('ending',57,65.80),('finalAmen',65.393875,65.800333)]
    checks=[]
    for name,start,end in windows:
        lo=round(start*SR); hi=min(round(end*SR),span)
        target=aligned_expected[lo:hi]; observed=aligned_actual[lo:hi]
        voice=aligned_tracks['narration'][lo:hi]
        checks.append({'region':name,'start':start,'end':end,'samples':len(observed),
            'expectedMixCorrelation':correlation(observed,target),'narrationCorrelation':correlation(observed,voice),
            'actualRmsDb':db(np.sqrt(np.mean(observed**2))) if len(observed) else None,
            'expectedRmsDb':db(np.sqrt(np.mean(target**2))) if len(target) else None,
            'covered':hi>=round(end*SR)})
    source_hash=sha256(SOURCE)
    preserved_hash=sha256(PROJECT/'narration-original.wav')
    measured=loudness(DELIVERY)
    peak=float(np.max(np.abs(actual_channels)))
    source_intact=source_hash==preserved_hash
    full_duration=len(actual)/SR>=DURATION-.002
    regions_match=all(c['covered'] and (c['expectedMixCorrelation'] or 0)>.985 for c in checks)
    gains={name:float(value) for name,value in zip(order,coefficients)}
    proper_mix=.90<unity_gain<1.10 and .90<gains['narration']<1.10 and .65<gains['music']<1.35 and .35<gains['effects']<1.65
    shift_ok=abs(lag)/SR<.006
    true_peak=measured.get('input_tp')
    no_saturation=int(np.sum(np.abs(actual_channels)>=1))==0 and (true_peak is None or true_peak<0)
    video=video_streams[0] if video_streams else {}
    rational=video.get('avg_frame_rate','0/1').split('/')
    fps=float(rational[0])/float(rational[1]) if len(rational)==2 and float(rational[1]) else 0
    format_ok=video.get('codec_name')=='h264' and video.get('width')==1080 and video.get('height')==1920 and abs(fps-24)<.001 and audio_streams[0].get('codec_name')=='aac'
    passed=all([source_intact,full_duration,regions_match,proper_mix,shift_ok,no_saturation,format_ok])
    report={'verifiedAt':datetime.now(timezone.utc).isoformat(),'delivery':str(DELIVERY.relative_to(ROOT)) if DELIVERY.is_relative_to(ROOT) else str(DELIVERY),
        'deliverySha256':sha256(DELIVERY),'actualFileInspected':True,'result':'pass' if passed else 'needs-review',
        'sourceSha256':source_hash,'preservedSourceSha256':preserved_hash,'sourceIntact':source_intact,
        'expectedNarrationDuration':DURATION,'expectedSourceSamples':1582717,'decodedSampleRate':SR,
        'decodedActualSamples':len(actual),'decodedActualDuration':len(actual)/SR,'fullSourceDurationCovered':full_duration,
        'measuredLagSamples':lag,'measuredLagSeconds':lag/SR,'timelineShiftAcceptable':shift_ok,
        'comparison':'Decode delivered AAC as discrete 24 kHz float channels, then arithmetic channel mean (stereo: 0.5L+0.5R, not FFmpeg default power downmix); compare with independent unity-gain sum of the three project WAVs. Saturation is checked on discrete channels plus native-stream true peak. Scale-invariant correlations plus recovered component gains distinguish matching content from missing music/effects.',
        'expectedMixVolume':{'narration':1,'music':1,'effects':1},'measuredOverallLinearGain':unity_gain,
        'measuredComponentGains':gains,'mixGainsAcceptable':proper_mix,
        'globalMixCorrelation':correlation(aligned_actual,aligned_expected),'regions':checks,'allRegionsMatch':regions_match,
        'samplePeakDb':db(peak),'sampleRmsDb':db(np.sqrt(np.mean(actual**2))),
        'channelPeakDb':[db(np.max(np.abs(actual_channels[:,i]))) for i in range(actual_channels.shape[1])],
        'channelMixCorrelations':[correlation(*aligned_arrays(actual_channels[:,i],expected,lag)) for i in range(actual_channels.shape[1])],
        'samplesAtOrOverUnity':int(np.sum(np.abs(actual_channels)>=1)),'samplesAtOrOverPoint999':int(np.sum(np.abs(actual_channels)>=.999)),
        'noSaturationMeasured':no_saturation,'loudness':measured,'scaledResidualRmsDb':db(np.sqrt(np.mean(residual**2))),
        'video':{'codec':video.get('codec_name'),'width':video.get('width'),'height':video.get('height'),'fps':fps,'duration':video.get('duration')},
        'audio':{'codec':audio_streams[0].get('codec_name'),'sampleRate':audio_streams[0].get('sample_rate'),'channels':audio_streams[0].get('channels'),'duration':audio_streams[0].get('duration'),'bitRate':audio_streams[0].get('bit_rate')},
        'metadataFormatValid':format_ok,'containerDuration':metadata['format'].get('duration'),
        'limits':'Numerical source/mix/timing/cadence verification does not replace visual inspection or a human assessment of intelligibility, musical taste, and the two documented ASR wording uncertainties.'}
    (PROJECT/'final-audio-quality.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'result':report['result'],'sourceIntact':source_intact,'decodedDuration':report['decodedActualDuration'],
        'lagSeconds':lag/SR,'overallGain':unity_gain,'componentGains':gains,'globalCorrelation':report['globalMixCorrelation'],
        'regions':[{'region':r['region'],'correlation':r['expectedMixCorrelation'],'covered':r['covered']} for r in checks],
        'truePeakDb':true_peak,'integratedLufs':measured.get('input_i'),'report':str(PROJECT/'final-audio-quality.json')},ensure_ascii=False,indent=2))
    return 0 if passed else 2

if __name__=='__main__':
    raise SystemExit(main())
